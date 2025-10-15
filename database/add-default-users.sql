-- Add default users to the database
-- Run this in your Supabase SQL Editor

-- Insert default admin user
INSERT INTO users (username, full_name, email, password_hash, role, status, start_date)
VALUES (
    'admin',
    'Admin User',
    'admin@company.com',
    'YWRtaW4xMjM=', -- base64 encoded 'admin123'
    'Admin',
    'active',
    '2024-01-01'
) ON CONFLICT (username) DO NOTHING;

-- Insert additional default users
INSERT INTO users (username, full_name, email, password_hash, role, status, start_date)
VALUES 
    (
        'john.doe',
        'John Doe',
        'john.doe@company.com',
        'cGFzc3dvcmQxMjM=', -- base64 encoded 'password123'
        'Director',
        'active',
        '2024-01-15'
    ),
    (
        'jane.smith',
        'Jane Smith',
        'jane.smith@company.com',
        'cGFzc3dvcmQxMjM=', -- base64 encoded 'password123'
        'Supervisor',
        'active',
        '2024-02-01'
    ),
    (
        'mike.wilson',
        'Mike Wilson',
        'mike.wilson@company.com',
        'cGFzc3dvcmQxMjM=', -- base64 encoded 'password123'
        'Team Member',
        'active',
        '2024-02-15'
    ),
    (
        'sarah.jones',
        'Sarah Jones',
        'sarah.jones@company.com',
        'cGFzc3dvcmQxMjM=', -- base64 encoded 'password123'
        'Team Member',
        'active',
        '2024-03-01'
    )
ON CONFLICT (username) DO NOTHING;

-- Verify users were created
SELECT username, full_name, role, status FROM users ORDER BY role, username;
