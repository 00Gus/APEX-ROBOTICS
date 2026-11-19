import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Upload, Wrench, Cpu, CheckCircle2, FileText, ArrowRight, Activity, Search, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { formatPriceMXN } from '../data/initialData';
import { submitCustomProjectForm, fetchProjectByFolio } from '../services/apiClient';

const AVAILABLE_SERVICES = [
  { id: 'cnc_7075', name: 'Mecanizado CNC de Alta Precisión (Aluminio 7075-T6)', cost: 1900.0, icon: Wrench, desc: 'Tolerancia dimensional garantizada ±0.03mm en centro de maquinado.' },
  { id: 'laser_cf', name: 'Corte por Láser / Waterjet (Fibra de Carbono o Titanio Grado 5)', cost: 1400.0, icon: Layers, desc: 'Corte limpio sin delaminación para placas de chasis y escudos.' },
  { id: 'print_pacf', name: 'Impresión 3D Técnica de Alta Resistencia (Nylon PA-CF)', cost: 900.0, icon: Cpu, desc: 'Filamento de poliamida cargado con 20% fibra de carbono para carcasas rígidas.' },
  { id: 'components_sourcing', name: 'Suministro de Componentes & Refacciones Homologadas', cost: 1000.0, icon: Sparkles, desc: 'Selección de motores, ESCs y sensores optimizados para tu clase.' },
  { id: 'mechanical_assembly', name: 'Ensamble Mecánico Completo en Laboratorio', cost: 1500.0, icon: Wrench, desc: 'Montaje de rodamientos, flechas, ajuste de tolerancia y torque de tornillería.' },
  { id: 'electronics_harness', name: 'Soldadura de PCB y Arnés Ignífugo de Silicona', cost: 1300.0, icon: Activity, desc: 'Cableado AWG resistente a 200°C con conectores de alta tasa C (XT30/XT60).' },
  { id: 'pid_programming', name: 'Programación de Algoritmos Base (PID / Búsqueda)', cost: 1600.0, icon: Cpu, desc: 'Código estructurado en C++ / STM32 optimizado con filtros de ruido.' },
  { id: 'bench_telemetry_test', name: 'Prueba en Banco de Dinamómetro con Video Certificado', cost: 800.0, icon: CheckCircle2, desc: 'Test de empuje, consumo de corriente pico y pesaje oficial en báscula calibrada.' },
];

