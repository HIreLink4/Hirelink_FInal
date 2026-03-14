ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;
 SHOW COLUMNS FROM users LIKE 'password_hash';
 ALTER TABLE users MODIFY COLUMN phone VARCHAR(15) NULL;
 SHOW COLUMNS FROM users LIKE 'phone';
 
 ALTER TABLE bookings ADD COLUMN service_city VARCHAR(100);
ALTER TABLE bookings ADD COLUMN service_state VARCHAR(100);

--verify the location data was saved
SELECT booking_id, booking_number, service_address, service_pincode, 
       service_latitude, service_longitude, service_city, service_state
FROM bookings
ORDER BY created_at DESC
LIMIT 5;