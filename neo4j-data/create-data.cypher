// =====================================================
// TABIYA TAXONOMY SAMPLE DATA FOR NEO4J AURA
// Copy and paste this entire script into Neo4j Query
// =====================================================

// Step 1: Create Occupations
CREATE (o1:Occupation {id: 'occ-1', name: 'Crop Farmer', code: '6111.1', type: 'seen'})
CREATE (o2:Occupation {id: 'occ-2', name: 'Rice Farmer', code: '6111.2', type: 'seen'})
CREATE (o3:Occupation {id: 'occ-3', name: 'Wheat Farmer', code: '6111.3', type: 'seen'})
CREATE (o4:Occupation {id: 'occ-4', name: 'Vegetable Grower', code: '6112.1', type: 'seen'})
CREATE (o5:Occupation {id: 'occ-5', name: 'Gardener', code: '6113.1', type: 'seen'})
CREATE (o6:Occupation {id: 'occ-6', name: 'Livestock Farmer', code: '6121.1', type: 'seen'})
CREATE (o7:Occupation {id: 'occ-7', name: 'Poultry Farmer', code: '6122.1', type: 'seen'})
CREATE (o8:Occupation {id: 'occ-8', name: 'Dairy Farmer', code: '6121.2', type: 'seen'})
CREATE (o9:Occupation {id: 'occ-9', name: 'Software Developer', code: '2512.1', type: 'seen'})
CREATE (o10:Occupation {id: 'occ-10', name: 'Web Developer', code: '2513.1', type: 'seen'})
CREATE (o11:Occupation {id: 'occ-11', name: 'Data Analyst', code: '2511.1', type: 'seen'})
CREATE (o12:Occupation {id: 'occ-12', name: 'Caregiver (Elderly)', code: 'I1.1', type: 'unseen'})
CREATE (o13:Occupation {id: 'occ-13', name: 'Caregiver (Children)', code: 'I1.2', type: 'unseen'})
CREATE (o14:Occupation {id: 'occ-14', name: 'Home Manager', code: 'I2.1', type: 'unseen'})
CREATE (o15:Occupation {id: 'occ-15', name: 'Community Volunteer', code: 'I3.1', type: 'unseen'})
CREATE (o16:Occupation {id: 'occ-16', name: 'Chef', code: '5120.1', type: 'seen'})
CREATE (o17:Occupation {id: 'occ-17', name: 'Baker', code: '7512.1', type: 'seen'})
CREATE (o18:Occupation {id: 'occ-18', name: 'Waiter', code: '5131.1', type: 'seen'})
CREATE (o19:Occupation {id: 'occ-19', name: 'Nurse', code: '2221.1', type: 'seen'})
CREATE (o20:Occupation {id: 'occ-20', name: 'Teacher', code: '2330.1', type: 'seen'})

// Step 2: Create Skills
CREATE (s1:Skill {id: 'skill-1', name: 'Soil Preparation', code: 'S1.1', type: 'technical'})
CREATE (s2:Skill {id: 'skill-2', name: 'Planting Techniques', code: 'S1.2', type: 'technical'})
CREATE (s3:Skill {id: 'skill-3', name: 'Irrigation Management', code: 'S1.3', type: 'technical'})
CREATE (s4:Skill {id: 'skill-4', name: 'Harvest Techniques', code: 'S1.4', type: 'technical'})
CREATE (s5:Skill {id: 'skill-5', name: 'Pest Control', code: 'S1.5', type: 'technical'})
CREATE (s6:Skill {id: 'skill-6', name: 'Crop Rotation', code: 'S1.6', type: 'technical'})
CREATE (s7:Skill {id: 'skill-7', name: 'Animal Husbandry', code: 'S2.1', type: 'technical'})
CREATE (s8:Skill {id: 'skill-8', name: 'Animal Feeding', code: 'S2.2', type: 'technical'})
CREATE (s9:Skill {id: 'skill-9', name: 'Milking Techniques', code: 'S2.3', type: 'technical'})
CREATE (s10:Skill {id: 'skill-10', name: 'Programming Languages', code: 'S3.1', type: 'technical'})
CREATE (s11:Skill {id: 'skill-11', name: 'Database Management', code: 'S3.2', type: 'technical'})
CREATE (s12:Skill {id: 'skill-12', name: 'Web Technologies', code: 'S3.3', type: 'technical'})
CREATE (s13:Skill {id: 'skill-13', name: 'Data Analysis', code: 'S3.4', type: 'technical'})
CREATE (s14:Skill {id: 'skill-14', name: 'Machine Learning', code: 'S3.5', type: 'technical'})
CREATE (s15:Skill {id: 'skill-15', name: 'Patient Care', code: 'S4.1', type: 'technical'})
CREATE (s16:Skill {id: 'skill-16', name: 'Medication Administration', code: 'S4.2', type: 'technical'})
CREATE (s17:Skill {id: 'skill-17', name: 'Elderly Care', code: 'S4.3', type: 'technical'})
CREATE (s18:Skill {id: 'skill-18', name: 'Child Development', code: 'S4.4', type: 'technical'})
CREATE (s19:Skill {id: 'skill-19', name: 'Communication', code: 'T1', type: 'transversal'})
CREATE (s20:Skill {id: 'skill-20', name: 'Problem Solving', code: 'T2', type: 'transversal'})
CREATE (s21:Skill {id: 'skill-21', name: 'Time Management', code: 'T3', type: 'transversal'})
CREATE (s22:Skill {id: 'skill-22', name: 'Teamwork', code: 'T4', type: 'transversal'})
CREATE (s23:Skill {id: 'skill-23', name: 'Leadership', code: 'T5', type: 'transversal'})
CREATE (s24:Skill {id: 'skill-24', name: 'Cooking Techniques', code: 'S5.1', type: 'technical'})
CREATE (s25:Skill {id: 'skill-25', name: 'Food Safety', code: 'S5.2', type: 'technical'})
CREATE (s26:Skill {id: 'skill-26', name: 'Menu Planning', code: 'S5.3', type: 'technical'})
CREATE (s27:Skill {id: 'skill-27', name: 'Baking', code: 'S5.4', type: 'technical'})
CREATE (s28:Skill {id: 'skill-28', name: 'Customer Service', code: 'S6.1', type: 'technical'})
CREATE (s29:Skill {id: 'skill-29', name: 'Teaching Methods', code: 'S7.1', type: 'technical'})
CREATE (s30:Skill {id: 'skill-30', name: 'Curriculum Development', code: 'S7.2', type: 'technical'})

