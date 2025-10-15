-- Fix RLS policies to allow anonymous access for development
-- This temporarily disables RLS to allow the application to work

-- Disable RLS temporarily for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE module_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews DISABLE ROW LEVEL SECURITY;

-- Alternative: Create more permissive policies for anonymous access
-- Uncomment these if you want to keep RLS enabled but allow anonymous access

/*
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Everyone can view active modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view files for their modules" ON module_files;
DROP POLICY IF EXISTS "Users can view their own reviews" ON performance_reviews;

-- Create permissive policies for anonymous access
CREATE POLICY "Allow anonymous access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to modules" ON modules FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to user_progress" ON user_progress FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to module_files" ON module_files FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to performance_reviews" ON performance_reviews FOR ALL USING (true);
*/