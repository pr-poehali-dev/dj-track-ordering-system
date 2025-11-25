ALTER TABLE tariff_prices ADD COLUMN name VARCHAR(100);
ALTER TABLE tariff_prices ADD COLUMN time_estimate VARCHAR(50);
ALTER TABLE tariff_prices ADD COLUMN icon VARCHAR(50);

UPDATE tariff_prices SET name = 'Экспресс', time_estimate = '5 минут', icon = 'Zap' WHERE tariff_id = 'express';
UPDATE tariff_prices SET name = 'Стандарт', time_estimate = '15 минут', icon = 'Music' WHERE tariff_id = 'standard';
UPDATE tariff_prices SET name = 'Эконом', time_estimate = '30 минут', icon = 'Clock' WHERE tariff_id = 'economy';