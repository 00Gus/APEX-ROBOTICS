import React, { useState, useEffect } from 'react';
import { Award, Trophy, Cpu, Zap, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { fetchHallOfFameList } from '../services/apiClient';

export default function HallOfFame({ onExploreSetup }) {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHallOfFameList()
      .then(data => {
        setChampions(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            VALIDACIÓN EN LA ARENA // SOCIAL PROOF TÉCNICO
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            SALÓN DE LA FAMA & RÉCORDS DE TORNEO
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1 max-w-2xl">
            Robots construidos y afinados en Apex Robotics que se han coronado campeones en ligas nacionales e internacionales.
          </p>
        </div>

        <div className="bg-aerospace-800 border border-steel-border px-4 py-2 rounded-lg font-mono text-xs text-steel-muted">
          <span className="text-amber-400 font-bold block text-sm">3 CAMPEONATOS ACTIVOS</span>
          <span>100% Mecánica & Electrónica Apex</span>
        </div>
      </div>

      {/* Grid de Campeones */}
      {loading ? (
        <div className="py-16 text-center font-mono text-steel-muted">Cargando victorias de arena...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {champions.map((champ) => (
            <div
              key={champ.id}
              className="bg-aerospace-800 border border-steel-border rounded-xl p-5 hover:border-steel-500 transition-all flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3 font-mono">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    AÑO {champ.year}
                  </span>
                  <span className="text-xs text-steel-muted">{champ.category}</span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{champ.robot_name}</h3>
                <p className="text-xs font-mono text-safety-orange font-semibold mt-0.5">{champ.tournament}</p>
                <p className="text-xs font-mono text-steel-muted mt-1">Piloto: {champ.pilot_team}</p>

                {/* Métrica de Récord */}
                <div className="bg-aerospace-900/80 p-3 rounded border border-steel-border my-4 font-mono">
                  <span className="text-[10px] text-steel-muted uppercase block">Resultado Destacado:</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">{champ.result}</span>
                  <span className="text-xs text-steel-light block mt-1">{champ.record_metric}</span>
                </div>

                {/* Especificaciones Clave */}
                <div className="space-y-1.5 font-mono text-xs text-steel-muted mb-4">
                  <span className="text-[10px] text-steel-light uppercase font-bold block">Setup del Robot:</span>
                  {champ.key_specs && champ.key_specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-steel-light">
                      <Check className="w-3.5 h-3.5 text-safety-orange" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-steel-border">
                <button
                  onClick={onExploreSetup}
                  className="w-full py-2 px-3 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light hover:text-white border border-steel-border text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ver Componentes de este Setup</span>
                  <ArrowRight className="w-3.5 h-3.5 text-safety-orange" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
