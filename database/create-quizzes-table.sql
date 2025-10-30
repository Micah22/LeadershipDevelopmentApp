-- Create quizzes table in the database
-- Run this in your Supabase SQL editor

-- Quizzes table (for storing quiz data accessible to all users)
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(255) PRIMARY KEY, -- Using VARCHAR to match localStorage quiz IDs (e.g., 'quiz_1761752285457')
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50),
    tags JSONB DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store questions as JSON array
    time_limit INTEGER DEFAULT 15, -- minutes
    passing_score INTEGER DEFAULT 70, -- percentage
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- RLS for quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the migration)
DROP POLICY IF EXISTS "Everyone can view active quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins and creators can manage quizzes" ON quizzes;

-- Policy: Everyone can view active quizzes
CREATE POLICY "Everyone can view active quizzes" ON quizzes FOR SELECT 
    USING (status = 'active' OR created_by = auth.uid()::uuid);

-- Policy: Only admins and creators can manage quizzes
CREATE POLICY "Admins and creators can manage quizzes" ON quizzes FOR ALL 
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin') OR
        created_by = auth.uid()::uuid
    );

