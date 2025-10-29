"""
Generate semantic embeddings for Tabiya taxonomy items.
This script downloads the latest taxonomy data from GitHub and creates
embeddings using the same model that will be used in the browser.

Output: data/embeddings.json.gz (compressed ~5MB)
"""

from sentence_transformers import SentenceTransformer
import pandas as pd
import json
import gzip
import requests
from io import StringIO
from tqdm import tqdm
import os

# Configuration
MODEL_NAME = 'all-MiniLM-L6-v2'  # Same model as Transformers.js will use
GITHUB_BASE_URL = 'https://raw.githubusercontent.com/tabiya-tech/taxonomy-model-application/main/data-sets/csv'
OUTPUT_FILE = 'data/embeddings.json.gz'

def detect_latest_version():
    """Auto-detect the latest dataset version from GitHub API"""
    api_url = 'https://api.github.com/repos/tabiya-tech/taxonomy-model-application/contents/data-sets/csv'
    response = requests.get(api_url)
    folders = response.json()
    
    # Filter base datasets (not localized)
    base_datasets = [f['name'] for f in folders if f['type'] == 'dir' and 'esco' in f['name'].lower()]
    
    # Sort by version (assumes semantic versioning)
    base_datasets.sort(reverse=True)
    
    print(f"✓ Found {len(base_datasets)} dataset versions")
    print(f"✓ Using latest: {base_datasets[0]}")
    
    return base_datasets[0]

def load_csv_from_github(dataset_folder, filename):
    """Load CSV file from GitHub"""
    url = f"{GITHUB_BASE_URL}/{dataset_folder}/{filename}"
    print(f"  Loading {filename}...")
    response = requests.get(url)
    response.raise_for_status()
    return pd.read_csv(StringIO(response.text))

def create_embeddings_for_items(model, items, item_type):
    """Generate embeddings for a list of items"""
    embeddings_list = []
    
    print(f"\nGenerating embeddings for {len(items)} {item_type}...")
    
    for _, item in tqdm(items.iterrows(), total=len(items)):
        # Create text to embed (label + alternative labels for better matching)
        text_parts = [item['PREFERREDLABEL']]
        
        if pd.notna(item.get('ALTLABELS')) and item['ALTLABELS']:
            # Include alt labels for richer semantic matching
            alt_labels = item['ALTLABELS'].split('\n')[0]  # First alt label only
            if alt_labels.strip():
                text_parts.append(alt_labels.strip())
        
        text_to_embed = ' | '.join(text_parts)
        
        # Generate embedding
        embedding = model.encode(text_to_embed, show_progress_bar=False)
        
        # Create result object
        result = {
            'id': str(item['ID']),  # MongoDB ObjectId as string
            'label': item['PREFERREDLABEL'],
            'embedding': embedding.tolist(),
            'type': item_type
        }
        
        # Add code if it exists
        if 'CODE' in item and pd.notna(item['CODE']):
            result['code'] = str(item['CODE'])
        
        # Add description preview if it exists
        if 'DESCRIPTION' in item and pd.notna(item['DESCRIPTION']):
            result['description'] = str(item['DESCRIPTION'])[:100]
        
        embeddings_list.append(result)
    
    return embeddings_list

def main():
    print("=" * 60)
    print("TABIYA TAXONOMY - EMBEDDING GENERATION")
    print("=" * 60)
    
    # Step 1: Detect latest version
    print("\n[1/6] Detecting latest taxonomy version...")
    dataset_folder = detect_latest_version()
    
    # Step 2: Load model
    print("\n[2/6] Loading SentenceTransformer model...")
    print(f"  Model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    print("  ✓ Model loaded")
    
    # Step 3: Load taxonomy data
    print("\n[3/6] Loading taxonomy data from GitHub...")
    df_occupations = load_csv_from_github(dataset_folder, 'occupations.csv')
    df_occupation_groups = load_csv_from_github(dataset_folder, 'occupation_groups.csv')
    df_skills = load_csv_from_github(dataset_folder, 'skills.csv')
    df_skill_groups = load_csv_from_github(dataset_folder, 'skill_groups.csv')
    
    print(f"  ✓ Loaded {len(df_occupations)} occupations")
    print(f"  ✓ Loaded {len(df_occupation_groups)} occupation groups")
    print(f"  ✓ Loaded {len(df_skills)} skills")
    print(f"  ✓ Loaded {len(df_skill_groups)} skill groups")
    
    # Step 4: Generate embeddings
    print("\n[4/6] Generating embeddings...")
    
    all_embeddings = {
        'occupations': [],
        'skills': [],
        'metadata': {
            'model': MODEL_NAME,
            'dataset_version': dataset_folder,
            'total_items': 0
        }
    }
    
    # Occupations (individual items)
    occ_embeddings = create_embeddings_for_items(model, df_occupations, 'occupation')
    all_embeddings['occupations'].extend(occ_embeddings)
    
    # Occupation groups (searchable containers)
    group_embeddings = create_embeddings_for_items(model, df_occupation_groups, 'group')
    all_embeddings['occupations'].extend(group_embeddings)
    
    # Skills (individual items)
    skill_embeddings = create_embeddings_for_items(model, df_skills, 'skill')
    all_embeddings['skills'].extend(skill_embeddings)
    
    # Skill groups (searchable containers)
    skill_group_embeddings = create_embeddings_for_items(model, df_skill_groups, 'skillgroup')
    all_embeddings['skills'].extend(skill_group_embeddings)
    
    all_embeddings['metadata']['total_items'] = (
        len(occ_embeddings) + len(group_embeddings) + 
        len(skill_embeddings) + len(skill_group_embeddings)
    )
    
    # Step 5: Save compressed file
    print("\n[5/6] Saving embeddings...")
    os.makedirs('data', exist_ok=True)
    
    json_str = json.dumps(all_embeddings)
    uncompressed_size = len(json_str)
    
    with gzip.open(OUTPUT_FILE, 'wt', encoding='utf-8') as f:
        f.write(json_str)
    
    compressed_size = os.path.getsize(OUTPUT_FILE)
    compression_ratio = (1 - compressed_size / uncompressed_size) * 100
    
    print(f"  ✓ Saved to {OUTPUT_FILE}")
    print(f"  Uncompressed: {uncompressed_size / 1024 / 1024:.1f} MB")
    print(f"  Compressed: {compressed_size / 1024 / 1024:.1f} MB")
    print(f"  Compression: {compression_ratio:.1f}%")
    
    # Step 6: Summary
    print("\n[6/6] Summary")
    print("=" * 60)
    print(f"✓ Total items embedded: {all_embeddings['metadata']['total_items']:,}")
    print(f"✓ Occupations: {len(all_embeddings['occupations']):,}")
    print(f"✓ Skills: {len(all_embeddings['skills']):,}")
    print(f"✓ Output file: {OUTPUT_FILE} ({compressed_size / 1024 / 1024:.1f} MB)")
    print(f"✓ Model: {MODEL_NAME}")
    print(f"✓ Dataset: {dataset_folder}")
    print("\n✓ Embeddings ready for deployment!")
    print("=" * 60)

if __name__ == '__main__':
    main()