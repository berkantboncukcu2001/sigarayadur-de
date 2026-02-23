import Database from 'better-sqlite3';
import path from 'path';

// Connect to the local SQLite database
// In production, we'll store this in the root or a data folder.
const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize tables if they don't exist
const initializeDb = () => {
  // Public Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      tc_no TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      smoke_start_date TEXT NOT NULL,
      cigarettes_per_day INTEGER NOT NULL,
      data_agreement BOOLEAN NOT NULL DEFAULT 1,
      last_login_date TEXT,
      daily_login_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_date TEXT NOT NULL,
      age_group TEXT NOT NULL,
      message TEXT NOT NULL,
      is_ai BOOLEAN DEFAULT 0,
      UNIQUE(target_date, age_group)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
};

initializeDb();

export default db;