// Step 3: Create Relationships
// Crop Farmer
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s1)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s2)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s3)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s4)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s5)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s6)
CREATE (o1)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.4}]->(s19)

// Rice Farmer
CREATE (o2)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s1)
CREATE (o2)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s2)
CREATE (o2)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s3)
CREATE (o2)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s4)

// Wheat Farmer
CREATE (o3)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s1)
CREATE (o3)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s2)
CREATE (o3)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s4)
CREATE (o3)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.7}]->(s6)

// Vegetable Grower
CREATE (o4)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s1)
CREATE (o4)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s2)
CREATE (o4)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s3)
CREATE (o4)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.75}]->(s5)

// Gardener
CREATE (o5)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.7}]->(s1)
CREATE (o5)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s2)
CREATE (o5)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s5)
CREATE (o5)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.4}]->(s19)

// Livestock Farmer
CREATE (o6)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s7)
CREATE (o6)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s8)
CREATE (o6)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.4}]->(s1)
CREATE (o6)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.3}]->(s19)

// Poultry Farmer
CREATE (o7)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s7)
CREATE (o7)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s8)
CREATE (o7)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s21)

// Dairy Farmer
CREATE (o8)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s7)
CREATE (o8)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s8)
CREATE (o8)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s9)
CREATE (o8)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s21)

// Software Developer
CREATE (o9)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s10)
CREATE (o9)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s11)
CREATE (o9)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s20)
CREATE (o9)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s22)
CREATE (o9)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s19)

// Web Developer
CREATE (o10)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s10)
CREATE (o10)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s12)
CREATE (o10)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s11)
CREATE (o10)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.7}]->(s20)

// Data Analyst
CREATE (o11)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s13)
CREATE (o11)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s11)
CREATE (o11)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s14)
CREATE (o11)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s20)
CREATE (o11)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s19)

// Caregiver (Elderly) - UNSEEN ECONOMY
CREATE (o12)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s17)
CREATE (o12)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s15)
CREATE (o12)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s19)
CREATE (o12)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s21)

// Caregiver (Children) - UNSEEN ECONOMY
CREATE (o13)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s18)
CREATE (o13)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s15)
CREATE (o13)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s19)
CREATE (o13)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s21)

// Home Manager - UNSEEN ECONOMY
CREATE (o14)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s21)
CREATE (o14)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s20)
CREATE (o14)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s19)
CREATE (o14)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s23)

// Community Volunteer - UNSEEN ECONOMY
CREATE (o15)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s19)
CREATE (o15)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s22)
CREATE (o15)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.7}]->(s23)
CREATE (o15)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s21)

// Chef
CREATE (o16)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s24)
CREATE (o16)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s25)
CREATE (o16)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.8}]->(s26)
CREATE (o16)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s21)
CREATE (o16)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s23)

// Baker
CREATE (o17)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s27)
CREATE (o17)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.7}]->(s24)
CREATE (o17)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s25)
CREATE (o17)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s21)

// Waiter
CREATE (o18)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s28)
CREATE (o18)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s19)
CREATE (o18)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s21)
CREATE (o18)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.5}]->(s25)

// Nurse
CREATE (o19)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s15)
CREATE (o19)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s16)
CREATE (o19)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s19)
CREATE (o19)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.7}]->(s20)
CREATE (o19)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s22)

// Teacher
CREATE (o20)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.95}]->(s29)
CREATE (o20)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.85}]->(s30)
CREATE (o20)-[:REQUIRES_SKILL {relationType: 'essential', signallingValue: 0.9}]->(s19)
CREATE (o20)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.7}]->(s23)
CREATE (o20)-[:REQUIRES_SKILL {relationType: 'optional', signallingValue: 0.6}]->(s21);

// =====================================================
// DONE! Now explore with these queries:
// =====================================================

// View all data
// MATCH (n) RETURN n;

// View one occupation with its skills
// MATCH (o:Occupation {name: 'Crop Farmer'})-[r]->(s:Skill) RETURN o, r, s;

// Find occupations that share skills
// MATCH (o1:Occupation)-[:REQUIRES_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(o2:Occupation)
// WHERE o1.name < o2.name
// RETURN o1.name, s.name, o2.name LIMIT 20;
