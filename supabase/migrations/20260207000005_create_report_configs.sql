-- Migration: Create report_configs table
-- Description: User-specific report configurations
-- Created: 2026-02-07

-- Create report_configs table
CREATE TABLE report_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE RESTRICT,
  intro_text TEXT,
  outro_text TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create indexes
CREATE INDEX idx_report_configs_user_id ON report_configs(user_id);
CREATE INDEX idx_report_configs_company_id ON report_configs(company_id);

-- Enable Row Level Security
ALTER TABLE report_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own configs or admin can view all"
ON report_configs FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own configs or admin can insert for anyone"
ON report_configs FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own configs or admin can update any"
ON report_configs FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own configs or admin can delete any"
ON report_configs FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_report_configs_updated_at
  BEFORE UPDATE ON report_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
