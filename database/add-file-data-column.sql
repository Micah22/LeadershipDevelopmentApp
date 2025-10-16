-- Add file_data column to module_checklist table
-- This allows storing file attachments as JSON data

ALTER TABLE module_checklist 
ADD COLUMN IF NOT EXISTS file_data TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN module_checklist.file_data IS 'JSON string containing file attachment data (name, size, base64 content)';

