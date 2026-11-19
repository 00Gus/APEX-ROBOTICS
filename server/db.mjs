import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'apex_robotics.sqlite');
export const db = new DatabaseSync(dbPath);

// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL, /* sumo, combate, seguidor, laberinto */
      level TEXT NOT NULL, /* ready, kit, raw */
      price REAL NOT NULL,
      weight_g INTEGER NOT NULL,
      dimensions TEXT NOT NULL,
      max_speed_ms REAL NOT NULL,
      torque_nm REAL NOT NULL,
      sensors TEXT NOT NULL,
      motor_type TEXT NOT NULL,
      chassis_material TEXT NOT NULL,
      ruleset_compliance TEXT NOT NULL,
      description TEXT NOT NULL,
      in_stock INTEGER DEFAULT 1,
      image_badge TEXT,
      components_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_projects (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      category TEXT NOT NULL,
      stage TEXT NOT NULL, /* cad, repair, concept */
      description TEXT NOT NULL,
      file_name TEXT,
      file_url TEXT,
      services_json TEXT NOT NULL,
      target_weight_g INTEGER,
      target_tournament TEXT,
      estimated_cost REAL NOT NULL,
      status TEXT DEFAULT 'revision_cad', /* revision_cad, cotizado, maquila, ensamble, pruebas_banco, listo_envio */
      telemetry_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      institution TEXT,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pendiente',
      items_json TEXT NOT NULL,
      is_b2b_quote INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rulesets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league_name TEXT NOT NULL,
      category_name TEXT NOT NULL,
      max_weight_g INTEGER NOT NULL,
      max_dim_l_cm REAL,
      max_dim_w_cm REAL,
      max_dim_h_cm REAL,
      max_voltage_s INTEGER,
      description TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS hall_of_fame (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      robot_name TEXT NOT NULL,
      category TEXT NOT NULL,
      tournament TEXT NOT NULL,
      result TEXT NOT NULL,
      year INTEGER NOT NULL,
      pilot_team TEXT NOT NULL,
      record_metric TEXT NOT NULL,
      key_specs_json TEXT NOT NULL,
      image_tag TEXT NOT NULL
    );
  `);
}

initDb();
