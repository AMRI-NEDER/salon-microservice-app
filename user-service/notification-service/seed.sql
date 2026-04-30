INSERT INTO notifications (user_id, user_name, message, is_read)
VALUES
(gen_random_uuid(), 'houcem aouled marzouk', 'Your booking is confirmed', FALSE),
(gen_random_uuid(), 'Jalel Amri', 'Reminder: appointment tomorrow', FALSE),
(gen_random_uuid(), 'abdrahim', 'Your booking was cancelled', TRUE),
(gen_random_uuid(), 'Emma', 'New promotion available!', FALSE),
(gen_random_uuid(), 'Admin', 'System maintenance tonight', TRUE);