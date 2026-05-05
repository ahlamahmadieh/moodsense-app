CREATE TABLE users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  usual_sleep INT,
  activity_level TEXT,
  work_type TEXT,
  energy_source TEXT,
  main_stressor TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
  mood INT,
  sleep_hours FLOAT,
  sleep_quality INT,
  stress_level INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);