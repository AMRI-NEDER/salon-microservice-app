INSERT INTO bookings (user_id, user_name, user_email, service, date, time, status, notes)
VALUES
(gen_random_uuid(), 'houcem aouled marzouk', 'houcem@gmail.com', 'Classic Haircut', CURRENT_DATE, '10:00', 'confirmed', ''),
(gen_random_uuid(), 'Jalel Amri', 'jalelamri@gmail.com', 'Beard Trim', CURRENT_DATE + 1, '11:30', 'confirmed', ''),
(gen_random_uuid(), 'abdrahim', 'bahrini@gmail.com', 'Hair Wash', CURRENT_DATE + 2, '14:00', 'completed', ''),
(gen_random_uuid(), 'Emma', 'emnasghiri@gmail.com', 'Skin Fade', CURRENT_DATE + 3, '16:00', 'no-show', ''),
(gen_random_uuid(), 'Admin', 'admin@gmail.com', 'Full Grooming', CURRENT_DATE + 4, '18:00', 'confirmed', '');