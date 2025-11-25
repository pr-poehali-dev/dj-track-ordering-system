ALTER TABLE track_orders ADD COLUMN celebration_text TEXT;
ALTER TABLE track_orders ADD COLUMN has_celebration BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS tariff_prices (
  id SERIAL PRIMARY KEY,
  tariff_id VARCHAR(50) UNIQUE NOT NULL,
  price INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tariff_prices (tariff_id, price) VALUES 
  ('express', 1500),
  ('standard', 500),
  ('economy', 200)
ON CONFLICT (tariff_id) DO NOTHING;