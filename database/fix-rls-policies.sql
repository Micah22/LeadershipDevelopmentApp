-- Fix Row Level Security policies to allow anonymous access for testing
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS for users table to allow login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a more permissive policy
-- DROP POLICY IF EXISTS "Users can view their own data" ON users;
-- CREATE POLICY "Allow anonymous read access to users" ON users FOR SELECT USING (true);

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
