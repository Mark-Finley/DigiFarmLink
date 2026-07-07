-- Migration to fix the password hashes and identity link for all seeded users ending with @farmlink.com
-- This updates the Bcrypt work factor to 10 rounds to satisfy Supabase GoTrue Auth's security requirements.

-- 1. Update passwords to a valid 10-round Bcrypt hash for 'password123'
UPDATE auth.users 
SET encrypted_password = '$2a$10$LT7r0U/tE6wYvJ/29XpBme.cO2106nI4wJ9R1Z1P1YfO7oT4P5eI2'
WHERE email LIKE '%@farmlink.com';

-- 2. Ensure all seeded users have a valid auth.identities record to allow password sign-in
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT 
  id::text, 
  id, 
  jsonb_build_object('sub', id, 'email', email, 'email_verified', true), 
  'email', 
  NOW(), 
  NOW(), 
  NOW()
FROM auth.users
WHERE email LIKE '%@farmlink.com'
ON CONFLICT (provider, id) DO NOTHING;
