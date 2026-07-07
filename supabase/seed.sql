-- Seeding database for FarmLink Ghana MVP
-- All passwords are set to standard hash for 'password123' using pgcrypto's crypt function
-- Uses auth.users inserts to trigger public.profiles and child tables automatically

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE public.admin_logs CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.reviews CASCADE;
TRUNCATE TABLE public.transport_requests CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.produce CASCADE;
TRUNCATE TABLE public.transport_profiles CASCADE;
TRUNCATE TABLE public.buyer_profiles CASCADE;
TRUNCATE TABLE public.farmer_profiles CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
DELETE FROM auth.users WHERE email LIKE '%@farmlink.com';

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SEED USERS INTO auth.users
-- Farmers (20 total)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role, raw_app_meta_data) VALUES
('f1000000-0000-0000-0000-000000000001', 'kwame.mensah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kwame Mensah", "phone_number":"+233241000001", "location_name":"Kumasi Central", "latitude":6.696, "longitude":-1.624, "farm_name":"Mensah Farms"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000002', 'kofi.annan@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kofi Annan", "phone_number":"+233241000002", "location_name":"Mampong", "latitude":7.062, "longitude":-1.403, "farm_name":"Annan Vegetable Haven"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000003', 'yao.boateng@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Yao Boateng", "phone_number":"+233241000003", "location_name":"Obuasi", "latitude":6.206, "longitude":-1.669, "farm_name":"Obuasi Agro Group"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000004', 'akua.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Akua Addo", "phone_number":"+233241000004", "location_name":"Ejura", "latitude":7.378, "longitude":-1.374, "farm_name":"Ejura Green Fields"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000005', 'abena.osei@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Abena Osei", "phone_number":"+233241000005", "location_name":"Konongo", "latitude":6.616, "longitude":-1.214, "farm_name":"Osei Organic Hub"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000006', 'kwabena.owusu@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kwabena Owusu", "phone_number":"+233241000006", "location_name":"Bekwai", "latitude":6.452, "longitude":-1.585, "farm_name":"Owusu Produce Delivery"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000007', 'ekow.mensah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Ekow Mensah", "phone_number":"+233241000007", "location_name":"Offinso", "latitude":6.890, "longitude":-1.650, "farm_name":"Offinso Farms"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000008', 'ama.serwaa@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Ama Serwaa", "phone_number":"+233241000008", "location_name":"Kumasi Central", "latitude":6.698, "longitude":-1.622, "farm_name":"Serwaa & Sons Crop Co"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000009', 'afua.appiah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Afua Appiah", "phone_number":"+233241000009", "location_name":"Mampong", "latitude":7.060, "longitude":-1.405, "farm_name":"Appiah Organic Greens"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000010', 'kojo.antwi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kojo Antwi", "phone_number":"+233241000010", "location_name":"Obuasi", "latitude":6.208, "longitude":-1.667, "farm_name":"Antwi Harvest"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000011', 'yaa.asante@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Yaa Asante", "phone_number":"+233241000011", "location_name":"Ejura", "latitude":7.376, "longitude":-1.376, "farm_name":"Asante Vegetable Farms"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000012', 'kwadwo.gyasi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kwadwo Gyasi", "phone_number":"+233241000012", "location_name":"Konongo", "latitude":6.614, "longitude":-1.216, "farm_name":"Gyasi Eco Farm"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000013', 'amanda.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Amanda Addo", "phone_number":"+233241000013", "location_name":"Bekwai", "latitude":6.450, "longitude":-1.587, "farm_name":"Amanda Crops"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000014', 'emmanuel.boateng@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Emmanuel Boateng", "phone_number":"+233241000014", "location_name":"Offinso", "latitude":6.892, "longitude":-1.648, "farm_name":"Emmanuel Farms"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000015', 'comfort.antwi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Comfort Antwi", "phone_number":"+233241000015", "location_name":"Kumasi Central", "latitude":6.694, "longitude":-1.626, "farm_name":"Comfort Greenhouses"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000016', 'kwaku.baah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Kwaku Baah", "phone_number":"+233241000016", "location_name":"Mampong", "latitude":7.064, "longitude":-1.401, "farm_name":"Baah Roots"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000017', 'esther.owusu@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Esther Owusu", "phone_number":"+233241000017", "location_name":"Obuasi", "latitude":6.204, "longitude":-1.671, "farm_name":"Esther Farms"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000018', 'samuel.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Samuel Addo", "phone_number":"+233241000018", "location_name":"Ejura", "latitude":7.380, "longitude":-1.372, "farm_name":"Addo Spices Ltd"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000019', 'rita.osei@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Rita Osei", "phone_number":"+233241000019", "location_name":"Konongo", "latitude":6.618, "longitude":-1.212, "farm_name":"Rita Crops"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('f1000000-0000-0000-0000-000000000020', 'simon.mensah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"farmer", "full_name":"Simon Mensah", "phone_number":"+233241000020", "location_name":"Bekwai", "latitude":6.454, "longitude":-1.583, "farm_name":"Simon Organics"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}');

