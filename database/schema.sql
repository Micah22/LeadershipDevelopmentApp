-- Leadership Development Database Schema
-- Supabase PostgreSQL Database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Director', 'Supervisor', 'Trainer', 'Assistant Supervisor', 'Team Member')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    required_role VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Phase 1',
    duration INTEGER DEFAULT 1,
    prerequisites TEXT,
    author VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    tags TEXT,
    -- Performance rubric fields
    quality_unsatisfactory TEXT,
    quality_average TEXT,
    quality_excellent TEXT,
    speed_unsatisfactory TEXT,
    speed_average TEXT,
    speed_excellent TEXT,
    communication_unsatisfactory TEXT,
    communication_average TEXT,
    communication_excellent TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module checklist items table
CREATE TABLE IF NOT EXISTS module_checklist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    task_text TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Module files table
CREATE TABLE IF NOT EXISTS module_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES module_checklist(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_content TEXT NOT NULL, -- Base64 encoded content
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    overall_rating VARCHAR(20) CHECK (overall_rating IN ('Unsatisfactory', 'Average', 'Excellent')),
    trainer_comments TEXT,
    team_member_goals TEXT,
    trainer_signature VARCHAR(100),
    trainee_initials VARCHAR(10),
    review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_modules_required_role ON modules(required_role);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_checklist_module_id ON module_checklist(module_id);
CREATE INDEX IF NOT EXISTS idx_module_files_module_id ON module_files(module_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your needs)
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Everyone can view active modules" ON modules FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage modules" ON modules FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
);

CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Users can update their own progress" ON user_progress FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can view files for their modules" ON module_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_progress WHERE module_id = module_files.module_id AND user_id = auth.uid()::uuid)
);

CREATE POLICY "Users can view their own reviews" ON performance_reviews FOR SELECT USING (user_id = auth.uid()::uuid);

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

-- RLS for module assignments
ALTER TABLE module_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments" ON module_assignments FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Admins can manage all assignments" ON module_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
);

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

-- RLS for unassigned role assignments
ALTER TABLE unassigned_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unassigned assignments" ON unassigned_role_assignments FOR SELECT USING (user_id = auth.uid()::uuid);
CREATE POLICY "Admins can manage all unassigned assignments" ON unassigned_role_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
);
