CREATE TABLE IF NOT EXISTS dj_settings (
  id SERIAL PRIMARY KEY,
  is_accepting_orders BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS track_orders (
  id SERIAL PRIMARY KEY,
  track_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  tariff VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS current_playlist (
  id SERIAL PRIMARY KEY,
  track_name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_playing BOOLEAN DEFAULT false
);

INSERT INTO dj_settings (is_accepting_orders) VALUES (true);