import React, { useState, useEffect } from 'react';
import { Database, Wrench, FileText, CheckCircle2, RefreshCw, Edit3, Save, Layers, Clock } from 'lucide-react';
import { formatPriceMXN, INITIAL_PRODUCTS, INITIAL_CUSTOM_PROJECTS } from '../data/initialData';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'orders', 'products'
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status edit state for a project
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, ordRes, prodRes] = await Promise.all([
        fetch('/api/custom-projects').catch(() => null),
        fetch('/api/orders').catch(() => null),
        fetch('/api/products').catch(() => null)
      ]);
      const projData = projRes && projRes.ok ? await projRes.json() : (JSON.parse(localStorage.getItem('apex_custom_projects')) || INITIAL_CUSTOM_PROJECTS);
      const ordData = ordRes && ordRes.ok ? await ordRes.json() : (JSON.parse(localStorage.getItem('apex_orders')) || []);
      const prodData = prodRes && prodRes.ok ? await prodRes.json() : (JSON.parse(localStorage.getItem('apex_products')) || INITIAL_PRODUCTS);
      setProjects(projData || []);
      setOrders(ordData || []);
      setProducts(prodData || []);
    } catch {
      setProjects(INITIAL_CUSTOM_PROJECTS);
      setOrders([]);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (proj) => {
    setEditingProjectId(proj.id);
    setNewStatus(proj.status);
    setNewNotes(proj.telemetry_notes || '');
  };

  const handleSaveStatus = async (projectId) => {
    try {
      const res = await fetch(`/api/custom-projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          telemetry_notes: newNotes
        })
      });
      if (res.ok) {
        setEditingProjectId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* Header */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cobalt-500/10 border border-cobalt-500/30 text-cobalt-400 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            PANEL DE CONTROL DEL TALLER // BASE DE DATOS SQLITE LOCAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ADMINISTRACIÓN DE MAQUILA Y PEDIDOS
          </h2>
          <p className="text-xs text-steel-muted mt-1">
            Motor local ultraligero: <code className="text-safety-orange">apex_robotics.sqlite</code> (~49 KB en disco).
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3 py-1.5 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light border border-steel-border text-xs flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RefreshCw className="w-3 h-3 text-safety-orange" />
          <span>Sincronizar SQLite</span>
        </button>
      </div>

      {/* Tabs de Navegación del Panel */}
      <div className="flex border-b border-steel-border gap-2 text-xs">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-all ${
            activeTab === 'projects'
              ? 'border-safety-orange text-safety-orange'
              : 'border-transparent text-steel-muted hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Proyectos Custom Lab ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-all ${
            activeTab === 'orders'
              ? 'border-safety-orange text-safety-orange'
              : 'border-transparent text-steel-muted hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pedidos & Cotizaciones B2B ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 font-semibold transition-all ${
            activeTab === 'products'
              ? 'border-safety-orange text-safety-orange'
              : 'border-transparent text-steel-muted hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catálogo & Fichas ({products.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-steel-muted text-xs">Consultando base de datos SQLite...</div>
      ) : activeTab === 'projects' ? (
        /* Tabla de Proyectos Custom Lab */
        <div className="bg-aerospace-800 border border-steel-border rounded-xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-steel-border flex items-center justify-between text-xs text-steel-muted">
            <span>PROYECTOS REGISTRADOS POR CLIENTES EN CUSTOM LAB</span>
            <span className="text-emerald-400">● MODO EDICIÓN EN VIVO HABILITADO</span>
          </div>

          <div className="divide-y divide-steel-border">
            {projects.map((proj) => {
              const isEditing = editingProjectId === proj.id;
              return (
                <div key={proj.id} className="p-5 space-y-3 hover:bg-aerospace-900/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-safety-orange">{proj.id}</span>
                      <span className="text-xs text-white font-semibold">{proj.client_name}</span>
                      <span className="text-[11px] text-steel-muted">({proj.client_email})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-steel-muted">Presupuesto:</span>
                      <span className="text-xs font-bold text-emerald-400">{formatPriceMXN(proj.estimated_cost)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-steel-light bg-aerospace-900/60 p-2.5 rounded border border-steel-border/50">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-steel-muted">
                    <span>Servicios:</span>
                    {proj.services && proj.services.map((s, idx) => (
                      <span key={idx} className="bg-titanium-700 text-steel-light px-2 py-0.5 rounded border border-steel-border">
                        {s}
                      </span>
                    ))}
                    {proj.file_name && (
                      <span className="text-cobalt-400 ml-auto">Archivo CAD: {proj.file_name}</span>
                    )}
                  </div>

                  {/* Estado y Telemetría */}
                  <div className="bg-aerospace-900 p-3 rounded border border-steel-border space-y-2">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-steel-muted">Actualizar Estado de Taller:</label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="bg-aerospace-800 border border-steel-border rounded p-1 text-xs text-white focus:outline-none focus:border-safety-orange"
                          >
                            <option value="revision_cad">Revisión CAD</option>
                            <option value="cotizado">Aprobado / Cotizado</option>
                            <option value="maquila">En Maquila CNC</option>
                            <option value="ensamble">Ensamble y Cableado</option>
                            <option value="pruebas_banco">Pruebas en Banco Dinamómetro</option>
                            <option value="listo_envio">Listo para Envío</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-steel-muted block mb-1">Notas del Ingeniero para el Cliente:</label>
                          <textarea
                            rows="2"
                            value={newNotes}
                            onChange={(e) => setNewNotes(e.target.value)}
                            className="w-full bg-aerospace-800 border border-steel-border rounded p-2 text-xs text-white focus:outline-none focus:border-safety-orange"
                          ></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingProjectId(null)}
                            className="px-3 py-1 rounded bg-titanium-700 text-steel-muted text-xs"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveStatus(proj.id)}
                            className="px-3 py-1 rounded bg-safety-orange text-white font-bold text-xs flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Guardar en SQLite</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-steel-muted">Estado Actual: </span>
                          <span className="font-bold text-safety-orange uppercase">{proj.status.replace('_', ' ')}</span>
                          <p className="text-[11px] text-steel-muted mt-0.5">{proj.telemetry_notes || 'Sin notas registradas.'}</p>
                        </div>
                        <button
                          onClick={() => handleStartEdit(proj)}
                          className="px-2.5 py-1 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light border border-steel-border text-xs flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-safety-orange" />
                          <span>Actualizar Avance</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Tabla de Órdenes y Cotizaciones B2B */
        <div className="bg-aerospace-800 border border-steel-border rounded-xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-steel-border text-xs text-steel-muted">
            PEDIDOS Y COTIZACIONES FORMALES GUARDADAS EN SQLITE
          </div>

          <div className="divide-y divide-steel-border text-xs">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-steel-muted">No hay órdenes registradas aún.</div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{ord.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        ord.is_b2b_quote ? 'bg-cobalt-500/20 text-cobalt-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {ord.is_b2b_quote ? 'COTIZACIÓN B2B' : 'ORDEN DIRECTA'}
                      </span>
                    </div>
                    <p className="text-steel-muted mt-0.5">
                      Cliente: {ord.client_name} ({ord.client_email}) • {ord.institution || 'Particular'}
                    </p>
                    <div className="text-[11px] text-steel-light mt-1">
                      {ord.items && ord.items.map((it, i) => (
                        <span key={i} className="mr-3">• {it.name} (x{it.quantity || 1})</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-steel-muted block">Monto Total:</span>
                    <span className="text-base font-extrabold text-white">{formatPriceMXN(ord.total_amount)}</span>
                    <span className="text-[10px] text-steel-muted block">{ord.created_at}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Catálogo de Productos en DB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {products.map((p) => (
            <div key={p.id} className="bg-aerospace-800 p-4 rounded-xl border border-steel-border space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-safety-orange font-bold uppercase">{p.category}</span>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                </div>
                <span className="font-bold text-white">{formatPriceMXN(p.price)}</span>
              </div>
              <p className="text-steel-muted text-[11px]">{p.description}</p>
              <div className="text-[10px] text-steel-muted pt-2 border-t border-steel-border/50 flex justify-between">
                <span>Masa: {p.weight_g}g</span>
                <span>Tolerancia: ±0.03mm</span>
                <span>Stock: 100% Disponible</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
