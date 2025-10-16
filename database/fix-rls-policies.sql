-- Fix RLS policies for module assignments
-- This script updates the Row Level Security policies to allow operations with the anon key

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own assignments" ON module_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON module_assignments;
DROP POLICY IF EXISTS "Users can view their own unassigned assignments" ON unassigned_role_assignments;
DROP POLICY IF EXISTS "Admins can manage all unassigned assignments" ON unassigned_role_assignments;

-- Create new policies that work with anon key
-- Allow all operations for now (you can restrict this later if needed)
CREATE POLICY "Allow all operations on module_assignments" ON module_assignments FOR ALL USING (true);
CREATE POLICY "Allow all operations on unassigned_role_assignments" ON unassigned_role_assignments FOR ALL USING (true);

-- Alternative: If you want to keep some security, you can use this instead:
-- CREATE POLICY "Allow module assignment operations" ON module_assignments FOR ALL USING (
--     auth.role() = 'anon' OR 
--     EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'Admin')
-- );