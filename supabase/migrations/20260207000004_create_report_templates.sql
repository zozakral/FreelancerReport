-- Migration: Create report_templates table
-- Description: Predefined PDF report templates (global, not user-specific)
-- Created: 2026-02-07

-- Create report_templates table
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  template_definition JSONB NOT NULL,
  styles JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on name for lookups
CREATE INDEX idx_report_templates_name ON report_templates(name);

-- Enable Row Level Security
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone authenticated can view templates
CREATE POLICY "Anyone can view report templates"
ON report_templates FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage templates
CREATE POLICY "Only admins can insert templates"
ON report_templates FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update templates"
ON report_templates FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete templates"
ON report_templates FOR DELETE
TO authenticated
USING (is_admin());
