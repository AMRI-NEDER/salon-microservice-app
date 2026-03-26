# reservation-service

## Database
- **DB name:** `auracut_reservations`
- **Table:** `reservations`

## Setup
```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE auracut_reservations;"

# 2. Apply schema
psql -U postgres -d auracut_reservations -f schema.sql

# 3. Install & run
npm install
node server.js
```

## Environment
Copy `.env` and fill in your values:
```
DB_URL=postgres://user:password@HOST:5432/auracut_reservations
```
