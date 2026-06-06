PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sensors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('temperatura','presion','vibracion','flujo')),
  manufacturer TEXT NOT NULL,
  manufacture_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS zones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  operational_status TEXT NOT NULL DEFAULT 'activa' CHECK (operational_status IN ('activa','inactiva','mantenimiento')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS monitorings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_id INTEGER NOT NULL,
  zone_id INTEGER NOT NULL,
  install_date TEXT NOT NULL,
  reading_type TEXT NOT NULL CHECK (reading_type IN ('temperatura','presion','vibracion','flujo')),
  threshold_value REAL NOT NULL CHECK (threshold_value > 0),
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo','pausado')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  FOREIGN KEY(zone_id) REFERENCES zones(id) ON DELETE CASCADE,
  UNIQUE(sensor_id, zone_id)
);

CREATE INDEX IF NOT EXISTS idx_monitorings_sensor_id ON monitorings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_monitorings_zone_id ON monitorings(zone_id);
CREATE INDEX IF NOT EXISTS idx_monitorings_status ON monitorings(status);

-- Insert sample sensors (10)
INSERT INTO sensors (name, type, manufacturer, manufacture_date) VALUES
('TempSensor-A','temperatura','Siemens','2018-05-12'),
('FlowMeter-1','flujo','Honeywell','2019-03-21'),
('VibeX-200','vibracion','ABB','2020-07-11'),
('TempSensor-B','temperatura','Emerson','2021-01-15'),
('VibeX-300','vibracion','SKF','2022-02-20'),
('FlowMeter-2','flujo','Endress+Hauser','2016-09-05'),
('PressureMax','presion','Yokogawa','2015-12-30'),
('PressureGauge-W1','presion','Wika','2017-11-02'),
('PressureGauge-K1','presion','Keller','2014-08-08'),
('VibeSense-BK1','vibracion','Brüel & Kjær','2023-04-01');

-- Insert sample zones (6)
INSERT INTO zones (name, description, location, operational_status) VALUES
('Calderas','Zona de calderas','Planta A - Sector 1','activa'),
('Compresores','Sala de compresores','Planta A - Sector 2','activa'),
('Tuberías','Red de tuberías principales','Planta B - Sector 1','mantenimiento'),
('Motores','Banco de motores','Planta B - Sector 3','activa'),
('Almacenamiento','Área de almacenamiento','Planta C - Sector 1','inactiva'),
('Empaque','Línea de empaque','Planta C - Sector 2','activa');

-- Insert sample monitorings (12) with mixed statuses and types
INSERT INTO monitorings (sensor_id, zone_id, install_date, reading_type, threshold_value, status) VALUES
(1,1,'2022-01-01','temperatura',75.5,'activo'),
(2,2,'2022-02-15','flujo',10.0,'activo'),
(3,4,'2021-12-05','vibracion',2.5,'pausado'),
(4,2,'2020-07-07','presion',120.0,'activo'),
(5,1,'2023-03-10','temperatura',80.0,'activo'),
(6,3,'2019-06-20','flujo',5.0,'pausado'),
(7,4,'2020-08-08','vibracion',3.2,'activo'),
(8,2,'2018-09-09','presion',150.0,'activo'),
(9,5,'2017-10-10','presion',70.0,'pausado'),
(10,6,'2023-05-05','flujo',12.0,'activo'),
(1,2,'2022-04-04','temperatura',65.0,'activo'),
(3,1,'2021-11-11','vibracion',2.0,'activo');