-- Create module_assignments table with RLS disabled for testing
-- Run this in your Supabase SQL editor

-- Module assignments table (for manual assignment of modules to users)
CREATE TABLE IF NOT EXISTS module_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Indexes for module assignments
CREATE INDEX IF NOT EXISTS idx_module_assignments_user_id ON module_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_module_assignments_module_id ON module_assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_module_assignments_status ON module_assignments(status);

-- Temporarily disable RLS for testing (you can enable it later)
-- ALTER TABLE module_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies (commented out for now)
-- CREATE POLICY "Users can view their own assignments" ON module_assignments FOR SELECT USING (user_id = auth.uid()::uuid);
-- CREATE POLICY "Admins can manage all assignments" ON module_assignments FOR ALL USING (
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
-- );
