import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Wrench, Activity, ArrowRight } from 'lucide-react';
import { formatPriceMXN } from '../data/initialData';
import { fetchProjectByFolio } from '../services/apiClient';

export default function ProjectTrackerModal({ isOpen, onClose }) {
  const [projectId, setProjectId] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!projectId.trim()) return;
    setLoading(true);
    setError('');
    setProjectData(null);

    try {
      const data = await fetchProjectByFolio(projectId);
      if (data) {
        setProjectData(data);
      } else {
        setError('No se encontró ningún proyecto con este folio. Revisa el código en tu confirmación.');
      }
    } catch (err) {
      setError('Error al consultar el proyecto.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'revision_cad', label: '1. Revisión CAD' },
    { id: 'cotizado', label: '2. Aprobado' },
    { id: 'maquila', label: '3. En Maquila CNC' },
    { id: 'ensamble', label: '4. Ensamble Lab' },
    { id: 'listo_envio', label: '5. Listo p/ Envío' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-aerospace-900 border border-steel-border rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-2xl font-mono text-xs space-y-5">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-steel-border pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-safety-orange" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rastreo de Proyectos de Laboratorio
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-aerospace-800 text-steel-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buscador de Folio */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Ingresa tu folio (Ej: LAB-2026-0842)"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="flex-1 bg-aerospace-800 border border-steel-border rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-safety-orange hover:bg-safety-orangeHover text-white font-bold rounded flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Consultando...' : 'Buscar'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Datos del Proyecto */}
        {projectData && (
          <div className="space-y-4 pt-2 border-t border-steel-border">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-white block">{projectData.id}</span>
                <span className="text-steel-muted">{projectData.client_name}</span>
                <span className="text-steel-muted block text-[10px]">Categoría: {projectData.category.toUpperCase()}</span>
              </div>
              <div className="text-right">
                <span className="text-steel-muted text-[10px] block">Presupuesto Estimado</span>
                <span className="text-sm font-bold text-emerald-400">{formatPriceMXN(projectData.estimated_cost)}</span>
              </div>
            </div>

            {/* Stepper de progreso */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              {steps.map((st, idx) => {
                const currentIdx = steps.findIndex(s => s.id === projectData.status);
                const isPast = currentIdx >= idx;
                const isCurrent = projectData.status === st.id;
                return (
                  <div
                    key={st.id}
                    className={`p-2 rounded border ${
                      isCurrent
                        ? 'bg-safety-orange/20 text-safety-orange border-safety-orange font-bold'
                        : isPast
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-aerospace-800 text-steel-muted border-steel-border/50'
                    }`}
                  >
                    {st.label}
                  </div>
                );
              })}
            </div>

            {/* Notas del Ingeniero */}
            <div className="bg-aerospace-800 p-3 rounded border border-steel-border space-y-1">
              <span className="text-steel-muted text-[10px] block uppercase font-semibold">
                Última Actualización Técnica:
              </span>
              <p className="text-steel-light leading-relaxed">
                {projectData.telemetry_notes || 'Proyecto ingresado al servidor de laboratorio.'}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 text-[10px] text-steel-muted border-t border-steel-border/50 flex justify-between">
          <span>Tolerancia de Maquila: ±0.03mm</span>
          <span>Soporte: lab@apexrobotics.io</span>
        </div>

      </div>
    </div>
  );
}
