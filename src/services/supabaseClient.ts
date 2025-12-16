import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://ymzvilcsarexbcdyinqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltenZpbGNzYXJleGJjZHlpbnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTIwNjMsImV4cCI6MjA4MTQyODA2M30.v9LNoXljOmiAfvENhsmmZXpJOqA47ieFsdTIgPBrbfg';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types based on schema
export interface OccupationGroup {
  id: string;
  code: string;
  group_type: string | null;
  preferred_label: string;
  alt_labels: string[];
  description: string | null;
  origin_uri: string | null;
}

export interface Occupation {
  id: string;
  code: string;
  occupation_type: string;
  occupation_group_code: string | null;
  preferred_label: string;
  alt_labels: string[];
  description: string | null;
  definition: string | null;
  is_localized: boolean;
  origin_uri: string | null;
}

export interface SkillGroup {
  id: string;
  code: string;
  preferred_label: string;
  alt_labels: string[];
  description: string | null;
  origin_uri: string | null;
}

export interface Skill {
  id: string;
  code: string | null;
  skill_type: string | null;
  reuse_level: string | null;
  preferred_label: string;
  alt_labels: string[];
  description: string | null;
  definition: string | null;
  is_localized: boolean;
  origin_uri: string | null;
}

export interface OccupationHierarchy {
  parent_id: string;
  parent_type: string;
  child_id: string;
  child_type: string;
}

export interface SkillHierarchy {
  parent_id: string;
  parent_type: string;
  child_id: string;
  child_type: string;
}

export interface OccupationSkillRelation {
  occupation_id: string;
  occupation_type: string | null;
  skill_id: string;
  relation_type: string;
  signalling_value: number | null;
  signalling_value_label: string | null;
}
