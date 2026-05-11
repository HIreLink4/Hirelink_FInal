-- HireLink Sample Data for Kerala Districts
-- Districts: Thiruvananthapuram, Kollam, Pathanamthitta (Adoor), Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, Kasaragod

-- 1. Adoor, Pathanamthitta
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Adoor Electricals', 'adoor.elec.sample@example.com', '9990000001', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_1 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_1, 'Adoor Electrical Services', 'Expert electrical services in Adoor and surrounding areas.', 'Your safety is our priority', 8, 9.1557, 76.7327, 'Main Road, Adoor, Pathanamthitta', '691523', 'Adoor', 'Pathanamthitta', 'Kerala', 'VERIFIED', 1);
SET @provider_id_1 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_1, 1, 'Complete House Wiring', 'Professional wiring for new and old houses.', 5000.00, 'STARTING_FROM', 480);
INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_1, 11, 'Switchboard Repair', 'Fixing faulty switches and sockets.', 200.00, 'FIXED', 30);

-- 2. Pathanamthitta Town
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Pathanamthitta Plumbers', 'pta.plumbing.sample@example.com', '9990000002', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_2 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_2, 'PTA Plumbing Solutions', 'Expert plumbing for homes and offices.', 'Leak-free life', 10, 9.2648, 76.7870, 'College Road, Pathanamthitta', '689645', 'Pathanamthitta', 'Pathanamthitta', 'Kerala', 'VERIFIED', 2);
SET @provider_id_2 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_2, 2, 'Pipe Leak Repair', 'Fixing all types of pipe leaks.', 350.00, 'FIXED', 60);

-- 3. Trivandrum
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('TVM Cleaning Pros', 'tvm.clean.sample@example.com', '9990000003', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_3 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_3, 'Capital City Cleaners', 'Professional deep cleaning services.', 'Shine like the capital', 5, 8.5241, 76.9366, 'MG Road, Trivandrum', '695001', 'Trivandrum', 'Thiruvananthapuram', 'Kerala', 'VERIFIED', 4);
SET @provider_id_3 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_3, 4, 'Full Home Deep Cleaning', 'Comprehensive cleaning of all rooms.', 2500.00, 'FIXED', 300);

-- 4. Kollam
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Kollam Carpenters', 'klm.carp.sample@example.com', '9990000004', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_4 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_4, 'Quilon Woodworks', 'Fine furniture and repairs.', 'Crafting your dreams', 15, 8.8932, 76.6141, 'Chinnakada, Kollam', '691001', 'Kollam', 'Kollam', 'Kerala', 'VERIFIED', 3);
SET @provider_id_4 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_4, 3, 'Furniture Assembly', 'Assembly of wardrobes, beds, etc.', 800.00, 'HOURLY', 120);

-- 5. Ernakulam (Kochi)
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Kochi AC Tech', 'kochi.ac.sample@example.com', '9990000005', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_5 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_5, 'Cochin Cooling Solutions', 'AC repair and maintenance experts.', 'Stay cool in the city', 7, 9.9312, 76.2673, 'Edappally, Kochi', '682024', 'Kochi', 'Ernakulam', 'Kerala', 'VERIFIED', 6);
SET @provider_id_5 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_5, 6, 'AC Split Service', 'Standard wet service for split AC.', 599.00, 'FIXED', 90);

-- 6. Kozhikode
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Calicut Painters', 'clt.paint.sample@example.com', '9990000006', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_6 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_6, 'Malabar Painters', 'Professional home painting.', 'Colors of Malabar', 12, 11.2588, 75.7804, 'Beach Road, Kozhikode', '673001', 'Kozhikode', 'Kozhikode', 'Kerala', 'VERIFIED', 5);
SET @provider_id_6 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_6, 5, 'Interior Wall Painting', 'High quality emulsion painting.', 15.00, 'PER_SQFT', 1440);

-- 7. Thrissur
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Thrissur Security', 'tsr.sec.sample@example.com', '9990000007', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_7 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_7, 'Gajapada Security', 'CCTV and home security systems.', 'Watching over you', 6, 10.5276, 76.2144, 'Swaraj Round, Thrissur', '680001', 'Thrissur', 'Thrissur', 'Kerala', 'VERIFIED', 10);
SET @provider_id_7 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_7, 10, 'CCTV Installation', 'Installation of 4 camera setup.', 12000.00, 'STARTING_FROM', 240);

-- 8. Alappuzha
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Alleppey Mason', 'alp.mason.sample@example.com', '9990000008', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_8 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_8, 'Backwater Masonry', 'Tile work and renovation.', 'Strong as a rock', 20, 9.4981, 76.3388, 'Vazhicherry, Alappuzha', '688001', 'Alappuzha', 'Alappuzha', 'Kerala', 'VERIFIED', 7);
SET @provider_id_8 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_8, 7, 'Floor Tiling', 'Premium tile laying service.', 40.00, 'PER_SQFT', 1440);

