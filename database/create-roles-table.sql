-- Create roles table for storing role definitions and permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    page_access JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on role_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_role_id ON roles(role_id);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read roles
CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);

-- Policy: Only admins can modify roles
CREATE POLICY "Only admins can manage roles" ON roles FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
);

-- Insert default roles
INSERT INTO roles (role_id, name, description, level, permissions, page_access) VALUES
('admin', 'Admin', 'Full system access with all permissions', 4, 
 '["view_users", "create_users", "edit_users", "delete_users", "view_modules", "create_modules", "edit_modules", "delete_modules", "view_assignments", "create_assignments", "edit_assignments", "delete_assignments", "view_reports", "manage_roles", "system_settings", "backup_restore"]'::jsonb,
 '["dashboard", "my-progress", "quizzes", "user-overview", "path-management", "role-management", "reports", "settings"]'::jsonb),
('director', 'Director', 'High-level management access with most permissions', 3,
 '["view_users", "create_users", "edit_users", "view_modules", "create_modules", "edit_modules", "view_assignments", "create_assignments", "edit_assignments", "view_reports"]'::jsonb,
 '["dashboard", "my-progress", "quizzes", "path-management", "reports"]'::jsonb),
('supervisor', 'Supervisor', 'Team management with standard permissions', 2,
 '["view_users", "edit_users", "view_modules", "edit_modules", "view_assignments", "create_assignments", "edit_assignments", "view_reports"]'::jsonb,
 '["dashboard", "my-progress", "quizzes", "path-management"]'::jsonb),
('team-member', 'Team Member', 'Basic access with limited permissions', 1,
 '["view_modules", "view_assignments"]'::jsonb,
 '["dashboard", "my-progress", "quizzes"]'::jsonb)
ON CONFLICT (role_id) DO NOTHING;

