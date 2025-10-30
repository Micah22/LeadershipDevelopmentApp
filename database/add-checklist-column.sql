-- Add checklist column to user_progress table
-- This will store the full checklist array as JSON

ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;

-- Update the column to ensure it has a default empty array
UPDATE user_progress SET checklist = '[]'::jsonb WHERE checklist IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN user_progress.checklist IS 'JSON array of boolean values representing checklist item completion status';

