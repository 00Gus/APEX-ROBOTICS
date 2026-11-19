import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { db, initDb } from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up uploads directory for CAD/spec files
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage for CAD/STL uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

// ---------------- API ROUTES ----------------

// 1. Get products (with optional filtering)
app.get('/api/products', (req, res) => {
  try {
    const { category, level } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (level && level !== 'all') {
      query += ' AND level = ?';
      params.push(level);
    }

    query += ' ORDER BY id ASC';
    const rows = db.prepare(query).all(...params);
    const parsed = rows.map(r => ({
      ...r,
      components: JSON.parse(r.components_json || '[]')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get single product by slug
app.get('/api/products/:slug', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({
      ...row,
      components: JSON.parse(row.components_json || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get rulesets
app.get('/api/rulesets', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM rulesets ORDER BY id ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Verify Tournament Compliance
app.post('/api/check-compliance', (req, res) => {
  try {
    const { ruleset_id, weight_g, length_cm, width_cm, height_cm, voltage_s } = req.body;
    const rule = db.prepare('SELECT * FROM rulesets WHERE id = ?').get(ruleset_id);
    if (!rule) return res.status(404).json({ error: 'Reglamento no encontrado' });

    const checks = [];
    let isCompliant = true;

    // Weight check
    if (weight_g > rule.max_weight_g) {
      isCompliant = false;
      checks.push({
        parameter: 'Peso Total',
        status: 'FAIL',
        message: `Excede el límite oficial de ${rule.max_weight_g}g por ${weight_g - rule.max_weight_g}g.`
      });
    } else {
      checks.push({
        parameter: 'Peso Total',
        status: 'PASS',
        message: `${weight_g}g está dentro del margen reglamentario (Máx: ${rule.max_weight_g}g). Margen libre: ${rule.max_weight_g - weight_g}g.`
      });
    }

    // Dimension check
    if (rule.max_dim_l_cm && rule.max_dim_w_cm) {
      if (length_cm > rule.max_dim_l_cm || width_cm > rule.max_dim_w_cm) {
        isCompliant = false;
        checks.push({
          parameter: 'Dimensiones (L x W)',
          status: 'FAIL',
          message: `Dimensiones ${length_cm}x${width_cm}cm exceden la caja de inspección de ${rule.max_dim_l_cm}x${rule.max_dim_w_cm}cm.`
        });
      } else {
        checks.push({
          parameter: 'Dimensiones (L x W)',
          status: 'PASS',
          message: `${length_cm}x${width_cm}cm cabe en la caja de inspección oficial.`
        });
      }
    }

    if (rule.max_dim_h_cm && height_cm > rule.max_dim_h_cm) {
      isCompliant = false;
      checks.push({
        parameter: 'Altura Máxima',
        status: 'FAIL',
        message: `Altura ${height_cm}cm excede el límite de ${rule.max_dim_h_cm}cm.`
      });
    }

    // Voltage check
    if (rule.max_voltage_s && voltage_s > rule.max_voltage_s) {
      isCompliant = false;
      checks.push({
        parameter: 'Voltaje Batería',
        status: 'FAIL',
        message: `${voltage_s}S excede el límite de ${rule.max_voltage_s}S permitido en esta categoría.`
      });
    } else if (voltage_s) {
      checks.push({
        parameter: 'Voltaje Batería',
        status: 'PASS',
        message: `${voltage_s}S cumple con el límite permitido.`
      });
    }

    res.json({
      rule,
      isCompliant,
      checks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Kinematics & Traction Calculator
app.post('/api/kinematics-calculate', (req, res) => {
  try {
    const {
      wheel_diameter_mm = 30,
      motor_rpm = 1000,
      gear_ratio = 30, // 30:1
      robot_mass_g = 500,
      friction_coeff = 1.2, // 1.2 for silicone on painted steel
      nominal_torque_gcm = 400
    } = req.body;

    const wheel_radius_m = (wheel_diameter_mm / 2) / 1000;
    const wheel_circumference_m = Math.PI * (wheel_diameter_mm / 1000);
    const final_rpm = motor_rpm / (gear_ratio || 1);
    const max_speed_ms = (final_rpm / 60) * wheel_circumference_m;

    const mass_kg = robot_mass_g / 1000;
    const normal_force_n = mass_kg * 9.81;
    const max_pushing_force_n = normal_force_n * friction_coeff; // static friction push

    // Estimated 0 to 1 meter time: d = 0.5 * a * t^2 -> t = sqrt(2d/a), assuming a = F/m
    const theoretical_accel = max_pushing_force_n / mass_kg;
    const time_to_1m_s = Math.sqrt((2 * 1) / Math.max(theoretical_accel, 0.1));

    res.json({
      wheel_diameter_mm,
      final_rpm: Math.round(final_rpm),
      max_speed_ms: Number(max_speed_ms.toFixed(2)),
      max_speed_kmh: Number((max_speed_ms * 3.6).toFixed(2)),
      max_pushing_force_n: Number(max_pushing_force_n.toFixed(2)),
      theoretical_accel_ms2: Number(theoretical_accel.toFixed(2)),
      time_to_1m_s: Number(time_to_1m_s.toFixed(2))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Custom Lab Projects
app.get('/api/custom-projects', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM custom_projects ORDER BY created_at DESC').all();
    const parsed = rows.map(r => ({
      ...r,
      services: JSON.parse(r.services_json || '[]')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/custom-projects/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM custom_projects WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Proyecto no encontrado en laboratorio' });
    res.json({
      ...row,
      services: JSON.parse(row.services_json || '[]')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/custom-projects', upload.single('cad_file'), (req, res) => {
  try {
    const {
      client_name,
      client_email,
      client_phone,
      category,
      stage,
      description,
      services,
      target_weight_g,
      target_tournament
    } = req.body;

    const projectId = `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const parsedServices = typeof services === 'string' ? JSON.parse(services || '[]') : (services || []);
    
    // Cost estimation based on selected services
    let baseCost = 60.0; // Basic engineering CAD review & setup
    const serviceCosts = {
      'cnc_7075': 95.0,
      'laser_cf': 70.0,
      'print_pacf': 45.0,
      'components_sourcing': 50.0,
      'mechanical_assembly': 75.0,
      'electronics_harness': 65.0,
      'pid_programming': 80.0,
      'bench_telemetry_test': 40.0
    };

    parsedServices.forEach(s => {
      if (serviceCosts[s]) baseCost += serviceCosts[s];
    });

    const fileName = req.file ? req.file.originalname : null;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    db.prepare(`
      INSERT INTO custom_projects (
        id, client_name, client_email, client_phone, category, stage, description,
        file_name, file_url, services_json, target_weight_g, target_tournament, estimated_cost, status, telemetry_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      client_name || 'Competidor Anónimo',
      client_email || 'lab@apexrobotics.io',
      client_phone || '',
      category || 'sumo',
      stage || 'cad',
      description || 'Sin notas adicionales',
      fileName,
      fileUrl,
      JSON.stringify(parsedServices),
      parseInt(target_weight_g) || 500,
      target_tournament || 'Torneo Abierto',
      baseCost,
      'revision_cad',
      'Archivo recibido en el servidor de laboratorio. Revisión de mallas y tolerancias mecánicas iniciada.'
    );

    res.json({
      success: true,
      project_id: projectId,
      estimated_cost: baseCost,
      message: 'Proyecto ingresado exitosamente a la cola de ingeniería de Apex Lab.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update project status (for admin)
app.patch('/api/custom-projects/:id/status', (req, res) => {
  try {
    const { status, telemetry_notes } = req.body;
    db.prepare(`
      UPDATE custom_projects
      SET status = COALESCE(?, status),
          telemetry_notes = COALESCE(?, telemetry_notes)
      WHERE id = ?
    `).run(status, telemetry_notes, req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Hall of Fame
app.get('/api/hall-of-fame', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM hall_of_fame ORDER BY year DESC').all();
    const parsed = rows.map(r => ({
      ...r,
      key_specs: JSON.parse(r.key_specs_json || '[]')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Orders & B2B Quotes
app.post('/api/orders', (req, res) => {
  try {
    const { client_name, client_email, institution, total_amount, items, is_b2b_quote } = req.body;
    const orderId = is_b2b_quote
      ? `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      : `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO orders (id, client_name, client_email, institution, total_amount, status, items_json, is_b2b_quote)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      client_name,
      client_email,
      institution || 'Particular',
      total_amount,
      is_b2b_quote ? 'cotizado_formal' : 'procesando',
      JSON.stringify(items || []),
      is_b2b_quote ? 1 : 0
    );

    res.json({
      success: true,
      order_id: orderId,
      message: is_b2b_quote
        ? 'Cotización formal institucional generada exitosamente.'
        : 'Pedido recibido en el taller de preparación.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const parsed = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json || '[]')
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Quick Stats & System Status
app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProjects = db.prepare("SELECT COUNT(*) as count FROM custom_projects WHERE status != 'listo_envio'").get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;

    res.json({
      lab_status: 'OPERATIONAL',
      tolerance: '±0.03mm',
      active_projects: activeProjects,
      catalog_models: totalProducts,
      orders_processed: totalOrders,
      next_dispatch_hours: 24
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve production frontend assets if built
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Apex Mechatronics API] Running on http://localhost:${PORT}`);
  console.log(`[Database] Connected to lightweight SQLite database`);
});
