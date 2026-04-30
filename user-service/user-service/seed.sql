INSERT INTO users (name, email, phone, role)
VALUES
('houcem aouled marzouk', 'houcem@gmail.com', '26897189', 'user'),
('Jalel Amri', 'jalelamri@gmail.com', '97982855', 'user'),
('abdrahim', 'bahrini@gmail.com', '22489622', 'user'),
('Emma', 'emnasghiri@gmail.com', '44444444', 'user'),
('Admin', 'admin@gmail.com', '11111111', 'admin')
ON CONFLICT (email) DO NOTHING;