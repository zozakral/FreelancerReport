-- Migration: Create activities table
-- Description: Work activities with hourly rates
-- Created: 2026-02-07

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_name ON activities(name);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activities or admin can view all"
ON activities FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert own activities or admin can insert for anyone"
ON activities FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own activities or admin can update any"
ON activities FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own activities or admin can delete any"
ON activities FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
