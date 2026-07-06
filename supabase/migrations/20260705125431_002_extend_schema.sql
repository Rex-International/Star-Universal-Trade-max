/*
# Star Universal Trade - Extend Schema

This migration extends the existing e-commerce schema for the SUT application.

## Changes Made:
1. Add columns to `profiles` table:
   - email (text)
   - role (text: customer, seller, admin - default customer)
   - country (text - default Tanzania)
   - verified (boolean - default false)

2. Create `notifications` table for user notifications:
   - id (uuid, PK)
   - user_id (uuid, defaults to auth.uid())
   - title (text)
   - message (text)
   - type (text)
   - is_read (boolean)
   - created_at timestamp

## Security:
- RLS policies for notifications (owner-scoped)

## Notes:
1. The existing schema already has products, orders, reviews, wishlists, cart_items, addresses
2. Products use `name` field, `is_active`, `is_featured` (slightly different from original)
3. Will adapt the React app to use the existing schema structure
*/

-- ============================================
-- ADD MISSING COLUMNS TO PROFILES
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country text DEFAULT 'Tanzania';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified') THEN
        ALTER TABLE profiles ADD COLUMN verified boolean DEFAULT false;
    END IF;
END $$;

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "notifications_read_own" ON notifications;
CREATE POLICY "notifications_read_own" ON notifications FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

-- Users can create their own notifications
DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- INDEX FOR NOTIFICATIONS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);