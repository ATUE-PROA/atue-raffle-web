-- Reservas da rifa.
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  indication TEXT NOT NULL DEFAULT '',
  numbers TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TEXT NOT NULL,
  confirmed_at TEXT
);

-- Números ocupados. A PK garante que um número não seja vendido duas vezes.
CREATE TABLE reservation_numbers (
  number INTEGER PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES reservations (id) ON DELETE CASCADE
);

CREATE INDEX reservation_numbers_reservation_id_idx
  ON reservation_numbers (reservation_id);

CREATE TABLE winners (
  position INTEGER PRIMARY KEY,
  number INTEGER NOT NULL,
  customer_name TEXT NOT NULL
);

CREATE TABLE raffle_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  closed INTEGER NOT NULL DEFAULT 0
);

INSERT INTO raffle_settings (id, closed) VALUES (1, 0);
