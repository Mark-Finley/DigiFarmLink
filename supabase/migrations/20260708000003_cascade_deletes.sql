-- Migration to allow cascading deletes for orders and reviews when a user profile is deleted.
-- This enables clearing seeded and dangling users from the database.

-- 1. Alter public.orders foreign keys
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_farmer_id_fkey;

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_buyer_id_fkey 
  FOREIGN KEY (buyer_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.orders 
  ADD CONSTRAINT orders_farmer_id_fkey 
  FOREIGN KEY (farmer_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 2. Alter public.reviews foreign keys
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_reviewed_user_id_fkey;

ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_reviewer_id_fkey 
  FOREIGN KEY (reviewer_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_reviewed_user_id_fkey 
  FOREIGN KEY (reviewed_user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;
