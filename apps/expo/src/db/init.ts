import * as SQLite from "expo-sqlite";

export const initDatabase = () => {
  const db = SQLite.openDatabaseSync("everynote.db") as any;

  // Create tables if they don't exist
  db.transaction((tx: any) => {
    // Categories table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Notes table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);
  });

  return db;
};
