-- Create a profiles table that syncs with auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'transporter', 'admin')),
  full_name TEXT,
  phone_number TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmer metadata
CREATE TABLE public.farmer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name TEXT,
  farm_size_hectares NUMERIC,
  farm_type TEXT,
  verified BOOLEAN DEFAULT FALSE
);

-- Buyer metadata
CREATE TABLE public.buyer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  preferred_categories TEXT[]
);

-- Transporter metadata
CREATE TABLE public.transport_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  license_number TEXT,
  available BOOLEAN DEFAULT TRUE
);

-- Produce listings
CREATE TABLE public.produce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tomatoes', 'Pepper', 'Garden Eggs', 'Okra', 'Cabbage', 'Lettuce', 'Spinach', 'Onions')),
  price_per_unit NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'bag', -- e.g. bag, box, crate
  quantity_available NUMERIC NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  harvest_date DATE NOT NULL,
  freshness_tier TEXT NOT NULL CHECK (freshness_tier IN ('Fresh', 'Good', 'Fair')),
  image_url TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders placed by buyers
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id),
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual items in an order
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  produce_id UUID REFERENCES public.produce(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL
);

-- Logistics tracking for accepted orders
CREATE TABLE public.transport_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered')),
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  pickup_address TEXT,
  delivery_latitude DOUBLE PRECISION,
  delivery_longitude DOUBLE PRECISION,
  delivery_address TEXT,
  fare NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin logging
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTOMATIC SYNC: Trigger from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, phone_number, location_name, latitude, longitude)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'location_name', ''),
    (new.raw_user_meta_data->>'latitude')::double precision,
    (new.raw_user_meta_data->>'longitude')::double precision
  );

  -- Insert default child profile mappings based on user role
  IF COALESCE(new.raw_user_meta_data->>'role', 'buyer') = 'farmer' THEN
    INSERT INTO public.farmer_profiles (id, farm_name) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'farm_name', 'Ghana Fresh Farm'));
  ELSIF COALESCE(new.raw_user_meta_data->>'role', 'buyer') = 'buyer' THEN
    INSERT INTO public.buyer_profiles (id, business_name) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'business_name', 'Independent Retailer'));
  ELSIF COALESCE(new.raw_user_meta_data->>'role', 'buyer') = 'transporter' THEN
    INSERT INTO public.transport_profiles (id, vehicle_type) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'vehicle_type', 'Tricycle/Aboboyaa'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies
-- Profiles: everyone can view profiles, only user can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sub-profiles: user read and edit their own
CREATE POLICY "Farmer profile read" ON public.farmer_profiles FOR SELECT USING (true);
CREATE POLICY "Farmer profile edit" ON public.farmer_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Buyer profile read" ON public.buyer_profiles FOR SELECT USING (true);
CREATE POLICY "Buyer profile edit" ON public.buyer_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Transport profile read" ON public.transport_profiles FOR SELECT USING (true);
CREATE POLICY "Transport profile edit" ON public.transport_profiles FOR ALL USING (auth.uid() = id);

-- Produce: everyone can read, farmers can edit/add/delete their own
CREATE POLICY "Produce listings viewable by everyone" ON public.produce FOR SELECT USING (true);
CREATE POLICY "Farmers can manage their own produce" ON public.produce FOR ALL USING (
  auth.uid() = farmer_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'farmer'
  )
);

-- Orders: involved buyer/farmer can view/edit, buyers can insert
CREATE POLICY "Buyers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Farmers can view orders assigned to them" ON public.orders FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Buyers can insert orders" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() = buyer_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'buyer'
  )
);
CREATE POLICY "Involved parties can update order status" ON public.orders FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = farmer_id
);

-- Order Items: matching order viewable
CREATE POLICY "Order items viewable" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (buyer_id = auth.uid() OR farmer_id = auth.uid())
  )
);
CREATE POLICY "Buyers can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders WHERE id = order_items.order_id AND buyer_id = auth.uid()
  )
);

-- Transport Requests: viewable by all (marketplace style), updateable by transporters/farmers
CREATE POLICY "Transport requests viewable by all" ON public.transport_requests FOR SELECT USING (true);
CREATE POLICY "Transporters can manage requests" ON public.transport_requests FOR UPDATE USING (
  (transporter_id IS NULL OR auth.uid() = transporter_id) AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'transporter'
  )
);
CREATE POLICY "System insert for transport requests" ON public.transport_requests FOR INSERT WITH CHECK (true);

-- Reviews: viewable by all, insertable by order buyers
CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can leave reviews on orders" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND EXISTS (
    SELECT 1 FROM public.orders WHERE id = reviews.order_id AND buyer_id = auth.uid()
  )
);

-- Notifications: user only
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Admin Logs: admins only
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
