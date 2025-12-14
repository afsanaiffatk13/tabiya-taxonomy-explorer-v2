
// Neo4j Aura Import Instructions
// ================================
//
// Option 1: Use Neo4j Data Importer (recommended for Aura)
// - Go to your Aura instance
// - Click "Import" in the left sidebar
// - Upload neo4j-nodes.csv and neo4j-relationships.csv
// - Map the columns as follows:
//   Nodes: id -> ID property, name -> name, code -> code, :LABEL -> label
//   Relationships: :START_ID -> start node, :END_ID -> end node, :TYPE -> relationship type
//
// Option 2: Use Cypher LOAD CSV (if you host the files)
// Upload the CSV files to a web server, then run:

// Create constraints first
CREATE CONSTRAINT occupation_id IF NOT EXISTS FOR (o:Occupation) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

// Load occupations
LOAD CSV WITH HEADERS FROM 'file:///neo4j-nodes.csv' AS row
WITH row WHERE row.`:LABEL` = 'Occupation'
CREATE (o:Occupation {id: row.`id:ID`, name: row.name, code: row.code, description: row.description});

// Load skills
LOAD CSV WITH HEADERS FROM 'file:///neo4j-nodes.csv' AS row
WITH row WHERE row.`:LABEL` = 'Skill'
CREATE (s:Skill {id: row.`id:ID`, name: row.name, code: row.code, description: row.description});

// Load relationships
LOAD CSV WITH HEADERS FROM 'file:///neo4j-relationships.csv' AS row
MATCH (o:Occupation {id: row.`:START_ID`})
MATCH (s:Skill {id: row.`:END_ID`})
CREATE (o)-[:REQUIRES_SKILL {relationType: row.relationType, signallingValue: toFloat(row.signallingValue)}]->(s);

// Sample queries to explore:
// Show an occupation and its skills
MATCH (o:Occupation)-[r:REQUIRES_SKILL]->(s:Skill)
WHERE o.code = '2511.1'
RETURN o, r, s;

// Find occupations that share skills
MATCH (o1:Occupation)-[:REQUIRES_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(o2:Occupation)
WHERE o1 <> o2
RETURN o1.name, s.name, o2.name
LIMIT 20;
