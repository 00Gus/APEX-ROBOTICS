import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, Scale, Ruler, Zap, Info, Printer } from 'lucide-react';
import { fetchRulesetsList } from '../services/apiClient';

export default function ComplianceChecker() {
  const [rulesets, setRulesets] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState(1);
  const [inputValues, setInputValues] = useState({
    weight_g: 485,
    length_cm: 9.8,
    width_cm: 9.8,
    height_cm: 4.2,
    voltage_s: 3
  });
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRulesetsList().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setRulesets(data);
        setSelectedRuleId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedRuleId) {
      validate();
    }
  }, [selectedRuleId, inputValues]);

  const validate = () => {
    setLoading(true);
    fetch('/api/check-compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ruleset_id: selectedRuleId,
        weight_g: Number(inputValues.weight_g),
        length_cm: Number(inputValues.length_cm),
        width_cm: Number(inputValues.width_cm),
        height_cm: Number(inputValues.height_cm),
        voltage_s: Number(inputValues.voltage_s),
      })
    })
      .then(res => res.json())
      .then(data => {
        setValidationResult(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const activeRule = rulesets.find(r => r.id === Number(selectedRuleId)) || rulesets[0];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            HERRAMIENTA OFICIAL DE HOMOLOGACIÓN EN VIVO
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            INSPECTOR DE REGLAMENTOS Y BÁSCULA
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1 max-w-2xl">
            Evita descalificaciones en la mesa de jueces. Ingresa los parámetros de tu robot y valida el cumplimiento estricto de pesos, gálibos y voltajes oficiales.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3 py-2 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light border border-steel-border text-xs font-mono flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-cobalt-400" />
          <span>Imprimir Hoja de Inspección</span>
        </button>
      </div>

      {/* Grid: Selector e Inputs a la izquierda, Resultados de Inspección a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Parámetros de Entrada (5 cols) */}
        <div className="lg:col-span-5 bg-aerospace-800 border border-steel-border rounded-xl p-4 sm:p-5 space-y-4 shadow-md font-mono text-xs">
          <span className="text-[11px] font-mono text-steel-muted uppercase tracking-wider block border-b border-steel-border pb-2">
            1. SELECCIONA EL REGLAMENTO DE COMPETENCIA
          </span>

          <div>
            <label className="text-xs font-mono text-steel-muted block mb-1">Liga y Categoría Oficial:</label>
            <select
              value={selectedRuleId}
              onChange={(e) => setSelectedRuleId(Number(e.target.value))}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-safety-orange"
            >
              {rulesets.map(r => (
                <option key={r.id} value={r.id}>
                  {r.league_name} — {r.category_name}
                </option>
              ))}
            </select>
          </div>

          {activeRule && (
            <div className="bg-aerospace-900/60 p-3 rounded border border-steel-border/50 text-xs font-mono text-steel-muted space-y-1">
              <span className="text-steel-light font-semibold block text-[10px]">DESCRIPCIÓN DE LA PISTA/ARENA:</span>
              <p className="text-[11px] leading-relaxed">{activeRule.description}</p>
              {activeRule.notes && (
                <p className="text-[10px] text-amber-400 pt-1">Nota: {activeRule.notes}</p>
              )}
            </div>
          )}

          <span className="text-[11px] font-mono text-steel-muted uppercase tracking-wider block border-b border-steel-border pb-1 pt-2">
            2. INGRESA LAS MEDIDAS REALES DE TU ROBOT
          </span>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-steel-muted block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-safety-orange" /> Peso Total con Batería (g):</span>
                {activeRule && <span className="text-[10px] text-steel-muted">Máx: {activeRule.max_weight_g}g</span>}
              </label>
              <input
                type="number"
                value={inputValues.weight_g}
                onChange={(e) => setInputValues({ ...inputValues, weight_g: e.target.value })}
                className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-steel-muted block mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-cobalt-400" /> Largo (cm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.length_cm}
                  onChange={(e) => setInputValues({ ...inputValues, length_cm: e.target.value })}
                  className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="text-steel-muted block mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-cobalt-400" /> Ancho (cm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.width_cm}
                  onChange={(e) => setInputValues({ ...inputValues, width_cm: e.target.value })}
                  className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-steel-muted block mb-1">Altura (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputValues.height_cm}
                  onChange={(e) => setInputValues({ ...inputValues, height_cm: e.target.value })}
                  className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="text-steel-muted block mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Batería (Celdas S):
                </label>
                <input
                  type="number"
                  value={inputValues.voltage_s}
                  onChange={(e) => setInputValues({ ...inputValues, voltage_s: e.target.value })}
                  className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Resultados de la Inspección Técnica (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {validationResult && (
            <div className="bg-aerospace-800 border border-steel-border rounded-xl p-4 sm:p-6 space-y-6 shadow-md">
              
              {/* Veredicto General */}
              <div className="flex items-center justify-between border-b border-steel-border pb-4">
                <div>
                  <span className="text-[10px] font-mono text-steel-muted uppercase block">
                    DICTAMEN DE HOMOLOGACIÓN OFICIAL
                  </span>
                  <h3 className="text-xl font-extrabold text-white font-mono mt-0.5">
                    {validationResult.rule.category_name}
                  </h3>
                </div>

                <div>
                  {validationResult.isCompliant ? (
                    <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono font-bold px-3 py-1.5 rounded-lg text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>APROBADO PARA COMPETIR</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono font-bold px-3 py-1.5 rounded-lg text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      <span>NO CUMPLE REGLAMENTO</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Chequeos Individuales */}
              <div className="space-y-3 font-mono">
                {validationResult.checks.map((c, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded border flex items-start justify-between gap-3 ${
                      c.status === 'PASS'
                        ? 'bg-aerospace-900/60 border-steel-border/50 text-steel-light'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.parameter}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          c.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-steel-muted">{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recomendación Técnica de Laboratorio */}
              <div className="bg-aerospace-900/80 p-4 rounded-lg border border-steel-border text-xs font-mono space-y-2">
                <div className="flex items-center gap-1.5 text-safety-orange font-bold text-xs uppercase">
                  <Info className="w-4 h-4" />
                  <span>Recomendación de Maquila / Aligeramiento Apex:</span>
                </div>
                <p className="text-steel-muted leading-relaxed">
                  {validationResult.isCompliant
                    ? 'Tu robot tiene un balance óptimo. Te recomendamos verificar la holgura en tornillos M2 de fijación para evitar que el pegado de cinta o plomo de contrapeso te descalifique en la báscula de pesaje oficial.'
                    : 'Si requieres aligerar tu robot para entrar en la categoría, en Apex Lab podemos fresar cajeras en tu chasis de aluminio o sustituir la tapa por fibra de carbono para reducir entre 15g y 45g manteniendo la rigidez estructural.'}
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