export default function CustomLab() {
  const [activeStage, setActiveStage] = useState('cad'); // 'cad', 'repair', 'concept'
  const [selectedServices, setSelectedServices] = useState(['cnc_7075', 'components_sourcing', 'bench_telemetry_test']);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    category: 'sumo',
    target_weight_g: 500,
    target_tournament: 'Torneo Nacional / All Japan',
    description: '',
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProject, setSubmittedProject] = useState(null);

  // Tracker state
  const [trackerId, setTrackerId] = useState('');
  const [trackedProject, setTrackedProject] = useState(null);
  const [trackerError, setTrackerError] = useState('');

  // 3D Canvas Ref
  const mountRef = useRef(null);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const calculateEstimate = () => {
    let total = 1200.0; // Tarifa base de revisión técnica geométrica
    selectedServices.forEach(sId => {
      const s = AVAILABLE_SERVICES.find(item => item.id === sId);
      if (s) total += s.cost;
    });
    return total;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('client_name', formData.client_name);
      data.append('client_email', formData.client_email);
      data.append('client_phone', formData.client_phone);
      data.append('category', formData.category);
      data.append('stage', activeStage);
      data.append('description', formData.description);
      data.append('services', JSON.stringify(selectedServices));
      data.append('target_weight_g', formData.target_weight_g);
      data.append('target_tournament', formData.target_tournament);
      data.append('estimated_cost', calculateEstimate());
      if (uploadedFile) {
        data.append('cad_file', uploadedFile);
      }

      const result = await submitCustomProjectForm(data);
      if (result && result.success) {
        setSubmittedProject({
          ...result,
          estimated_cost: calculateEstimate()
        });
      }
    } catch (err) {
      console.error('Error submitting project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async () => {
    if (!trackerId.trim()) return;
    setTrackerError('');
    try {
      const data = await fetchProjectByFolio(trackerId);
      if (data) {
        setTrackedProject(data);
      } else {
        setTrackerError('No se encontró ningún proyecto con el folio ingresado.');
        setTrackedProject(null);
      }
    } catch (err) {
      setTrackerError('Error al consultar el proyecto.');
    }
  };

  // 3D Canvas for Sample Custom Chassis
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2.5, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(8, 16, 0x283449, 0x161B22);
    grid.position.y = -0.8;
    scene.add(grid);

    // Procedural Custom CAD Prototype
    const group = new THREE.Group();
    scene.add(group);

    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true
    });

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3
    });

    // Custom multi-pocket milled chassis base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 2.0), solidMat);
    group.add(base);

    // Wireframe overlay to look like CAD review
    const baseWire = new THREE.Mesh(new THREE.BoxGeometry(2.41, 0.51, 2.01), wireMat);
    group.add(baseWire);

    // CNC pocket cutouts
    const pocketGeo = new THREE.BoxGeometry(0.7, 0.3, 0.6);
    const p1 = new THREE.Mesh(pocketGeo, wireMat);
    p1.position.set(-0.6, 0.2, 0);
    const p2 = new THREE.Mesh(pocketGeo, wireMat);
    p2.position.set(0.6, 0.2, 0);
    group.add(p1);
    group.add(p2);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header del Custom Lab */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-safety-orange/10 border border-safety-orange/30 text-safety-orange text-xs font-mono font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            EL TALLER A TU MEDIDA // CUSTOM ENGINEERING
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ENVÍA TU PROYECTO, PLANO O ROBOT
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1 max-w-3xl">
            Tú decides el alcance: desde maquinar una sola pieza en aluminio 7075 o fibra de carbono, hasta entregarte el robot 100% ensamblado y afinado con telemetría de prueba en banco.
          </p>
        </div>

        {/* Botón de rastreo rápido */}
        <div className="bg-aerospace-800 border border-steel-border p-3 rounded-lg flex items-center gap-2">
          <input
            type="text"
            placeholder="Folio ej. LAB-2026-0842"
            value={trackerId}
            onChange={(e) => setTrackerId(e.target.value)}
            className="bg-aerospace-900 border border-steel-border rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-safety-orange uppercase"
          />
          <button
            onClick={handleTrackSearch}
            className="px-3 py-1.5 rounded bg-titanium-700 hover:bg-titanium-600 text-xs font-mono text-white border border-steel-border flex items-center gap-1"
          >
            <Search className="w-3 h-3 text-safety-orange" />
            <span>Consultar</span>
          </button>
        </div>
      </div>

      {/* Resultado de búsqueda en Tracker (Si existe) */}
      {trackedProject && (
        <div className="bg-aerospace-800 border border-safety-orange/50 rounded-xl p-4 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-start justify-between border-b border-steel-border pb-3">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-safety-orange/20 text-safety-orange font-bold uppercase">
                ESTADO EN VIVO DEL TALLER
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Folio: {trackedProject.id}</h3>
              <p className="text-xs font-mono text-steel-muted">Cliente: {trackedProject.client_name} ({trackedProject.client_email})</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-steel-muted block">Presupuesto Estimado:</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{formatPriceMXN(trackedProject.estimated_cost)}</span>
            </div>
          </div>

          {/* Stepper de Progreso en Taller */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-center">
            {[
              { id: 'revision_cad', label: '1. Revisión CAD' },
              { id: 'cotizado', label: '2. Aprobado' },
              { id: 'maquila', label: '3. En Maquila CNC' },
              { id: 'ensamble', label: '4. Ensamble Lab' },
              { id: 'listo_envio', label: '5. Listo p/ Envío' },
            ].map((step, idx) => {
              const isCurrent = trackedProject.status === step.id;
              const isPast = ['revision_cad', 'cotizado', 'maquila', 'ensamble', 'listo_envio'].indexOf(trackedProject.status) >= idx;
              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded border ${
                    isCurrent
                      ? 'bg-safety-orange/20 text-safety-orange border-safety-orange font-bold'
                      : isPast
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                      : 'bg-aerospace-900/40 text-steel-muted border-steel-border/50'
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
          </div>

          <div className="bg-aerospace-900/80 p-4 rounded border border-steel-border text-xs font-mono space-y-1">
            <span className="text-steel-muted text-[10px] block font-semibold uppercase">Notas del Ingeniero de Laboratorio:</span>
            <p className="text-steel-light leading-relaxed">{trackedProject.telemetry_notes || 'Revisión en proceso...'}</p>
          </div>
        </div>
      )}

      {trackerError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded text-xs font-mono text-rose-400 text-center">
          {trackerError}
        </div>
      )}

      {/* Pantalla de Éxito al Enviar Proyecto */}
      {submittedProject ? (
        <div className="bg-aerospace-800 border border-emerald-500/40 rounded-xl p-6 sm:p-8 text-center max-w-2xl mx-auto space-y-4 shadow-md">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">¡PROYECTO INGRESADO AL TALLER!</h3>
          <p className="text-xs font-mono text-steel-light leading-relaxed">
            Tu proyecto ha sido registrado con éxito en nuestro sistema de laboratorio. Tu folio oficial de seguimiento es:
          </p>
          <div className="bg-aerospace-900 border border-steel-border p-4 rounded-lg inline-block font-mono text-2xl font-extrabold text-safety-orange tracking-widest">
            {submittedProject.project_id}
          </div>
          <p className="text-xs font-mono text-steel-muted">
            Estimación preliminar de servicios: <strong className="text-white">{formatPriceMXN(submittedProject.estimated_cost)}</strong>.
            Un ingeniero mecatrónico revisará la geometría y te contactará en menos de 24 horas hábiles.
          </p>
          <button
            onClick={() => setSubmittedProject(null)}
            className="py-2.5 px-6 rounded bg-titanium-700 hover:bg-titanium-600 text-white font-mono text-xs font-semibold border border-steel-border"
          >
            Registrar Otro Proyecto
          </button>
        </div>
      ) : (
        /* Formulario Principal de Configuración y Subida */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario y Selección de Servicios (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Paso 1: Selección de Etapa */}
            <div className="bg-aerospace-800/90 border border-steel-border rounded-xl p-5 space-y-3">
              <span className="text-[11px] font-mono text-steel-muted uppercase tracking-wider block">
                PASO 1: ¿EN QUÉ ETAPA ESTÁ TU PROYECTO?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'cad', label: 'Tengo Archivo CAD 3D', sub: 'STEP, STL, DXF, Fusion' },
                  { id: 'repair', label: 'Tengo un Robot Físico', sub: 'Afinación / Reparación' },
                  { id: 'concept', label: 'Tengo Idea o Boceto', sub: 'Diseño desde cero' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActiveStage(st.id)}
                    className={`p-3 rounded text-left border font-mono transition-all ${
                      activeStage === st.id
                        ? 'bg-titanium-700 text-white border-safety-orange font-bold shadow-sm'
                        : 'bg-aerospace-900/60 text-steel-muted border-steel-border/60 hover:text-steel-light'
                    }`}
                  >
                    <span className="text-xs block text-steel-light font-semibold">{st.label}</span>
                    <span className="text-[10px] text-steel-muted block mt-0.5">{st.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 2: Selección de Servicios Requeridos */}
            <div className="bg-aerospace-800/90 border border-steel-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-steel-border pb-2">
                <span className="text-[11px] font-mono text-steel-muted uppercase tracking-wider">
                  PASO 2: ¿QUÉ SERVICIOS REQUIERES DE NUESTRO TALLER?
                </span>
                <span className="text-xs font-mono text-safety-orange font-bold">
                  {selectedServices.length} seleccionados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_SERVICES.map((srv) => {
                  const isChecked = selectedServices.includes(srv.id);
                  const Icon = srv.icon;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => toggleService(srv.id)}
                      className={`p-3 rounded border cursor-pointer font-mono text-xs transition-all flex items-start gap-2.5 ${
                        isChecked
                          ? 'bg-titanium-700 text-white border-safety-orange'
                          : 'bg-aerospace-900/50 text-steel-muted border-steel-border/50 hover:border-steel-muted'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? 'bg-safety-orange border-safety-orange text-white' : 'border-steel-border'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-steel-light">{srv.name}</span>
                        </div>
                        <p className="text-[10px] text-steel-muted mt-1 leading-normal">{srv.desc}</p>
                        <span className="text-[11px] text-safety-orange font-bold mt-1 block">+{formatPriceMXN(srv.cost)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paso 3: Datos de Contacto y Archivo */}
            <form onSubmit={handleSubmit} className="bg-aerospace-800/90 border border-steel-border rounded-xl p-5 space-y-4">
              <span className="text-[11px] font-mono text-steel-muted uppercase tracking-wider block border-b border-steel-border pb-2">
                PASO 3: ESPECIFICACIONES TÉCNICAS Y SUBIDA DE ARCHIVOS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-steel-muted block mb-1">Nombre Completo / Equipo / Universidad:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez (Lab Robótica Tec)"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
                <div>
                  <label className="text-steel-muted block mb-1">Correo Electrónico Oficial:</label>
                  <input
                    type="email"
                    required
                    placeholder="nombre@universidad.edu"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
                <div>
                  <label className="text-steel-muted block mb-1">Categoría del Robot:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                  >
                    <option value="sumo">Mini-Sumo 500g / Mega-Sumo 3kg</option>
                    <option value="combate">Combate 1lb Antweight / 3lb Beetleweight</option>
                    <option value="seguidor">Seguidor de Línea Velocista</option>
                    <option value="laberinto">Micromouse Resuelve Laberintos</option>
                    <option value="otro">Proyecto Personalizado / Prototipo Especial</option>
                  </select>
                </div>
                <div>
                  <label className="text-steel-muted block mb-1">Peso Objetivo (Gramos):</label>
                  <input
                    type="number"
                    value={formData.target_weight_g}
                    onChange={(e) => setFormData({ ...formData, target_weight_g: e.target.value })}
                    className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              {/* Subida de archivo 3D o Documento */}
              <div className="border-2 border-dashed border-steel-border hover:border-safety-orange/50 rounded-lg p-5 text-center transition-colors">
                <input
                  type="file"
                  id="cad-upload"
                  onChange={handleFileChange}
                  accept=".step,.stp,.stl,.dxf,.pdf,.zip,.rar"
                  className="hidden"
                />
                <label htmlFor="cad-upload" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-safety-orange mx-auto mb-2" />
                  <span className="text-xs font-mono font-semibold text-white block">
                    {uploadedFile ? uploadedFile.name : 'Haz clic para seleccionar o arrastra tu archivo CAD'}
                  </span>
                  <span className="text-[10px] font-mono text-steel-muted block mt-1">
                    Formatos recomendados: .STEP, .STL, .DXF, .PDF, .ZIP (Máx. 50MB)
                  </span>
                </label>
              </div>

              <div>
                <label className="text-xs font-mono text-steel-muted block mb-1">
                  Descripción o Requerimientos Particulares:
                </label>
                <textarea
                  rows="3"
                  placeholder="Detalla qué componentes ya tienes, qué tolerancias requieres o en qué torneo vas a competir..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-aerospace-900 border border-steel-border rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-safety-orange"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded bg-safety-orange hover:bg-safety-orangeHover text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'PROCESANDO INGRESO A TALLER...' : 'ENVIAR PROYECTO PARA COTIZACIÓN TÉCNICA'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Columna Derecha: Visor 3D CAD Preview + Resumen de Presupuesto (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Visor 3D CAD Wireframe */}
            <div className="bg-aerospace-800 border border-steel-border rounded-xl p-4 space-y-2 shadow-md">
              <div className="flex items-center justify-between text-xs font-mono border-b border-steel-border pb-2">
                <span className="text-steel-muted">ENTORNO DE INSPECCIÓN CAD</span>
                <span className="text-cobalt-400 font-bold">VISTA TÉCNICA</span>
              </div>

              <div className="relative w-full h-[260px] bg-aerospace-900 rounded border border-steel-border/60 overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-steel-muted bg-aerospace-900/80 px-2 py-0.5 rounded border border-steel-border">
                  Rotación 3D automática
                </div>
              </div>
            </div>

            {/* Resumen de Presupuesto Estimado */}
            <div className="bg-aerospace-800 border border-steel-border rounded-xl p-5 space-y-4 font-mono">
              <span className="text-[11px] text-steel-muted uppercase tracking-wider block border-b border-steel-border pb-2">
                DESGLOSE DE ESTIMACIÓN PRELIMINAR
              </span>

              <div className="space-y-2 text-xs divide-y divide-steel-border/40">
                <div className="flex justify-between pt-1 text-steel-muted">
                  <span>Revisión geométrica inicial:</span>
                  <span className="text-white font-semibold">{formatPriceMXN(1200.00)}</span>
                </div>

                {selectedServices.map(sId => {
                  const s = AVAILABLE_SERVICES.find(item => item.id === sId);
                  if (!s) return null;
                  return (
                    <div key={s.id} className="flex justify-between pt-1 text-steel-muted">
                      <span className="truncate pr-2">{s.name.split('(')[0]}</span>
                      <span className="text-white font-bold">{formatPriceMXN(s.cost)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-steel-border flex items-baseline justify-between">
                <span className="text-xs text-steel-muted">TOTAL ESTIMADO:</span>
                <span className="text-2xl font-extrabold text-white">{formatPriceMXN(calculateEstimate())}</span>
              </div>

              <p className="text-[10px] text-steel-muted leading-relaxed">
                * El costo final se ratifica tras la inspección dimensional del archivo CAD o la recepción física del robot en laboratorio.
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
