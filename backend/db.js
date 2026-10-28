import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'notewise.db');
const db = new sqlite3.Database(dbPath);

function initDB() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            current_streak INTEGER DEFAULT 0,
            last_activity_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            questions TEXT NOT NULL,
            note_ids TEXT,
            user_answers TEXT,
            score INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME
        )`);
    });
    console.log('SQLite database initialized');
}

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        const sqlUpper = sql.trim().toUpperCase();
        
        if (sqlUpper.startsWith('SELECT')) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve({ rows });
            });
        } else if (sqlUpper.startsWith('INSERT')) {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else {
                    // Get the inserted row
                    if (sqlUpper.includes('RETURNING')) {
                        // For SQLite, we need to fetch
                        const id = this.lastID;
                        db.get(sql.replace(/RETURNING.*/i, `WHERE id = ${id}`), [], (err, row) => {
                            if (err) {
                                // Try to get by lastID
                                db.get('SELECT * FROM ' + getTableName(sql) + ' WHERE id = ?', [id], (err2, row2) => {
                                    if (err2) reject(err2);
                                    else resolve({ rows: row2 ? [row2] : [] });
                                });
                            } else {
                                resolve({ rows: row ? [row] : [] });
                            }
                        });
                    } else {
                        resolve({ rows: [], lastID: this.lastID });
                    }
                }
            });
        } else if (sqlUpper.includes('RETURNING')) {
            db.run(sql.replace(/RETURNING.*/i, ''), params, function(err) {
                if (err) reject(err);
                else {
                    const id = this.lastID || params[params.length - 1];
                    const tableName = getTableName(sql);
                    db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err2, row) => {
                        if (err2) reject(err2);
                        else resolve({ rows: row ? [row] : [] });
                    });
                }
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ rows: [], changes: this.changes });
            });
        }
    });
}

function getTableName(sql) {
    const match = sql.match(/(?:INTO|UPDATE|FROM)\s+([a-zA-Z_]+)/i);
    return match ? match[1] : 'notes';
}

async function connectDB() {
    initDB();
    console.log('SQLite connected successfully');
}

export { query, connectDB };
export default db;
