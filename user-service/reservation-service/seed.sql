DO $$
DECLARE
  d DATE;
  t TIME;
  times TIME[] := ARRAY[
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '13:00','13:30','14:00','14:30','15:00','15:30',
    '16:00','16:30','17:00','17:30','18:00','18:30'
  ];
BEGIN
  FOR i IN 0..59 LOOP
    d := CURRENT_DATE + i;
    FOREACH t IN ARRAY times LOOP
      INSERT INTO reservations (date, time, is_available)
      VALUES (d, t, TRUE)
      ON CONFLICT (date, time) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;