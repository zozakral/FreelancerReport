-- Migration: Create companies table
-- Description: Companies that freelancers work for
-- Created: 2026-02-07

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_number TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_name ON companies(name);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own companies or admin can view all"
ON companies FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own companies or admin can insert for anyone"
ON companies FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own companies or admin can update any"
ON companies FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own companies or admin can delete any"
ON companies FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
