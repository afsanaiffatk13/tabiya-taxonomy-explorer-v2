# Neo4j Aura Import Guide

## Files Included

- `neo4j-nodes.csv` - 20 occupations + 30 skills
- `neo4j-relationships.csv` - 88 occupation-skill relationships

## Sample Data Overview

**Occupations (20):**
- Agriculture: Crop Farmer, Rice Farmer, Wheat Farmer, Vegetable Grower, Gardener
- Livestock: Livestock Farmer, Poultry Farmer, Dairy Farmer
- Tech: Software Developer, Web Developer, Data Analyst
- Unseen Economy: Caregiver (Elderly), Caregiver (Children), Home Manager, Community Volunteer
- Food/Service: Chef, Baker, Waiter
- Professional: Nurse, Teacher

**Skills (30):**
- Agricultural: Soil Preparation, Planting, Irrigation, Harvest, Pest Control, Crop Rotation
- Animal: Animal Husbandry, Feeding, Milking
- Tech: Programming, Databases, Web Technologies, Data Analysis, Machine Learning
- Care: Patient Care, Medication, Elderly Care, Child Development
- Transversal: Communication, Problem Solving, Time Management, Teamwork, Leadership
- Food: Cooking, Food Safety, Menu Planning, Baking, Customer Service
- Education: Teaching Methods, Curriculum Development

---

## Import to Neo4j Aura

### Option 1: Data Importer (Easiest)

1. Go to your Neo4j Aura console
2. Click **Import** in the left sidebar
3. Click **Open model** → **New file import**
4. Drag and drop both CSV files
5. Map the data:

**For Nodes:**
- Create two node types: `Occupation` and `Skill`
- Use `:LABEL` column to determine type
- Map: `id:ID` → id property, `name` → name, `code` → code, `type` → type

**For Relationships:**
- Relationship type: `REQUIRES_SKILL`
- Map: `:START_ID` → from Occupation, `:END_ID` → to Skill
- Properties: `relationType`, `signallingValue`

### Option 2: Cypher LOAD CSV

If you host the files publicly, run these queries:

```cypher
// Create constraints
CREATE CONSTRAINT occ_id IF NOT EXISTS FOR (o:Occupation) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

// Load nodes (replace URL with your hosted file)
LOAD CSV WITH HEADERS FROM 'https://your-url/neo4j-nodes.csv' AS row
WITH row WHERE row.`:LABEL` = 'Occupation'
CREATE (o:Occupation {id: row.`id:ID`, name: row.name, code: row.code, type: row.type});

LOAD CSV WITH HEADERS FROM 'https://your-url/neo4j-nodes.csv' AS row
WITH row WHERE row.`:LABEL` = 'Skill'
CREATE (s:Skill {id: row.`id:ID`, name: row.name, code: row.code, type: row.type});

// Load relationships
LOAD CSV WITH HEADERS FROM 'https://your-url/neo4j-relationships.csv' AS row
MATCH (o:Occupation {id: row.`:START_ID`})
MATCH (s:Skill {id: row.`:END_ID`})
CREATE (o)-[:REQUIRES_SKILL {relationType: row.relationType, signallingValue: toFloat(row.signallingValue)}]->(s);
```

---

## Sample Queries for Visualization

```cypher
// View a single occupation with its skills
MATCH (o:Occupation {name: 'Crop Farmer'})-[r:REQUIRES_SKILL]->(s:Skill)
RETURN o, r, s;

// Find shared skills between occupations
MATCH (o1:Occupation)-[:REQUIRES_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(o2:Occupation)
WHERE o1.name < o2.name
RETURN o1.name, s.name, o2.name
LIMIT 20;

// All essential skills for an occupation
MATCH (o:Occupation)-[r:REQUIRES_SKILL {relationType: 'essential'}]->(s:Skill)
WHERE o.name = 'Software Developer'
RETURN o, r, s;

// Occupations sharing most skills
MATCH (o1:Occupation)-[:REQUIRES_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(o2:Occupation)
WHERE o1 <> o2
WITH o1, o2, count(s) AS sharedSkills
WHERE sharedSkills > 2
RETURN o1.name, o2.name, sharedSkills
ORDER BY sharedSkills DESC;

// Compare seen vs unseen economy skills
MATCH (o:Occupation)-[:REQUIRES_SKILL]->(s:Skill)
RETURN o.type AS economyType, s.name AS skill, count(*) AS occurrences
ORDER BY economyType, occurrences DESC;
```

---

## Tips for Visualization Design

Use Neo4j Bloom to explore:
1. **Layout**: Try different arrangements (force-directed, hierarchical, circular)
2. **Node sizing**: By degree (connections) or by type
3. **Colors**: Green for occupations, blue for skills (matches Tabiya design)
4. **Edge styling**: Solid for essential, dashed for optional
5. **Grouping**: Cluster by occupation type (seen/unseen) or skill type

Take screenshots of layouts you like and share them!