-- Buyers (15 total)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role, raw_app_meta_data) VALUES
('b1000000-0000-0000-0000-000000000001', 'mary.mensah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Mary Mensah", "phone_number":"+233242000001", "location_name":"Kumasi Central", "latitude":6.697, "longitude":-1.621, "business_name":"Mary & Family Grocery"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000002', 'grace.ofori@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Grace Ofori", "phone_number":"+233242000002", "location_name":"Mampong", "latitude":7.059, "longitude":-1.406, "business_name":"Grace Wholesale Vegetables"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000003', 'ebenezer.gyasi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Ebenezer Gyasi", "phone_number":"+233242000003", "location_name":"Obuasi", "latitude":6.207, "longitude":-1.666, "business_name":"Gyasi Organic Retail"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000004', 'george.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"George Addo", "phone_number":"+233242000004", "location_name":"Ejura", "latitude":7.375, "longitude":-1.375, "business_name":"Addo Foods Ltd"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000005', 'victoria.asante@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Victoria Asante", "phone_number":"+233242000005", "location_name":"Konongo", "latitude":6.615, "longitude":-1.215, "business_name":"Asante Vegetable Mart"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000006', 'sarah.gyamfi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Sarah Gyamfi", "phone_number":"+233242000006", "location_name":"Bekwai", "latitude":6.451, "longitude":-1.586, "business_name":"Gyamfi Corner Shop"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000007', 'david.appiah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"David Appiah", "phone_number":"+233242000007", "location_name":"Offinso", "latitude":6.891, "longitude":-1.649, "business_name":"Appiah Supermarket"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000008', 'patricia.annan@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Patricia Annan", "phone_number":"+233242000008", "location_name":"Kumasi Central", "latitude":6.699, "longitude":-1.623, "business_name":"Annan Fresh Stalls"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000009', 'john.owusu@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"John Owusu", "phone_number":"+233242000009", "location_name":"Mampong", "latitude":7.061, "longitude":-1.404, "business_name":"Owusu Eatery"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000010', 'elizabeth.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Elizabeth Addo", "phone_number":"+233242000010", "location_name":"Obuasi", "latitude":6.205, "longitude":-1.668, "business_name":"Elizabeth Spices"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000011', 'robert.gyasi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Robert Gyasi", "phone_number":"+233242000011", "location_name":"Ejura", "latitude":7.377, "longitude":-1.373, "business_name":"Gyasi Distribution"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000012', 'theresa.osei@farmlink.com', '$2a$10$LT7r0U/tE6wYvJ/29XpBme.cO2106nI4wJ9R1Z1P1YfO7oT4P5eI2', NOW(), '{"role":"buyer", "full_name":"Theresa Osei", "phone_number":"+233242000012", "location_name":"Konongo", "latitude":6.617, "longitude":-1.213, "business_name":"Osei Green Market"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000013', 'charles.mensah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Charles Mensah", "phone_number":"+233242000013", "location_name":"Bekwai", "latitude":6.453, "longitude":-1.584, "business_name":"Kumasi Veggies Outlet"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000014', 'irene.addo@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"Irene Addo", "phone_number":"+233242000014", "location_name":"Offinso", "latitude":6.893, "longitude":-1.647, "business_name":"Irene Veg Mart"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('b1000000-0000-0000-0000-000000000015', 'james.baah@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"buyer", "full_name":"James Baah", "phone_number":"+233242000015", "location_name":"Kumasi Central", "latitude":6.695, "longitude":-1.625, "business_name":"Baah Wholesalers"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}');