-- 9. Kottayam
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Kottayam Welders', 'ktm.weld.sample@example.com', '9990000009', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_9 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_9, 'Akshara Welders', 'Gate and grill works.', 'Strength and beauty', 9, 9.5916, 76.5221, 'Kanjikuzhy, Kottayam', '686001', 'Kottayam', 'Kottayam', 'Kerala', 'VERIFIED', 8);
SET @provider_id_9 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_9, 8, 'Gate Repair', 'Welding repairs for iron gates.', 500.00, 'STARTING_FROM', 120);

-- 10. Malappuram
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Malappuram Pest', 'mlp.pest.sample@example.com', '9990000010', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_10 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_10, 'Green Land Pest Control', 'Eco-friendly pest management.', 'Pest-free environment', 4, 11.0510, 76.0711, 'Down Hill, Malappuram', '676505', 'Malappuram', 'Malappuram', 'Kerala', 'VERIFIED', 9);
SET @provider_id_10 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_10, 9, 'Termite Treatment', 'Anti-termite treatment for homes.', 3000.00, 'FIXED', 180);

-- 11. Palakkad
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Palakkad Mason', 'pkd.mason.sample@example.com', '9990000011', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_11 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_11, 'Granite City Masonry', 'Granite laying and construction.', 'Solid foundations', 18, 10.7867, 76.6547, 'Fort Maidan, Palakkad', '678001', 'Palakkad', 'Palakkad', 'Kerala', 'VERIFIED', 7);
SET @provider_id_11 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_11, 7, 'Kitchen Granite Laying', 'Expert granite fixing.', 1500.00, 'FIXED', 480);

-- 12. Wayanad
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Wayanad Carpentry', 'wynd.carp.sample@example.com', '9990000012', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_12 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_12, 'Hill View Interiors', 'Custom wooden interiors.', 'Natural elegance', 11, 11.6103, 76.0829, 'Kalpetta, Wayanad', '673121', 'Kalpetta', 'Wayanad', 'Kerala', 'VERIFIED', 3);
SET @provider_id_12 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_12, 3, 'Wooden Partitioning', 'Creating beautiful wooden dividers.', 200.00, 'PER_SQFT', 720);

-- 13. Kannur
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Kannur Electricals', 'knr.elec.sample@example.com', '9990000013', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_13 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_13, 'Fort City Electricals', 'All types of electrical works.', 'Powering the North', 14, 11.8745, 75.3704, 'Thalassery Road, Kannur', '670001', 'Kannur', 'Kannur', 'Kerala', 'VERIFIED', 1);
SET @provider_id_13 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_13, 13, 'Chandelier Fitting', 'Safe installation of light fixtures.', 450.00, 'FIXED', 60);

-- 14. Kasaragod
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Kasaragod Plumbing', 'ksd.plumb.sample@example.com', '9990000014', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_14 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_14, 'Sapthagiri Plumbers', 'Reliable plumbing services.', 'Quality you can trust', 13, 12.4996, 74.9869, 'New Bus Stand, Kasaragod', '671121', 'Kasaragod', 'Kasaragod', 'Kerala', 'VERIFIED', 2);
SET @provider_id_14 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_14, 15, 'Mixer Tap Repair', 'Repairing or replacing mixer taps.', 300.00, 'FIXED', 45);

-- 15. Idukki
INSERT INTO users (name, email, phone, password_hash, user_type, account_status, is_email_verified, is_phone_verified, auth_provider)
VALUES ('Idukki Mason', 'idk.mason.sample@example.com', '9990000015', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOnu', 'PROVIDER', 'ACTIVE', 1, 1, 'LOCAL');
SET @user_id_15 = LAST_INSERT_ID();

INSERT INTO service_providers (user_id, business_name, business_description, tagline, experience_years, base_latitude, base_longitude, base_address, base_pincode, city, district, state, kyc_status, primary_category_id)
VALUES (@user_id_15, 'Hill Top Masonry', 'Staircase and wall construction.', 'Building with nature', 25, 9.8500, 76.9400, 'Painavu, Idukki', '685603', 'Idukki', 'Idukki', 'Kerala', 'VERIFIED', 7);
SET @provider_id_15 = LAST_INSERT_ID();

INSERT INTO services (provider_id, category_id, service_name, service_description, base_price, price_type, estimated_duration_minutes)
VALUES (@provider_id_15, 7, 'Stone Wall Construction', 'Traditional stone masonry.', 250.00, 'PER_SQFT', 1440);
