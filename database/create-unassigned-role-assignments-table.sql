-- Unassigned role-based assignments table (to track modules that were unassigned from users)
CREATE TABLE IF NOT EXISTS unassigned_role_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    unassigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unassigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Indexes for unassigned role assignments
CREATE INDEX IF NOT EXISTS idx_unassigned_role_assignments_user_id ON unassigned_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_unassigned_role_assignments_module_id ON unassigned_role_assignments(module_id);

-- RLS for unassigned role assignments (commented out for now to avoid RLS issues)
-- ALTER TABLE unassigned_role_assignments ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own unassigned assignments" ON unassigned_role_assignments FOR SELECT USING (user_id = auth.uid()::uuid);
-- CREATE POLICY "Admins can manage all unassigned assignments" ON unassigned_role_assignments FOR ALL USING (
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
-- );
