-- Migration: Create work-reports storage bucket
-- Description: Create storage bucket for PDF report uploads with RLS policies
-- Created: 2026-02-23

-- Create the work-reports bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-reports', 'work-reports', false)
ON CONFLICT DO NOTHING;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'work-reports'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
);

-- Policy: Users can upload reports to their own folder
CREATE POLICY "Users can upload own reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'work-reports'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
);

-- Policy: Users can update their own reports
CREATE POLICY "Users can update own reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'work-reports'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
)
WITH CHECK (
  bucket_id = 'work-reports'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
);

-- Policy: Users can delete their own reports
CREATE POLICY "Users can delete own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'work-reports'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin())
);
