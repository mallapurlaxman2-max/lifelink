-- ====================================================================
-- LIFELINK — MASTER DATABASE SCHEMA & SECURITY MIGRATION
-- File: supabase/migrations/001_lifelink_schema.sql
-- Version: 4.0.0 (Hardened Production Transaction Security & Privacy Shield)
-- ====================================================================
-- SAFE, ADDITIVE, TRANSACTIONAL, AND NON-DESTRUCTIVE MIGRATION:
--   - Wrapped in a transaction block (BEGIN...COMMIT) for atomic execution.
--   - Preserves all 8 existing items (including user listings) without data loss.
--   - Preserves all 8 existing donors without data loss.
--   - Zero data loss, zero table truncation, zero arbitrary owner assignment.
--   - DO NOT EXECUTE AUTOMATICALLY. Awaiting explicit user approval.
-- ====================================================================

BEGIN;

-- --------------------------------------------------------------------
-- 1. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. REVOKE LEGACY PERMISSIVE GRANTS & POLICIES
-- --------------------------------------------------------------------
-- Drop existing conflicting RLS policies on items and donors if any exist
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('items', 'donors', 'requests', 'handovers', 'profiles')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- --------------------------------------------------------------------
-- 3. USER PROFILES TABLE & ROLE-BASED ACCESS CONTROL (RBAC)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  area TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  trust_score INT DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 1000),
  total_borrows INT DEFAULT 0 CHECK (total_borrows >= 0),
  total_returns INT DEFAULT 0 CHECK (total_returns >= 0),
  total_donations INT DEFAULT 0 CHECK (total_donations >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function: Check if current authenticated caller is administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function: Check if current authenticated caller is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$;

-- Trigger: Automatically create public.profiles entry upon auth.users signup
-- Robust against missing email or empty metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  v_display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(split_part(NEW.email, '@', 1), ''),
    'Community Member'
  );

  INSERT INTO public.profiles (id, full_name, avatar_url, role, trust_score)
  VALUES (
    NEW.id,
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    100
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Protect privileged profile fields from client tampering
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Security violation: Profile ID cannot be modified.';
  END IF;

  IF (NEW.role IS DISTINCT FROM OLD.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Only administrators can modify roles.';
  END IF;

  IF (NEW.trust_score IS DISTINCT FROM OLD.trust_score) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Trust scores cannot be manually altered.';
  END IF;

  IF ((NEW.total_borrows IS DISTINCT FROM OLD.total_borrows) OR 
      (NEW.total_returns IS DISTINCT FROM OLD.total_returns) OR 
      (NEW.total_donations IS DISTINCT FROM OLD.total_donations)) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Activity statistics cannot be manually altered.';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Public Profile Discovery View (Strips private phone, email, and metadata)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  area,
  role,
  trust_score,
  total_borrows,
  total_returns,
  total_donations,
  created_at
FROM public.profiles;

-- --------------------------------------------------------------------
-- 4. ENHANCE EXISTING 'items' TABLE (Preserves all 8 existing rows)
-- --------------------------------------------------------------------
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good',
  ADD COLUMN IF NOT EXISTS max_borrow_days INT DEFAULT 7,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely mark all existing rows with no user_id as legacy community listings
UPDATE public.items 
SET is_legacy = TRUE 
WHERE user_id IS NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_status_check') THEN
    ALTER TABLE public.items ADD CONSTRAINT items_status_check 
      CHECK (status IN ('available', 'requested', 'approved', 'borrowed', 'returned', 'inactive'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_condition_check') THEN
    ALTER TABLE public.items ADD CONSTRAINT items_condition_check 
      CHECK (condition IN ('New', 'Like New', 'Good', 'Fair'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_lat_lng ON public.items(lat, lng);

-- Trigger: Prevent direct modification of privileged item lifecycle statuses
CREATE OR REPLACE FUNCTION public.protect_item_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Security violation: Item ID cannot be modified.';
  END IF;

  IF NEW.is_legacy IS DISTINCT FROM OLD.is_legacy AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Legacy status cannot be modified.';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Item ownership cannot be directly transferred.';
  END IF;

  -- Ordinary users can only toggle between 'available' and 'inactive' (pause/unpause listing)
  -- Transitions to 'requested', 'borrowed', or 'returned' must occur through trusted RPCs
  IF (NEW.status IS DISTINCT FROM OLD.status) AND NOT public.is_admin() THEN
    IF NOT (OLD.status IN ('available', 'inactive') AND NEW.status IN ('available', 'inactive')) THEN
      RAISE EXCEPTION 'Security violation: Borrowing lifecycle statuses (requested, borrowed, returned) can only be transitioned via official handover RPCs.';
    END IF;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_item_status ON public.items;
CREATE TRIGGER trg_protect_item_status
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.protect_item_status();

-- --------------------------------------------------------------------
-- 5. ENHANCE EXISTING 'donors' TABLE (Strict Privacy & Zero Leak)
-- --------------------------------------------------------------------
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'in_app_only',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blood_bank_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Legacy donors default to in_app_only so phone & email are NEVER exposed publicly
UPDATE public.donors 
SET is_legacy = TRUE,
    contact_preference = 'in_app_only'
WHERE user_id IS NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'donors_contact_pref_check') THEN
    ALTER TABLE public.donors ADD CONSTRAINT donors_contact_pref_check 
      CHECK (contact_preference IN ('call_and_whatsapp', 'whatsapp_only', 'in_app_only', 'unavailable'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_donors_group ON public.donors("group");
CREATE INDEX IF NOT EXISTS idx_donors_available ON public.donors(available);
CREATE INDEX IF NOT EXISTS idx_donors_contact_pref ON public.donors(contact_preference);

-- Trigger: Prevent donors from modifying verification badges or ownership
CREATE OR REPLACE FUNCTION public.protect_donor_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Security violation: Donor ID cannot be modified.';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Donor ownership cannot be transferred.';
  END IF;

  IF NEW.is_legacy IS DISTINCT FROM OLD.is_legacy AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Legacy status cannot be modified.';
  END IF;

  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified OR 
      NEW.blood_bank_verified IS DISTINCT FROM OLD.blood_bank_verified) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security violation: Verification status can only be granted by administrators.';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_donor_fields ON public.donors;
CREATE TRIGGER trg_protect_donor_fields
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.protect_donor_fields();

-- Public Donor Privacy View: Strips phone and email unless explicit consent is enabled
CREATE OR REPLACE VIEW public.public_donors AS
SELECT 
  d.id,
  d.name,
  d."group",
  d.area,
  d.available,
  d.last_donated,
  d.is_verified,
  d.blood_bank_verified,
  d.is_legacy,
  d.contact_preference,
  d.created_at,
  CASE 
    WHEN d.contact_preference IN ('call_and_whatsapp', 'whatsapp_only') THEN d.phone
    ELSE NULL 
  END AS phone,
  CASE 
    WHEN d.contact_preference = 'call_and_whatsapp' THEN d.email
    ELSE NULL 
  END AS email
FROM public.donors d;

-- --------------------------------------------------------------------
-- 6. DONOR CONTACT REQUESTS (In-App Protected Blood Requests)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.donor_contact_requests (
  id BIGSERIAL PRIMARY KEY,
  donor_id BIGINT NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  requester_email TEXT,
  hospital_name TEXT NOT NULL,
  patient_blood_group TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('critical_emergency', 'within_24_hours', 'routine_preparation')),
  units_needed INT DEFAULT 1 CHECK (units_needed >= 1),
  note TEXT,
  response_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_contact_donor ON public.donor_contact_requests(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_contact_requester ON public.donor_contact_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_donor_contact_status ON public.donor_contact_requests(status);

-- RPC: Donor responds to contact request (Accept or Decline only)
CREATE OR REPLACE FUNCTION public.respond_donor_contact_request(
  p_request_id BIGINT,
  p_decision TEXT,
  p_response_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_req RECORD;
  v_donor RECORD;
BEGIN
  IF p_decision NOT IN ('accepted', 'declined') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid decision. Must be accepted or declined.');
  END IF;

  SELECT * INTO v_req FROM public.donor_contact_requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contact request not found.');
  END IF;

  SELECT * INTO v_donor FROM public.donors WHERE id = v_req.donor_id;

  -- Ensure caller is the owner of the target donor profile or admin
  IF (v_donor.user_id IS NOT NULL AND v_donor.user_id != auth.uid()) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the requested donor can respond.');
  END IF;

  -- For legacy donors (user_id IS NULL), allow moderator/admin response
  IF v_donor.user_id IS NULL AND NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This legacy donor request is managed by community coordinators.');
  END IF;

  UPDATE public.donor_contact_requests
  SET status = p_decision,
      response_note = TRIM(p_response_note),
      updated_at = NOW()
  WHERE id = p_request_id;

  -- Notify requester if registered
  IF v_req.requester_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      v_req.requester_user_id,
      'blood_request',
      'Blood Donation Request ' || INITCAP(p_decision),
      v_donor.name || ' has ' || p_decision || ' your blood donation request.',
      '/dashboard?tab=blood-requests'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'status', p_decision);
END;
$$;

-- --------------------------------------------------------------------
-- 7. ITEM BORROWING REQUESTS TABLE (Direct UPDATE/INSERT Forbidden)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.requests (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  borrower_name TEXT NOT NULL,
  borrower_phone TEXT NOT NULL,
  borrower_email TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  return_date DATE NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'borrowed', 'returned', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_request_dates CHECK (return_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_requests_item_id ON public.requests(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_borrower_id ON public.requests(borrower_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner_id ON public.requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);

-- RPC: Secure Request Creation with Strict Ownership & Date Validations
CREATE OR REPLACE FUNCTION public.create_borrow_request(
  p_item_id BIGINT,
  p_borrower_name TEXT,
  p_borrower_phone TEXT,
  p_borrower_email TEXT,
  p_start_date DATE,
  p_return_date DATE,
  p_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item RECORD;
  v_request_id BIGINT;
BEGIN
  -- Validate dates
  IF p_start_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Start date cannot be in the past.');
  END IF;

  IF p_return_date < p_start_date THEN
    RETURN jsonb_build_object('success', false, 'error', 'Return date must be on or after start date.');
  END IF;

  -- Validate inputs
  IF TRIM(p_borrower_name) = '' OR TRIM(p_borrower_phone) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Borrower name and contact phone are required.');
  END IF;

  -- Lock item row
  SELECT * INTO v_item FROM public.items WHERE id = p_item_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found.');
  END IF;

  IF v_item.status NOT IN ('available', 'requested') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item is currently not available for borrowing.');
  END IF;

  -- Prevent users from borrowing their own item
  IF v_item.user_id IS NOT NULL AND auth.uid() IS NOT NULL AND v_item.user_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot borrow your own listed item.');
  END IF;

  -- Enforce maximum borrow duration
  IF (p_return_date - p_start_date) > COALESCE(v_item.max_borrow_days, 30) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested duration exceeds maximum allowed of ' || v_item.max_borrow_days || ' days.');
  END IF;

  -- Insert request, deriving owner_id exclusively from item record
  INSERT INTO public.requests (
    item_id, borrower_id, borrower_name, borrower_phone, borrower_email,
    owner_id, start_date, return_date, note, status
  )
  VALUES (
    p_item_id, auth.uid(), TRIM(p_borrower_name), TRIM(p_borrower_phone), TRIM(p_borrower_email),
    v_item.user_id, p_start_date, p_return_date, TRIM(p_note), 'pending'
  )
  RETURNING id INTO v_request_id;

  -- Notify item owner
  IF v_item.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      v_item.user_id,
      'request_received',
      'New Borrow Request',
      p_borrower_name || ' requested to borrow "' || v_item.name || '".',
      '/dashboard?tab=requests'
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'request_id', v_request_id);
END;
$$;

-- RPC: Secure Request Approval with Anti-Conflict Row Locking
CREATE OR REPLACE FUNCTION public.approve_borrow_request(p_request_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_item RECORD;
BEGIN
  -- Lock request row
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found.');
  END IF;

  -- Authorization check: owner or admin
  IF (v_request.owner_id IS NOT NULL AND v_request.owner_id != auth.uid()) AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the item owner can approve this request.');
  END IF;

  -- For legacy items where owner_id is NULL, require moderator or admin approval
  IF v_request.owner_id IS NULL AND NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Legacy community items require administrator verification.');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request is not in pending status.');
  END IF;

  -- Lock item row and verify no overlapping approved/borrowed reservation exists
  SELECT * INTO v_item FROM public.items WHERE id = v_request.item_id FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM public.requests
    WHERE item_id = v_request.item_id 
      AND id != p_request_id
      AND status IN ('approved', 'borrowed')
      AND (start_date <= v_request.return_date AND return_date >= v_request.start_date)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Conflict: This item is already reserved for overlapping dates.');
  END IF;

  UPDATE public.requests SET status = 'approved', updated_at = NOW() WHERE id = p_request_id;
  UPDATE public.items SET status = 'requested', updated_at = NOW() WHERE id = v_request.item_id;

  -- Notify borrower
  IF v_request.borrower_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      v_request.borrower_id,
      'request_approved',
      'Request Approved!',
      'Your request for "' || v_item.name || '" has been approved. Meet the owner to complete pickup.',
      '/dashboard?tab=requests'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: Secure Request Rejection
CREATE OR REPLACE FUNCTION public.reject_borrow_request(p_request_id BIGINT, p_reason TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found.');
  END IF;

  IF (v_request.owner_id IS NOT NULL AND v_request.owner_id != auth.uid()) AND NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pending requests can be rejected.');
  END IF;

  UPDATE public.requests SET status = 'rejected', updated_at = NOW() WHERE id = p_request_id;

  SELECT * INTO v_item FROM public.items WHERE id = v_request.item_id;

  IF v_request.borrower_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      v_request.borrower_id,
      'request_rejected',
      'Request Declined',
      'Your request for "' || v_item.name || '" could not be accepted at this time.',
      '/dashboard?tab=requests'
    );
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: Borrower Cancels Pending Request
CREATE OR REPLACE FUNCTION public.cancel_borrow_request(p_request_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found.');
  END IF;

  IF v_request.borrower_id IS NOT NULL AND v_request.borrower_id != auth.uid() AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only the requester can cancel this request.');
  END IF;

  IF v_request.status NOT IN ('pending', 'approved') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only pending or approved requests can be cancelled.');
  END IF;

  UPDATE public.requests SET status = 'cancelled', updated_at = NOW() WHERE id = p_request_id;

  -- Revert item back to available if it was marked requested
  SELECT * INTO v_item FROM public.items WHERE id = v_request.item_id FOR UPDATE;
  IF v_item.status = 'requested' THEN
    UPDATE public.items SET status = 'available', updated_at = NOW() WHERE id = v_item.id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- --------------------------------------------------------------------
-- 8. QR HANDOVERS (Zero Plaintext Storage & Strict Role Partitioning)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.handovers (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('pickup', 'return')),
  token_hash TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL UNIQUE,
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  attempt_count INT DEFAULT 0 CHECK (attempt_count <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handovers_token_hash ON public.handovers(token_hash);
CREATE INDEX IF NOT EXISTS idx_handovers_code_hash ON public.handovers(code_hash);
CREATE INDEX IF NOT EXISTS idx_handovers_request_id ON public.handovers(request_id);

-- RPC: Server-Side Handover Token Generation (Hashes only stored in DB)
CREATE OR REPLACE FUNCTION public.generate_handover_token(
  p_request_id BIGINT,
  p_stage TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_code TEXT;
  v_raw_token TEXT;
  v_token_hash TEXT;
  v_code_hash TEXT;
  v_handover_id BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  IF p_stage NOT IN ('pickup', 'return') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid stage. Must be pickup or return.');
  END IF;

  -- Lock request row
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found.');
  END IF;

  -- Caller must be one of the transaction participants
  IF auth.uid() != v_request.owner_id AND auth.uid() != v_request.borrower_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized.');
  END IF;

  -- Validate permitted status
  IF p_stage = 'pickup' AND v_request.status != 'approved' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request must be in approved status before pickup handover.');
  END IF;

  IF p_stage = 'return' AND v_request.status != 'borrowed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request must be in borrowed status before return handover.');
  END IF;

  -- Cryptographically secure generation of 6-character code and 32-byte secret token
  v_code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 6));
  v_raw_token := encode(gen_random_bytes(32), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');
  v_code_hash := encode(digest(v_code, 'sha256'), 'hex');

  -- Deactivate previous active tokens for this request and stage
  UPDATE public.handovers 
  SET is_used = TRUE 
  WHERE request_id = p_request_id AND stage = p_stage AND is_used = FALSE;

  INSERT INTO public.handovers (
    request_id, item_id, stage, token_hash, code_hash, generated_by, is_used, expires_at
  )
  VALUES (
    p_request_id, v_request.item_id, p_stage, v_token_hash, v_code_hash, auth.uid(), FALSE, NOW() + INTERVAL '24 hours'
  )
  RETURNING id INTO v_handover_id;

  -- Return secret plaintext code and token strictly to the authorized caller
  RETURN jsonb_build_object(
    'success', true,
    'handover_id', v_handover_id,
    'code', v_code,
    'raw_token', v_raw_token,
    'stage', p_stage,
    'expires_at', NOW() + INTERVAL '24 hours'
  );
END;
$$;

-- RPC: Handover Confirmation (Opposite Participant Verification Required)
CREATE OR REPLACE FUNCTION public.confirm_handover(p_input_code_or_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_handover RECORD;
  v_request RECORD;
  v_token_hash TEXT;
  v_code_hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  v_token_hash := encode(digest(TRIM(p_input_code_or_token), 'sha256'), 'hex');
  v_code_hash := encode(digest(UPPER(TRIM(p_input_code_or_token)), 'sha256'), 'hex');

  -- Lock handover row to eliminate race conditions
  SELECT * INTO v_handover
  FROM public.handovers
  WHERE (token_hash = v_token_hash OR code_hash = v_code_hash)
    AND is_used = FALSE
    AND expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid, expired, or already used verification code.');
  END IF;

  -- Anti-bruteforce check
  IF v_handover.attempt_count >= 5 THEN
    UPDATE public.handovers SET is_used = TRUE WHERE id = v_handover.id;
    RETURN jsonb_build_object('success', false, 'error', 'Maximum verification attempts exceeded. Please generate a new code.');
  END IF;

  SELECT * INTO v_request FROM public.requests WHERE id = v_handover.request_id FOR UPDATE;

  -- Enforce that a participant CANNOT confirm their own generated token
  IF auth.uid() = v_handover.generated_by AND NOT public.is_admin() THEN
    UPDATE public.handovers SET attempt_count = attempt_count + 1 WHERE id = v_handover.id;
    RETURN jsonb_build_object('success', false, 'error', 'Security violation: You cannot verify your own handover token. The other participant must verify it.');
  END IF;

  -- Enforce that confirming user is the other valid participant in the transaction
  IF auth.uid() != v_request.owner_id AND auth.uid() != v_request.borrower_id AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only transaction participants can confirm handovers.');
  END IF;

  -- Mark handover used
  UPDATE public.handovers
  SET is_used = TRUE,
      confirmed_by = auth.uid(),
      confirmed_at = NOW()
  WHERE id = v_handover.id;

  -- Atomic state transitions
  IF v_handover.stage = 'pickup' THEN
    IF v_request.status != 'approved' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Request is not in approved status.');
    END IF;
    UPDATE public.requests SET status = 'borrowed', updated_at = NOW() WHERE id = v_request.id;
    UPDATE public.items SET status = 'borrowed', updated_at = NOW() WHERE id = v_request.item_id;
  ELSIF v_handover.stage = 'return' THEN
    IF v_request.status != 'borrowed' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Request is not in borrowed status.');
    END IF;
    UPDATE public.requests SET status = 'returned', updated_at = NOW() WHERE id = v_request.id;
    UPDATE public.items SET status = 'available', updated_at = NOW() WHERE id = v_request.item_id;

    -- Increment community reputation counts
    IF v_request.borrower_id IS NOT NULL THEN
      UPDATE public.profiles SET total_returns = total_returns + 1 WHERE id = v_request.borrower_id;
    END IF;
    IF v_request.owner_id IS NOT NULL THEN
      UPDATE public.profiles SET total_borrows = total_borrows + 1 WHERE id = v_request.owner_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'stage', v_handover.stage, 
    'request_id', v_request.id, 
    'item_id', v_request.item_id
  );
END;
$$;

-- --------------------------------------------------------------------
-- 9. NEED IT NOW: URGENT REQUESTS (Privacy Shield)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.urgent_needs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  requester_contact TEXT NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  urgency TEXT DEFAULT 'high' CHECK (urgency IN ('immediate', 'high', 'within_week')),
  duration_needed TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urgent_category ON public.urgent_needs(category);
CREATE INDEX IF NOT EXISTS idx_urgent_status ON public.urgent_needs(status);
CREATE INDEX IF NOT EXISTS idx_urgent_user_id ON public.urgent_needs(user_id);

-- Public Discovery View: Strips requester_contact so private contact info is never indexed
CREATE OR REPLACE VIEW public.public_urgent_needs AS
SELECT 
  id,
  user_id,
  requester_name,
  item_name,
  category,
  area,
  lat,
  lng,
  urgency,
  duration_needed,
  description,
  status,
  created_at
FROM public.urgent_needs;

-- --------------------------------------------------------------------
-- 10. LOST AND FOUND TABLE (Protected Private Identifying Detail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lost_found (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  incident_date DATE NOT NULL,
  public_description TEXT NOT NULL,
  private_identifying_details TEXT NOT NULL,
  image_url TEXT,
  reporter_name TEXT NOT NULL,
  reporter_contact TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'recovered', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lost_found_type ON public.lost_found(type);
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON public.lost_found(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_user_id ON public.lost_found(user_id);

-- Public Discovery View: Hides secret identifying details and reporter contact
CREATE OR REPLACE VIEW public.public_lost_found AS
SELECT 
  id,
  type,
  title,
  category,
  area,
  incident_date,
  public_description,
  image_url,
  status,
  created_at
FROM public.lost_found;

-- --------------------------------------------------------------------
-- 11. REVIEWS & COMMUNITY REPUTATION TABLE (Strict Transaction Bindings)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_review_request_reviewer UNIQUE(request_id, reviewer_id),
  CONSTRAINT check_not_self_review CHECK (reviewer_id != reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);

-- RPC: Submit Review Deriving Relationships Directly from Completed Transaction
CREATE OR REPLACE FUNCTION public.submit_item_review(
  p_request_id BIGINT,
  p_rating INT,
  p_comment TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_reviewee UUID;
  v_review_id BIGINT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  IF p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rating must be between 1 and 5.');
  END IF;

  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found.');
  END IF;

  IF v_request.status != 'returned' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reviews can only be submitted after item return is confirmed.');
  END IF;

  -- Determine opposite participant
  IF auth.uid() = v_request.borrower_id THEN
    v_reviewee := v_request.owner_id;
  ELSIF auth.uid() = v_request.owner_id THEN
    v_reviewee := v_request.borrower_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Only transaction participants can review this transaction.');
  END IF;

  IF v_reviewee IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot review a transaction without an assigned counterparty.');
  END IF;

  INSERT INTO public.reviews (request_id, item_id, reviewer_id, reviewee_id, rating, comment)
  VALUES (p_request_id, v_request.item_id, auth.uid(), v_reviewee, p_rating, TRIM(p_comment))
  RETURNING id INTO v_review_id;

  RETURN jsonb_build_object('success', true, 'review_id', v_review_id);
END;
$$;

-- --------------------------------------------------------------------
-- 12. FAVORITES TABLE (Enforced Strict Uniqueness)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_item_favorite UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- --------------------------------------------------------------------
-- 13. IN-APP NOTIFICATIONS TABLE (Restricted Updates)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'request_received', 
    'request_approved', 
    'request_rejected', 
    'handover_confirmed', 
    'return_reminder', 
    'urgent_match', 
    'blood_request', 
    'security_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Trigger: Users can ONLY update is_read
CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR
     NEW.user_id IS DISTINCT FROM OLD.user_id OR
     NEW.type IS DISTINCT FROM OLD.type OR
     NEW.title IS DISTINCT FROM OLD.title OR
     NEW.message IS DISTINCT FROM OLD.message OR
     NEW.link IS DISTINCT FROM OLD.link THEN
    RAISE EXCEPTION 'Security violation: Only is_read status may be modified on notifications.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_notification_fields ON public.notifications;
CREATE TRIGGER trg_protect_notification_fields
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_notification_fields();

-- --------------------------------------------------------------------
-- 14. ABUSE REPORTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('item', 'donor', 'user', 'lost_found', 'urgent_need')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'offensive', 'fake_listing', 'medical_concern', 'fraud', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);

-- --------------------------------------------------------------------
-- 15. ADMIN AUDIT LOGS (Immutable Security Trail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON public.admin_audit_logs(admin_id);

-- --------------------------------------------------------------------
-- 16. LEGACY RECORD OWNERSHIP CLAIM WORKFLOW
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_legacy_item(p_item_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  SELECT * INTO v_item FROM public.items WHERE id = p_item_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found.');
  END IF;

  IF v_item.user_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'This item already has an assigned owner.');
  END IF;

  -- Only allow claim if user is moderator/admin or verified claim workflow
  IF NOT public.is_moderator() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Claiming starter community listings requires moderator verification.');
  END IF;

  UPDATE public.items 
  SET user_id = auth.uid(),
      is_legacy = FALSE,
      updated_at = NOW()
  WHERE id = p_item_id;

  RETURN jsonb_build_object('success', true, 'item_id', p_item_id);
END;
$$;

-- ====================================================================
-- 17. ZERO-TRUST ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile, moderators view all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_moderator());

CREATE POLICY "Users update own profile with strict trigger protection"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- FAVORITES
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications read state"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- REPORTS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users submit reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters view own reports, moderators view all"
  ON public.reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR public.is_moderator());

CREATE POLICY "Only moderators update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.is_moderator())
  WITH CHECK (public.is_moderator());

-- ITEMS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active and legacy items"
  ON public.items FOR SELECT
  USING (status != 'inactive' OR user_id = auth.uid() OR is_legacy = TRUE);

CREATE POLICY "Authenticated users insert items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners update own items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (is_legacy = TRUE AND public.is_admin()))
  WITH CHECK (auth.uid() = user_id OR (is_legacy = TRUE AND public.is_admin()));

CREATE POLICY "Owners delete own items"
  ON public.items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR (is_legacy = TRUE AND public.is_admin()));

-- DONORS (No direct anonymous reads; queries go through public_donors view)
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors view own record, admins view all"
  ON public.donors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Authenticated users register as donor"
  ON public.donors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Donors update own profile"
  ON public.donors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (is_legacy = TRUE AND public.is_admin()))
  WITH CHECK (auth.uid() = user_id OR (is_legacy = TRUE AND public.is_admin()));

CREATE POLICY "Donors delete own profile"
  ON public.donors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- DONOR CONTACT REQUESTS
ALTER TABLE public.donor_contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters and donors view contact requests"
  ON public.donor_contact_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_user_id 
    OR auth.uid() = (SELECT user_id FROM public.donors WHERE id = donor_id)
    OR public.is_admin()
  );

CREATE POLICY "Authenticated users submit contact requests"
  ON public.donor_contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_user_id);

-- Direct UPDATE on donor_contact_requests is blocked; handled via respond_donor_contact_request RPC

-- REQUESTS (Direct client INSERT/UPDATE is blocked; handled via RPCs)
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Borrowers and owners view their requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (auth.uid() = borrower_id OR auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Borrowers cancel own pending requests"
  ON public.requests FOR DELETE
  TO authenticated
  USING (auth.uid() = borrower_id AND status = 'pending');

-- HANDOVERS (Zero Direct Client Read/Write; RPC handled exclusively)
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view raw handover records"
  ON public.handovers FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- URGENT NEEDS
ALTER TABLE public.urgent_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters and admins view full urgent need"
  ON public.urgent_needs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users insert urgent needs"
  ON public.urgent_needs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors update own urgent needs"
  ON public.urgent_needs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors delete own urgent needs"
  ON public.urgent_needs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- LOST AND FOUND
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters and admins view full lost_found record"
  ON public.lost_found FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users report lost or found item"
  ON public.lost_found FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reporters update own listing"
  ON public.lost_found FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reporters delete own listing"
  ON public.lost_found FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- REVIEWS (Direct client INSERT is blocked; handled via submit_item_review RPC)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authors update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Authors or admins delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id OR public.is_admin());

-- ADMIN AUDIT LOGS (Immutable)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- --------------------------------------------------------------------
-- 18. EXPLICIT LEAST-PRIVILEGE GRANTS & REVOCATIONS
-- --------------------------------------------------------------------
-- Revoke all blanket permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Allow schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public Views (Zero Sensitive Field Leakage)
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.public_donors TO anon, authenticated;
GRANT SELECT ON public.public_urgent_needs TO anon, authenticated;
GRANT SELECT ON public.public_lost_found TO anon, authenticated;

-- Public Items & Reviews read
GRANT SELECT ON public.items TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;

-- Authenticated table access (restricted by RLS)
GRANT INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.donors TO authenticated;
GRANT SELECT, DELETE ON public.requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.urgent_needs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lost_found TO authenticated;
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT UPDATE ON public.reports TO authenticated; -- for moderators
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.donor_contact_requests TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;

-- Sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RPC Execution Privileges
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_moderator() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_borrow_request(BIGINT, TEXT, TEXT, TEXT, DATE, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_borrow_request(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_borrow_request(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_borrow_request(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_handover_token(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_handover(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_donor_contact_request(BIGINT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_item_review(BIGINT, INT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_legacy_item(BIGINT) TO authenticated;

COMMIT;

-- ====================================================================
-- END OF MIGRATION V4.0.0
-- ====================================================================
