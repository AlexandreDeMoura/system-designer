-- Seed file for E2E testing
-- Run with: npx supabase db reset (this applies migrations + runs seed.sql)

-- Create test user for E2E tests
-- Email: test@example.com
-- Password: testpassword123

DO $$
DECLARE
  test_user_id uuid := 'aaaaaaaa-bbbb-cccc-dddd-000000000001';
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    test_user_id,
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities (required for email/password login)
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_user_id,
    'test@example.com',
    jsonb_build_object('sub', test_user_id, 'email', 'test@example.com', 'email_verified', true),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
END $$;

