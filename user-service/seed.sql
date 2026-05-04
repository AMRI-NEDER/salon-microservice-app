INSERT INTO users (name, email, phone, role)
VALUES
('Houcem Awled Marzouk', 'houcem@gmail.com', '26897189', 'user'),
('mohamed amine azouz', 'mhazouz@gmail.com', '97982855', 'user'),
('Abdrahim Bahrini', 'bahrini@gmail.com', '22489622', 'user'),
('emna Nasghiri', 'emnasghiri@gmail.com', '34646844', 'user'),
('Admin', 'admin@gmail.com', '95487417', 'admin')
ON CONFLICT (email) DO NOTHING;