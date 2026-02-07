-- Migration: Create work_entries table
-- Description: Work entries tracking hours per activity per company per month
-- Created: 2026-02-07

-- Create work_entries table
CREATE TABLE work_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  hours DECIMAL(10, 2) NOT NULL CHECK (hours > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, activity_id, company_id, month)
);

-- Create indexes
CREATE INDEX idx_work_entries_user_id ON work_entries(user_id);
CREATE INDEX idx_work_entries_company_month ON work_entries(company_id, month);
CREATE INDEX idx_work_entries_activity_id ON work_entries(activity_id);

-- Enable Row Level Security
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own entries or admin can view all"
ON work_entries FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own entries or admin can insert for anyone"
ON work_entries FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own entries or admin can update any"
ON work_entries FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own entries or admin can delete any"
ON work_entries FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_work_entries_updated_at
  BEFORE UPDATE ON work_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
