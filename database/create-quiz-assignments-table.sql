-- Create quiz_assignments table with RLS
-- Run this in your Supabase SQL editor

-- Quiz assignments table (for manual assignment of quizzes to users)
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(255) NOT NULL, -- Using VARCHAR since quizzes are currently stored in localStorage with string IDs
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    score DECIMAL(5,2), -- Store quiz score if completed
    passed BOOLEAN DEFAULT FALSE, -- Whether the user passed the quiz
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quiz_id)
);

-- Indexes for quiz assignments
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_user_id ON quiz_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz_id ON quiz_assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_status ON quiz_assignments(status);

-- RLS for quiz assignments
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz assignments" ON quiz_assignments FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Admins can manage all quiz assignments" ON quiz_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
);

