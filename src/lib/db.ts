import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initializeDb = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      tc_no TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      smoke_start_date TEXT NOT NULL,
      cigarettes_per_day INTEGER NOT NULL,
      data_agreement BOOLEAN NOT NULL DEFAULT true,
      last_login_date TEXT,
      daily_login_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_messages (
      id SERIAL PRIMARY KEY,
      target_date TEXT NOT NULL,
      age_group TEXT NOT NULL,
      message TEXT NOT NULL,
      is_ai BOOLEAN DEFAULT false,
      UNIQUE(target_date, age_group)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS government_credentials (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      tc_no TEXT NOT NULL UNIQUE
    );
  `);
};

export default db;