-- Transporters (8 total)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role, raw_app_meta_data) VALUES
('d1000000-0000-0000-0000-000000000001', 'isaac.boateng@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Isaac Boateng", "phone_number":"+233243000001", "location_name":"Kumasi Central", "latitude":6.696, "longitude":-1.624, "vehicle_type":"Aboboyaa Motor", "vehicle_plate":"AS 4820-24"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000002', 'samuel.osei@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Samuel Osei", "phone_number":"+233243000002", "location_name":"Mampong", "latitude":7.062, "longitude":-1.403, "vehicle_type":"Kia Ceres Truck", "vehicle_plate":"AS 1290-23"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000003', 'emmanuel.owusu@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Emmanuel Owusu", "phone_number":"+233243000003", "location_name":"Obuasi", "latitude":6.206, "longitude":-1.669, "vehicle_type":"Tricycle", "vehicle_plate":"AS 9081-25"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000004', 'peter.koomson@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Peter Koomson", "phone_number":"+233243000004", "location_name":"Ejura", "latitude":7.378, "longitude":-1.374, "vehicle_type":"Aboboyaa Motor", "vehicle_plate":"AS 3042-24"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000005', 'joseph.baffour@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Joseph Baffour", "phone_number":"+233243000005", "location_name":"Konongo", "latitude":6.616, "longitude":-1.214, "vehicle_type":"Kia Ceres Truck", "vehicle_plate":"AS 2801-22"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000006', 'stephen.gyamfi@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Stephen Gyamfi", "phone_number":"+233243000006", "location_name":"Bekwai", "latitude":6.452, "longitude":-1.585, "vehicle_type":"Aboboyaa Motor", "vehicle_plate":"AS 8831-23"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000007', 'kwadwo.asante@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Kwadwo Asante", "phone_number":"+233243000007", "location_name":"Offinso", "latitude":6.890, "longitude":-1.650, "vehicle_type":"Hyundai Grace Van", "vehicle_plate":"AS 5231-20"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'),
('d1000000-0000-0000-0000-000000000008', 'daniel.frimpong@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"transporter", "full_name":"Daniel Frimpong", "phone_number":"+233243000008", "location_name":"Kumasi Central", "latitude":6.698, "longitude":-1.622, "vehicle_type":"Aboboyaa Motor", "vehicle_plate":"AS 1450-25"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}');

