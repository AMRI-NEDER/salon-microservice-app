INSERT INTO users (name, email, password, role) VALUES
(
  'Admin',
  'elamrineder100@gmail.com',
  '$2b$10$scMif8MqCa5zxP.h4bjuw.78D6K1ztxZCC9MUasJsFpuF1Dp4HiUO',
  'admin'
)
ON CONFLICT (email) DO NOTHING;