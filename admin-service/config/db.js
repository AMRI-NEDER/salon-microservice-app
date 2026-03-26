const { Pool } = require("pg");

const ssl = process.env.NODE_ENV === "production"
  ? { rejectUnauthorized: false } : false;

const authPool         = new Pool({ connectionString: process.env.AUTH_DB_URL,         ssl });
const bookingPool      = new Pool({ connectionString: process.env.BOOKING_DB_URL,      ssl });
const reservationPool  = new Pool({ connectionString: process.env.RESERVATION_DB_URL,  ssl });
const notificationPool = new Pool({ connectionString: process.env.NOTIFICATION_DB_URL, ssl });
const promotionPool    = new Pool({ connectionString: process.env.PROMOTION_DB_URL,    ssl });

authPool.on        ("error", e => console.error("[admin/auth-db]",   e.message));
bookingPool.on     ("error", e => console.error("[admin/booking-db]", e.message));
reservationPool.on ("error", e => console.error("[admin/res-db]",     e.message));
notificationPool.on("error", e => console.error("[admin/notif-db]",   e.message));
promotionPool.on   ("error", e => console.error("[admin/promo-db]",   e.message));

module.exports = { authPool, bookingPool, reservationPool, notificationPool, promotionPool };
