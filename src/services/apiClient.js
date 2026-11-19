import {
  INITIAL_PRODUCTS,
  INITIAL_RULESETS,
  INITIAL_HALL_OF_FAME,
  INITIAL_CUSTOM_PROJECTS,
  INITIAL_STATS
} from '../data/initialData';

// Claves de almacenamiento local para persistir cambios en GitHub Pages
const STORAGE_KEYS = {
  PROJECTS: 'apex_custom_projects',
  ORDERS: 'apex_orders',
  PRODUCTS: 'apex_products'
};

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// 1. Estadísticas del Laboratorio
export async function fetchLabStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) return await res.json();
  } catch {}
  return INITIAL_STATS;
}

// 2. Catálogo de Robots y Kits
export async function fetchProductsList(category = 'all', level = 'all') {
  try {
    let url = '/api/products?';
    if (category !== 'all') url += `category=${category}&`;
    if (level !== 'all') url += `level=${level}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Fallback autónomo para GitHub Pages
  let list = getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  if (level !== 'all') {
    list = list.filter(p => p.level === level);
  }
  return list;
}

// 3. Reglamentos de Competición
export async function fetchRulesetsList() {
  try {
    const res = await fetch('/api/rulesets');
    if (res.ok) return await res.json();
  } catch {}
  return INITIAL_RULESETS;
}

// 4. Salón de la Fama
export async function fetchHallOfFameList() {
  try {
    const res = await fetch('/api/hall-of-fame');
    if (res.ok) return await res.json();
  } catch {}
  return INITIAL_HALL_OF_FAME;
}

// 5. Rastreo de Proyecto por Folio (#LAB)
export async function fetchProjectByFolio(folio) {
  if (!folio) return null;
  const cleanId = folio.trim().toUpperCase();

  try {
    const res = await fetch(`/api/custom-projects/${cleanId}`);
    if (res.ok) return await res.json();
  } catch {}

  // Buscar en proyectos guardados en localStorage o iniciales
  const allProjects = getStored(STORAGE_KEYS.PROJECTS, INITIAL_CUSTOM_PROJECTS);
  return allProjects.find(p => p.id.toUpperCase() === cleanId) || null;
}

// 6. Registro de Proyecto Custom en Taller
export async function submitCustomProjectForm(formData) {
  try {
    const res = await fetch('/api/custom-projects', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback autónomo en GitHub Pages
  const newId = `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const clientName = formData.get('client_name') || 'Cliente Apex';
  const clientEmail = formData.get('client_email') || 'cliente@apex.mx';
  const clientPhone = formData.get('client_phone') || '+52 55 0000 0000';
  const category = formData.get('category') || 'sumo';
  const description = formData.get('description') || 'Diseño de robot para torneo';
  const estimatedCost = Number(formData.get('estimated_cost')) || 6100.00;
  const servicesJson = formData.get('services_json') ? JSON.parse(formData.get('services_json')) : [];

  const newProject = {
    id: newId,
    client_name: clientName,
    client_email: clientEmail,
    client_phone: clientPhone,
    category,
    stage: 'cad',
    description,
    file_name: 'diseno_cliente_3d.step',
    file_url: '#',
    services: servicesJson,
    target_weight_g: 485,
    target_tournament: 'Torneo Oficial',
    estimated_cost: estimatedCost,
    status: 'revision_cad',
    telemetry_notes: 'Folio generado con éxito. En espera de turno en centro de maquinado CNC.'
  };

  const stored = getStored(STORAGE_KEYS.PROJECTS, INITIAL_CUSTOM_PROJECTS);
  setStored(STORAGE_KEYS.PROJECTS, [newProject, ...stored]);

  return { success: true, project_id: newId, message: 'Proyecto registrado exitosamente' };
}

// 7. Registro de Órdenes y Cotizaciones B2B
export async function submitOrderRequest(orderData) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback autónomo en GitHub Pages
  const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const stored = getStored(STORAGE_KEYS.ORDERS, []);
  setStored(STORAGE_KEYS.ORDERS, [{ ...orderData, id: orderId, created_at: new Date().toISOString() }, ...stored]);

  return { success: true, order_id: orderId, message: 'Orden generada con éxito' };
}
