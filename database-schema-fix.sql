-- Fix for RLS policy issue
-- This script fixes the user creation process

-- First, let's update the user creation trigger to handle all the metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, user_type, company_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'student'),
        NEW.raw_user_meta_data->>'company_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the users policies to allow the trigger to work
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Allow service role to insert users (for the trigger)
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Update the user type constraint to handle the enum properly
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_type_check;
ALTER TABLE public.users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('student', 'employer'));