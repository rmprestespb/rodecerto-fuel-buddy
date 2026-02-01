-- Fix storage policies for avatars bucket
-- Remove overly permissive "Anyone can view" policy and add authenticated-only policies

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create new restrictive policies for avatars bucket
-- Allow authenticated users to view avatars (still public for display but requires auth)
CREATE POLICY "Authenticated users can view avatars" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'avatars');

-- Allow users to upload only to their own folder
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update only their own avatar
CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete only their own avatar
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);