-- Admin (1 total)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role, raw_app_meta_data) VALUES
('a1000000-0000-0000-0000-000000000001', 'admin@farmlink.com', crypt('password123', gen_salt('bf')), NOW(), '{"role":"admin", "full_name":"System Admin", "phone_number":"+233244000001"}', NOW(), NOW(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}');

-- 2. SEED PRODUCE LISTINGS (100 total)
-- Loop-generate 100 entries of Ghanaian vegetables
DO $$
DECLARE
  farmers UUID[] := ARRAY[
    'f1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002',
    'f1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000004',
    'f1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000006',
    'f1000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000008',
    'f1000000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000010',
    'f1000000-0000-0000-0000-000000000011', 'f1000000-0000-0000-0000-000000000012',
    'f1000000-0000-0000-0000-000000000013', 'f1000000-0000-0000-0000-000000000014',
    'f1000000-0000-0000-0000-000000000015', 'f1000000-0000-0000-0000-000000000016',
    'f1000000-0000-0000-0000-000000000017', 'f1000000-0000-0000-0000-000000000018',
    'f1000000-0000-0000-0000-000000000019', 'f1000000-0000-0000-0000-000000000020'
  ];
  farmer_id UUID;
  veg_categories TEXT[] := ARRAY['Tomatoes', 'Pepper', 'Garden Eggs', 'Okra', 'Cabbage', 'Lettuce', 'Spinach', 'Onions'];
  veg_names TEXT[] := ARRAY['Kumasi Red Tomatoes', 'Scotch Bonnet Pepper', 'Local Garden Eggs', 'Fresh Green Okra', 'Head Cabbage', 'Crisp Iceberg Lettuce', 'Local Spinach (Gboma)', 'Bawku Red Onions'];
  veg_category TEXT;
  veg_name TEXT;
  price NUMERIC;
  qty NUMERIC;
  fresh TEXT;
  loc TEXT;
  lat DOUBLE PRECISION;
  lon DOUBLE PRECISION;
  idx INTEGER;
BEGIN
  FOR i IN 1..100 LOOP
    -- Pick a random farmer
    idx := (floor(random() * 20) + 1)::integer;
    farmer_id := farmers[idx];
    
    -- Pick a random category
    idx := (floor(random() * 8) + 1)::integer;
    veg_category := veg_categories[idx];
    veg_name := veg_names[idx] || ' (Batch ' || i || ')';
    
    -- Random price (20 to 150 GHS) and qty (5 to 80 bags)
    price := floor(random() * 130) + 20;
    qty := floor(random() * 75) + 5;
    
    -- Pick random freshness
    idx := (floor(random() * 3) + 1)::integer;
    IF idx = 1 THEN fresh := 'Fresh'; ELSIF idx = 2 THEN fresh := 'Good'; ELSE fresh := 'Fair'; END IF;
    
    -- Pull farmer location details
    SELECT location_name, latitude, longitude INTO loc, lat, lon FROM public.profiles WHERE id = farmer_id;
    
    INSERT INTO public.produce (id, farmer_id, name, category, price_per_unit, unit, quantity_available, harvest_date, freshness_tier, image_url, location_name, latitude, longitude)
    VALUES (
      gen_random_uuid(),
      farmer_id,
      veg_name,
      veg_category,
      price,
      'bag',
      qty,
      CURRENT_DATE - (floor(random() * 5) || ' days')::interval,
      fresh,
      'https://via.placeholder.com/300?text=' || veg_category,
      loc,
      lat,
      lon
    );
  END LOOP;
END;
$$;


-- 3. SEED ORDERS & WORKFLOWS (30 total)
DO $$
DECLARE
  buyers UUID[] := ARRAY[
    'b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000010',
    'b1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000012',
    'b1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000014',
    'b1000000-0000-0000-0000-000000000015'
  ];
  transporters UUID[] := ARRAY[
    'd1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000006',
    'd1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000008'
  ];
  buyer_id UUID;
  transporter_id UUID;
  order_id UUID;
  produce_row RECORD;
  qty INTEGER;
  cost NUMERIC;
  status_val TEXT;
  t_status TEXT;
  b_loc TEXT; b_lat DOUBLE PRECISION; b_lon DOUBLE PRECISION;
  f_loc TEXT; f_lat DOUBLE PRECISION; f_lon DOUBLE PRECISION;
BEGIN
  FOR i IN 1..30 LOOP
    -- Pick buyer
    buyer_id := buyers[(floor(random() * 15) + 1)::integer];
    
    -- Pick random produce item
    SELECT * INTO produce_row FROM public.produce ORDER BY random() LIMIT 1;
    
    qty := floor(random() * 4) + 1;
    cost := produce_row.price_per_unit * qty;
    
    -- Distribute statuses: 10 completed, 5 in_transit, 5 accepted, 5 pending, 5 rejected/cancelled
    IF i <= 10 THEN
      status_val := 'completed';
      t_status := 'delivered';
    ELSIF i <= 15 THEN
      status_val := 'in_transit';
      t_status := 'in_transit';
    ELSIF i <= 20 THEN
      status_val := 'accepted';
      t_status := 'pending';
    ELSIF i <= 25 THEN
      status_val := 'pending';
      t_status := NULL;
    ELSE
      status_val := 'rejected';
      t_status := NULL;
    END IF;
    
    -- Create Order
    INSERT INTO public.orders (id, buyer_id, farmer_id, total_price, status, created_at)
    VALUES (gen_random_uuid(), buyer_id, produce_row.farmer_id, cost, status_val, NOW() - (i || ' hours')::interval)
    RETURNING id INTO order_id;
    
    -- Create Order Item
    INSERT INTO public.order_items (order_id, produce_id, quantity, price_at_purchase)
    VALUES (order_id, produce_row.id, qty, produce_row.price_per_unit);
    
    -- Create Transport Request if order accepted/transit/completed
    IF t_status IS NOT NULL THEN
      -- Pick random transporter
      transporter_id := transporters[(floor(random() * 8) + 1)::integer];
      
      SELECT location_name, latitude, longitude INTO b_loc, b_lat, b_lon FROM public.profiles WHERE id = buyer_id;
      SELECT location_name, latitude, longitude INTO f_loc, f_lat, f_lon FROM public.profiles WHERE id = produce_row.farmer_id;
      
      INSERT INTO public.transport_requests (order_id, transporter_id, status, pickup_latitude, pickup_longitude, pickup_address, delivery_latitude, delivery_longitude, delivery_address, fare)
      VALUES (
        order_id,
        transporter_id,
        t_status,
        f_lat,
        f_lon,
        f_loc,
        b_lat,
        b_lon,
        b_loc,
        30.00 + (floor(random() * 50))
      );
    END IF;
  END LOOP;
END;
$$;


-- 4. SEED REVIEWS (20 total)
DO $$
DECLARE
  order_row RECORD;
  counter INTEGER := 0;
  reviews_pool TEXT[] := ARRAY[
    'Great service, vegetables were extremely fresh!',
    'Delivered on time. Will buy again.',
    'Okra was of good quality. Happy with the price.',
    'Friendly driver and fast delivery.',
    'Good packaging. The tomatoes were solid.',
    'Onions are dry and high quality, perfect for storage.',
    'Reasonable pricing, though driver arrived a bit late.',
    'Fantastic crop! Highly recommend this farmer.'
  ];
BEGIN
  FOR order_row IN 
    SELECT o.id, o.buyer_id, o.farmer_id 
    FROM public.orders o 
    WHERE o.status = 'completed' 
    LIMIT 20
  LOOP
    counter := counter + 1;
    INSERT INTO public.reviews (order_id, reviewer_id, reviewed_user_id, rating, comment)
    VALUES (
      order_row.id,
      order_row.buyer_id,
      order_row.farmer_id,
      floor(random() * 2) + 4, -- Rating 4 or 5
      reviews_pool[(floor(random() * 8) + 1)::integer]
    );
  END LOOP;
END;
$$;

-- 5. SEED AUTH IDENTITIES
-- Automatically matches identities text ID provider details to allow direct password sign-in
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

