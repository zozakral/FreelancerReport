-- Migration: Create generated_reports table
-- Description: Metadata for generated PDF reports
-- Created: 2026-02-07

-- Create generated_reports table
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_period DATE NOT NULL,
  report_date DATE NOT NULL,
  file_path TEXT,
  save_to_storage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_generated_reports_user_created ON generated_reports(user_id, created_at DESC);
CREATE INDEX idx_generated_reports_company_period ON generated_reports(company_id, report_period);

-- Enable Row Level Security
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reports or admin can view all"
ON generated_reports FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own reports or admin can insert for anyone"
ON generated_reports FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own reports or admin can delete any"
ON generated_reports FOR DELETE
USING (user_id = auth.uid() OR is_admin());
