-- Migration to add a new admin credential for DigiFarmLink
-- Email: admin@digifarmlink.com
-- Password: Admin1234

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Redefine trigger function to fix the text-to-uuid casting mismatch error
CREATE OR REPLACE FUNCTION public.handle_after_auth_user_identity()
RETURNS trigger AS $$
BEGIN
  -- Only insert if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = new.id) THEN
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      new.id::text,
      new.id,
      jsonb_build_object('sub', new.id, 'email', new.email, 'email_verified', true),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Insert admin user into auth.users (triggers profile insertion automatically)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role,
  raw_app_meta_data
) VALUES (
  'a2000000-0000-0000-0000-000000000001',
  'admin@digifarmlink.com',
  '$2a$10$lRo3Lb51FHBD0fdpYOljiemxNWY5Mdnj.5hGVeFgpg91cl0YeuiGW',
  NOW(),
  '{"role":"admin", "full_name":"DigiFarmLink Admin", "phone_number":"+233240000000"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}'
)
ON CONFLICT (id) DO UPDATE SET encrypted_password = EXCLUDED.encrypted_password;

-- 2. Insert admin identity to link password credentials
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'a2000000-0000-0000-0000-000000000001',
  'a2000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', 'a2000000-0000-0000-0000-000000000001', 'email', 'admin@digifarmlink.com', 'email_verified', true),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;
