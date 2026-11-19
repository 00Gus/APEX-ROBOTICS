import React, { useState, useEffect } from 'react';
import { Activity, Gauge, Zap, ArrowRight, Award, Compass, RotateCcw } from 'lucide-react';

export default function KinematicsCalc({ onOpenCustomLab }) {
  const [inputs, setInputs] = useState({
    wheel_diameter_mm: 30,
    motor_rpm: 1000,
    gear_ratio: 30,
    robot_mass_g: 500,
    friction_coeff: 1.35, // High grip silicone on painted steel
    downforce_g: 0, // Magnetic or turbine downforce
  });

  const [results, setResults] = useState(null);

  useEffect(() => {
    calculate();
  }, [inputs]);

  const calculate = () => {
    const wheel_diameter_m = inputs.wheel_diameter_mm / 1000;
    const wheel_circ_m = Math.PI * wheel_diameter_m;
    const final_rpm = inputs.motor_rpm / (inputs.gear_ratio || 1);
    const max_speed_ms = (final_rpm / 60) * wheel_circ_m;
    const max_speed_kmh = max_speed_ms * 3.6;

    // Normal force includes gravity + extra magnetic/turbine downforce
    const total_effective_mass_kg = (inputs.robot_mass_g + Number(inputs.downforce_g || 0)) / 1000;
    const normal_force_n = total_effective_mass_kg * 9.81;
    const pushing_force_n = normal_force_n * inputs.friction_coeff;
    const pushing_force_kgf = pushing_force_n / 9.81;

    // Acceleration a = F / m (using real physical mass for inertia)
    const actual_mass_kg = inputs.robot_mass_g / 1000;
    const theoretical_accel = pushing_force_n / actual_mass_kg;
    const time_to_1m_s = Math.sqrt((2 * 1) / Math.max(theoretical_accel, 0.1));

    setResults({
      final_rpm: Math.round(final_rpm),
      max_speed_ms: Number(max_speed_ms.toFixed(2)),
      max_speed_kmh: Number(max_speed_kmh.toFixed(2)),
      pushing_force_n: Number(pushing_force_n.toFixed(2)),
      pushing_force_kgf: Number(pushing_force_kgf.toFixed(2)),
      theoretical_accel: Number(theoretical_accel.toFixed(2)),
      time_to_1m_s: Number(time_to_1m_s.toFixed(2)),
    });
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cobalt-500/10 border border-cobalt-500/30 text-cobalt-400 text-xs font-mono font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            HERRAMIENTA ABIERTA DE INGENIERÍA // DINAMÓMETRO VIRTUAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            CALCULADORA DE CINEMÁTICA Y TRACCIÓN EN DOHYO
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1 max-w-2xl">
            Calcula la velocidad punta, aceleración a 1 metro y la fuerza de empuje estática para superar al adversario en colisiones de Sumo y Combate.
          </p>
        </div>

        <button
          onClick={() => setInputs({
            wheel_diameter_mm: 30,
            motor_rpm: 1000,
            gear_ratio: 30,
            robot_mass_g: 500,
            friction_coeff: 1.35,
            downforce_g: 0
          })}
          className="px-3 py-1.5 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-muted hover:text-white border border-steel-border text-xs font-mono flex items-center gap-1.5 transition-all self-start md:self-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restablecer Parámetros</span>
        </button>
      </div>

      {/* Grid: Inputs a la izquierda, Métricas en tiempo real a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Panel de Entradas (5 cols) */}
        <div className="lg:col-span-5 bg-aerospace-800 border border-steel-border rounded-xl p-4 sm:p-5 space-y-4 font-mono text-xs shadow-md">
          <span className="text-[11px] text-steel-muted uppercase tracking-wider block border-b border-steel-border pb-2">
            PARÁMETROS DEL TREN MOTRIZ Y FÍSICA
          </span>

          <div>
            <label className="text-steel-muted block mb-1 flex justify-between">
              <span>Diámetro de Llanta (mm):</span>
              <span className="text-white font-bold">{inputs.wheel_diameter_mm} mm</span>
            </label>
            <input
              type="range"
              min="15"
              max="100"
              value={inputs.wheel_diameter_mm}
              onChange={(e) => setInputs({ ...inputs, wheel_diameter_mm: Number(e.target.value) })}
              className="w-full accent-safety-orange cursor-pointer"
            />
          </div>

          <div>
            <label className="text-steel-muted block mb-1 flex justify-between">
              <span>RPM del Motor (Nominal):</span>
              <span className="text-white font-bold">{inputs.motor_rpm} RPM</span>
            </label>
            <input
              type="number"
              step="100"
              value={inputs.motor_rpm}
              onChange={(e) => setInputs({ ...inputs, motor_rpm: Number(e.target.value) })}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
            />
          </div>

          <div>
            <label className="text-steel-muted block mb-1 flex justify-between">
              <span>Relación de Reducción (X : 1):</span>
              <span className="text-safety-orange font-bold">{inputs.gear_ratio}:1</span>
            </label>
            <div className="flex gap-2 mb-2">
              {[20, 30, 50, 75, 100].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInputs({ ...inputs, gear_ratio: r })}
                  className={`flex-1 py-1 rounded border text-[11px] ${
                    inputs.gear_ratio === r
                      ? 'bg-safety-orange text-white border-safety-orange font-bold'
                      : 'bg-aerospace-900 text-steel-muted border-steel-border'
                  }`}
                >
                  {r}:1
                </button>
              ))}
            </div>
            <input
              type="number"
              value={inputs.gear_ratio}
              onChange={(e) => setInputs({ ...inputs, gear_ratio: Number(e.target.value) })}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
            />
          </div>

          <div>
            <label className="text-steel-muted block mb-1 flex justify-between">
              <span>Masa del Robot (Gramos):</span>
              <span className="text-white font-bold">{inputs.robot_mass_g} g</span>
            </label>
            <input
              type="number"
              value={inputs.robot_mass_g}
              onChange={(e) => setInputs({ ...inputs, robot_mass_g: Number(e.target.value) })}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
            />
          </div>

          <div>
            <label className="text-steel-muted block mb-1">Tipo de Tracción y Superficie:</label>
            <select
              value={inputs.friction_coeff}
              onChange={(e) => setInputs({ ...inputs, friction_coeff: Number(e.target.value) })}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
            >
              <option value="1.45">Neosilicona Shore 20A sobre Acero Pintado (μ = 1.45 - Sumo Pro)</option>
              <option value="1.20">Uretano Fundido 30A sobre Acero (μ = 1.20)</option>
              <option value="0.95">Goma Espuma Silicio sobre Madera (μ = 0.95)</option>
              <option value="0.75">Neumático de Caucho Estándar (μ = 0.75)</option>
            </select>
          </div>

          <div>
            <label className="text-steel-muted block mb-1 flex justify-between">
              <span>Downforce Adicional (Imanes Neodimio / Turbina):</span>
              <span className="text-cobalt-400 font-bold">+{inputs.downforce_g} g</span>
            </label>
            <input
              type="number"
              step="50"
              placeholder="0 para Mini-Sumo estándar"
              value={inputs.downforce_g}
              onChange={(e) => setInputs({ ...inputs, downforce_g: Number(e.target.value) })}
              className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
            />
            <span className="text-[10px] text-steel-muted block mt-1">
              * En Mega-Sumo 3kg, imanes N52 pueden añadir hasta +80,000g de empuje magnético.
            </span>
          </div>

        </div>

        {/* Panel de Resultados (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {results && (
            <div className="bg-aerospace-800 border border-steel-border rounded-xl p-4 sm:p-6 space-y-6 font-mono shadow-md">
              
              <div className="flex items-center justify-between border-b border-steel-border pb-3">
                <span className="text-xs text-safety-orange uppercase tracking-wider font-bold">
                  TELEMETRÍA PREDICTIVA // BANCO DE DINAMÓMETRO
                </span>
                <span className="text-xs text-steel-muted">
                  RPM en Eje: <strong className="text-white">{results.final_rpm} RPM</strong>
                </span>
              </div>

              {/* Tarjetas de Métricas Principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-aerospace-900 p-4 rounded-lg border border-steel-border">
                  <span className="text-[10px] text-steel-muted uppercase block">Velocidad Punta Teórica</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {results.max_speed_ms} <span className="text-sm font-normal text-steel-muted">m/s</span>
                  </div>
                  <span className="text-xs text-safety-orange block mt-0.5">({results.max_speed_kmh} km/h)</span>
                </div>

                <div className="bg-aerospace-900 p-4 rounded-lg border border-steel-border">
                  <span className="text-[10px] text-steel-muted uppercase block">Fuerza de Empuje Estática</span>
                  <div className="text-3xl font-extrabold text-cobalt-400 mt-1">
                    {results.pushing_force_n} <span className="text-sm font-normal text-steel-muted">N</span>
                  </div>
                  <span className="text-xs text-steel-light block mt-0.5">
                    ({results.pushing_force_kgf} kg de fuerza de tracción)
                  </span>
                </div>

                <div className="bg-aerospace-900 p-4 rounded-lg border border-steel-border">
                  <span className="text-[10px] text-steel-muted uppercase block">Aceleración Teórica</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {results.theoretical_accel} <span className="text-sm font-normal text-steel-muted">m/s²</span>
                  </div>
                </div>

                <div className="bg-aerospace-900 p-4 rounded-lg border border-steel-border">
                  <span className="text-[10px] text-steel-muted uppercase block">Tiempo en 0 a 100 cm</span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {results.time_to_1m_s} <span className="text-sm font-normal text-steel-muted">segundos</span>
                  </div>
                </div>
              </div>

              {/* Dictamen de Rendimiento de Combate */}
              <div className="bg-aerospace-900/60 p-4 rounded-lg border border-steel-border space-y-2 text-xs">
                <span className="text-steel-light font-bold uppercase block text-[11px]">
                  Evaluación Táctica para la Arena:
                </span>
                <p className="text-steel-muted leading-relaxed">
                  {results.max_speed_ms > 2.5
                    ? '⚡ Configuración de Alta Velocidad: Excelente para ataques por sorpresa o esquivas rápidas. Asegúrate de usar sensores ToF de alta frecuencia (>50Hz) para no salirte del dohyo antes de que el procesador compute el freno.'
                    : '🛡️ Configuración de Torque y Empuje: Menor velocidad lineal pero altísimo agarre contra oponentes directos en el choque frontal. Ideal para robots con pala biselada afilada.'}
                </p>
              </div>

              {/* CTA a taller con estos parámetros */}
              <button
                onClick={onOpenCustomLab}
                className="w-full py-3 rounded bg-safety-orange hover:bg-safety-orangeHover text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Cotizar Fabricación con esta Configuración en Custom Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
