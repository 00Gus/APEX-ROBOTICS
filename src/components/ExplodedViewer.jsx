import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Layers, Sliders, CheckCircle2, AlertTriangle, Shield, Cpu, RefreshCw, ShoppingCart, ZoomIn, ZoomOut, RotateCcw, Compass, ArrowRight } from 'lucide-react';
import { formatPriceMXN } from '../data/initialData';

const CATEGORY_CONFIGS = {
  sumo: {
    title: 'MINI-SUMO 500G "KATANA MK-IV"',
    subtitle: 'Inspecciona la arquitectura de combate: Pala Hardox 450, Chasis 7075, ESC dual STM32G4 y sensores ToF.',
    max_weight_g: 500,
    hardware_weight_g: 50,
    parts: [
      {
        id: 'blade',
        name: 'Pala Frontal Hardox 450 Biselada',
        category: 'Blindaje',
        material: 'Acero Hardox 450 templado con filo biselado CNC (0.3mm de tolerancia al dohyo)',
        weight_g: 45,
        price: 750.00,
        color: '#FF5A1F',
        description: 'Pala de perfil ultra-bajo con cuña de entrada de 15 grados y deflectores laterales que evitan ser volteado por oponentes.',
        options: [
          { name: 'Hardox 450 Biselado CNC (45g)', weight_g: 45, price_diff: 0 },
          { name: 'Titanio Grado 5 Aligerado (28g)', weight_g: 28, price_diff: 500 },
          { name: 'Pala de Fibra de Carbono 3mm (18g)', weight_g: 18, price_diff: 300 }
        ],
        selectedOption: 0
      },
      {
        id: 'chassis',
        name: 'Chasis CNC Monobloque Duraluminio 7075-T6',
        category: 'Estructura',
        material: 'Aluminio Aeroespacial 7075-T6 fresado con cajeras de aligeramiento y bancada de motores',
        weight_g: 110,
        price: 1690.00,
        color: '#94A3B8',
        description: 'Monobloque mecanizado con canales internos para arnés de cableado y centro de gravedad pegado al suelo.',
        options: [
          { name: 'Aluminio 7075-T6 Fresado (110g)', weight_g: 110, price_diff: 0 },
          { name: 'Híbrido Nylon PA-CF + Titanio (78g)', weight_g: 78, price_diff: 700 }
        ],
        selectedOption: 0
      },
      {
        id: 'electronics',
        name: 'PCB Integrada Dual ESC 30A STM32G4',
        category: 'Electrónica',
        material: 'FR4 4 capas con pistas de potencia de 3oz, acabado oro ENIG y microcontrolador STM32G4 170MHz',
        weight_g: 38,
        price: 1350.00,
        color: '#047857',
        description: 'Controlador de alta velocidad con 8x MOSFETs para tracción bidireccional continua de 30A sin caídas de voltaje.',
        options: [
          { name: 'Apex Dual 30A STM32G4 (38g)', weight_g: 38, price_diff: 0 },
          { name: 'Apex Dual 50A High-Peak (44g)', weight_g: 44, price_diff: 550 }
        ],
        selectedOption: 0
      },
      {
        id: 'motors',
        name: 'Par de Micromotores Coreless 30:1 Metálicos',
        category: 'Propulsión',
        material: 'Carcasa de acero inoxidable con reductor planetario de engranajes templados y eje en D',
        weight_g: 92,
        price: 1080.00,
        color: '#CBD5E1',
        description: 'Proporciona 2.4 Nm de torque en la flecha con respuesta de aceleración de 0 a máxima velocidad en menos de 10ms.',
        options: [
          { name: 'Coreless Apex 30:1 Metálico (92g)', weight_g: 92, price_diff: 0 },
          { name: 'Maxon DC Coreless 25:1 Suiza (86g)', weight_g: 86, price_diff: 1690 },
          { name: 'Brushless High-Torque Outrunners (105g)', weight_g: 105, price_diff: 1200 }
        ],
        selectedOption: 0
      },
      {
        id: 'wheels',
        name: 'Llantas de Neosilicona Shore 25A con Rin CNC',
        category: 'Tracción',
        material: 'Rines de duraluminio torneado CNC con silicón vulcanizado al vacío y prisionero de bronce',
        weight_g: 44,
        price: 640.00,
        color: '#334155',
        description: 'Coeficiente de fricción estática μ = 1.45 sobre dohyo metálico para máxima adherencia en colisiones directas.',
        options: [
          { name: 'Neosilicona Negra Shore 25A (44g)', weight_g: 44, price_diff: 0 },
          { name: 'Poliuretano Shore 40A para pista de lona (38g)', weight_g: 38, price_diff: -100 }
        ],
        selectedOption: 0
      },
      {
        id: 'battery',
        name: 'Batería LiPo 3S 450mAh 75C Graphene',
        category: 'Energía',
        material: 'Celdas LiPo de grafeno con conector XT30 dorado y cable AWG16 siliconado',
        weight_g: 56,
        price: 480.00,
        color: '#E2E8F0',
        description: 'Suministra hasta 33.7A continuos para evitar bloqueos por sobrecorriente cuando ambos robots chocan de frente.',
        options: [
          { name: 'LiPo 3S 450mAh 75C (56g)', weight_g: 56, price_diff: 0 },
          { name: 'LiPo 3S 650mAh 90C Ultra-Burst (72g)', weight_g: 72, price_diff: 240 }
        ],
        selectedOption: 0
      },
      {
        id: 'sensors',
        name: 'Arreglo 4x ToF Láser + Sensores de Piso',
        category: 'Sensórica',
        material: 'Módulos con blindaje metálico, lentes ópticos infrarrojos de 940nm y arnés ultra-flexible',
        weight_g: 22,
        price: 900.00,
        color: '#DC2626',
        description: 'Detección láser del oponente a 2 metros de distancia con tiempo de respuesta de 30ms inmune a reflejos de luz ambiental.',
        options: [
          { name: 'Kit 4x ToF Láser + 2x Borde (22g)', weight_g: 22, price_diff: 0 },
          { name: 'Kit 6x ToF Gran Angular + Giroscopio (30g)', weight_g: 30, price_diff: 600 }
        ],
        selectedOption: 0
      }
    ]
  },
  seguidor: {
    title: 'SEGUIDOR DE LÍNEA VELOCISTA "PHOTON TURBO V3"',
    subtitle: 'Despiece del velocista: Turbina de vacío EDF 30mm, Ala de 16 sensores QTR, PCB ENIG y tracción aligerada.',
    max_weight_g: 350,
    hardware_weight_g: 20,
    parts: [
      {
        id: 'turbine',
        name: 'Turbina Centrífuga de Vacío EDF 30mm',
        category: 'Efecto Suelo',
        material: 'Carcasa de aluminio anodizado con rotor balanceado dinámicamente a 48,000 RPM (Genera 650g de downforce)',
        weight_g: 28,
        price: 1290.00,
        color: '#FF5A1F',
        description: 'Turbina de succión aerodinámica que pega el robot a la pista permitiendo tomar curvas a más de 4.5 m/s sin derrapar.',
        options: [
          { name: 'EDF 30mm 48,000 RPM (28g)', weight_g: 28, price_diff: 0 },
          { name: 'EDF 35mm High-Flow 55,000 RPM (34g)', weight_g: 34, price_diff: 400 }
        ],
        selectedOption: 0
      },
      {
        id: 'sensor_wing',
        name: 'Barra Frontal 16 Sensores QTR-HD Infrarrojos',
        category: 'Sensórica',
        material: 'Placa curvada de fibra de carbono con 16 fototransistores emparejados y ADC de 16 bits de lectura rápida',
        weight_g: 18,
        price: 950.00,
        color: '#DC2626',
        description: 'Escanea el ancho de la línea de 19mm a una tasa de muestreo de 1,000Hz con algoritmo de control predictivo.',
        options: [
          { name: 'Barra 16 Sensores QTR-HD (18g)', weight_g: 18, price_diff: 0 },
          { name: 'Barra 20 Sensores Ultra-Wide (22g)', weight_g: 22, price_diff: 300 }
        ],
        selectedOption: 0
      },
      {
        id: 'pcb_chassis',
        name: 'Chasis Estructural PCB FR4 ENIG 2oz',
        category: 'Estructura / Control',
        material: 'PCB estructural de 1.6mm con baño de oro ENIG y microprocesador STM32G4 170MHz integrado',
        weight_g: 36,
        price: 1490.00,
        color: '#047857',
        description: 'Elimina cables y conectores pesados integrando drivers MOSFET, microcontrolador y chasis en una sola pieza monolítica.',
        options: [
          { name: 'PCB Integrado STM32G4 (36g)', weight_g: 36, price_diff: 0 },
          { name: 'PCB Híbrido con Refuerzo Carbono (40g)', weight_g: 40, price_diff: 360 }
        ],
        selectedOption: 0
      },
      {
        id: 'motors_line',
        name: 'Par de Motores Coreless Velocistas 20,000 RPM',
        category: 'Propulsión',
        material: 'Carcasa de acero niquelado con piñón de latón templado para reductor de relación 1:3.5',
        weight_g: 38,
        price: 1040.00,
        color: '#CBD5E1',
        description: 'Motores especiales sin núcleo de rotor ultraligero para aceleración casi instantánea de 0 a 1m en 0.45s.',
        options: [
          { name: 'Coreless High-RPM 1:3.5 (38g)', weight_g: 38, price_diff: 0 },
          { name: 'Brushless Outrunner Micro (44g)', weight_g: 44, price_diff: 900 }
        ],
        selectedOption: 0
      },
      {
        id: 'wheels_line',
        name: 'Rines CNC Aligerados con Silicona D20',
        category: 'Tracción',
        material: 'Rines de duraluminio torneados con cavidades de reducción y banda de silicón vulcanizado',
        weight_g: 14,
        price: 560.00,
        color: '#334155',
        description: 'Diseñados con inercia rotacional mínima para frenadas y cambios de dirección bruscos en chicanas.',
        options: [
          { name: 'Rin CNC + Silicón D20 (14g)', weight_g: 14, price_diff: 0 },
          { name: 'Rin de Carbono + Neosilicona (11g)', weight_g: 11, price_diff: 300 }
        ],
        selectedOption: 0
      },
      {
        id: 'battery_line',
        name: 'Batería LiPo 3S 300mAh 60C Ultraligera',
        category: 'Energía',
        material: 'Celdas LiPo de alta tasa de descarga C para entrega instantánea de corriente a la turbina y motores',
        weight_g: 28,
        price: 440.00,
        color: '#E2E8F0',
        description: 'Proporciona 3 minutos de autonomía de carrera completa con la turbina encendida al 85% de capacidad.',
        options: [
          { name: 'LiPo 3S 300mAh 60C (28g)', weight_g: 28, price_diff: 0 },
          { name: 'LiPo 3S 450mAh 75C (42g)', weight_g: 42, price_diff: 160 }
        ],
        selectedOption: 0
      },
      {
        id: 'chasis_carbon',
        name: 'Placa Inferior Guía en Fibra de Carbono',
        category: 'Chasis Base',
        material: 'Fibra de carbono 3K mate de 1.5mm mecanizada por CNC para apoyo aerodinámico',
        weight_g: 18,
        price: 380.00,
        color: '#475569',
        description: 'Placa base de deslizamiento con tornillos avellanados de titanio para cero fricción.',
        options: [
          { name: 'Carbono 3K 1.5mm (18g)', weight_g: 18, price_diff: 0 },
          { name: 'Carbono Toray Ultraligero 1mm (12g)', weight_g: 12, price_diff: 200 }
        ],
        selectedOption: 0
      }
    ]
  },
  combate1lb: {
    title: 'COMBATE 1LB "VORTEX DRUM SPINNER"',
    subtitle: 'Arquitectura destructiva: Tambor vertical a 22,000 RPM, Chasis de Titanio Grado 5 y blindaje UHMWPE.',
    max_weight_g: 454,
    hardware_weight_g: 45,
    parts: [
      {
        id: 'drum_weapon',
        name: 'Tambor Giratorio Asimétrico de Impacto',
        category: 'Arma Activa',
        material: 'Cilindro de impacto en Titanio Grado 5 con dientes biselados endurecidos (22,000 RPM)',
        weight_g: 115,
        price: 1690.00,
        color: '#FF5A1F',
        description: 'Transfiere más de 120 Joules de energía cinética en cada impacto para proyectar al oponente fuera del ring.',
        options: [
          { name: 'Tambor Titanio Grado 5 (115g)', weight_g: 115, price_diff: 0 },
          { name: 'Tambor Hardox 500 Pesado (135g)', weight_g: 135, price_diff: 300 }
        ],
        selectedOption: 0
      },
      {
        id: 'weapon_motor',
        name: 'Motor Brushless de Arma 2826 3000KV',
        category: 'Potencia de Arma',
        material: 'Motor outrunner balanceado con rodamientos cerámicos de alta velocidad y polea de Kevlar',
        weight_g: 52,
        price: 900.00,
        color: '#CBD5E1',
        description: 'Lleva el arma de reposo a velocidad destructiva de combate en tan solo 1.2 segundos.',
        options: [
          { name: 'Brushless 2826 3000KV (52g)', weight_g: 52, price_diff: 0 },
          { name: 'Brushless High-Torque 3500KV (60g)', weight_g: 60, price_diff: 400 }
        ],
        selectedOption: 0
      },
      {
        id: 'chassis_combat',
        name: 'Chasis Cuña Titanio 3mm + Laterales UHMWPE',
        category: 'Estructura / Blindaje',
        material: 'Armazón de placas de Titanio Grado 5 con paredes laterales de UHMWPE disipadoras de impacto',
        weight_g: 130,
        price: 1890.00,
        color: '#94A3B8',
        description: 'Estructura elástica con alta capacidad de absorción contra discos y sierras giratorias adversarias.',
        options: [
          { name: 'Titanio 3mm + UHMWPE (130g)', weight_g: 130, price_diff: 0 },
          { name: 'Sándwich Fibra de Carbono 4mm (115g)', weight_g: 115, price_diff: 600 }
        ],
        selectedOption: 0
      },
      {
        id: 'drive_motors',
        name: 'Par de Motores N20 High-Speed Planetarios',
        category: 'Tracción',
        material: 'Motores reductores totalmente metálicos con engranajes templados y escobillas de carbono',
        weight_g: 58,
        price: 720.00,
        color: '#CBD5E1',
        description: 'Garantizan velocidad de maniobra de 3.8 m/s para esquivar y buscar los flancos débiles del rival.',
        options: [
          { name: 'N20 High-Speed Planetarios (58g)', weight_g: 58, price_diff: 0 }
        ],
        selectedOption: 0
      },
      {
        id: 'esc_combat',
        name: 'Dual ESC 20A con Sistema Fail-Safe Homologado',
        category: 'Electrónica',
        material: 'PCB sellada con conector de corte exterior y luz LED indicadora de arma activa',
        weight_g: 34,
        price: 1100.00,
        color: '#047857',
        description: 'Homologado bajo reglamento SPARC con frenado activo del arma en menos de 20 segundos.',
        options: [
          { name: 'Dual ESC Fail-Safe SPARC (34g)', weight_g: 34, price_diff: 0 }
        ],
        selectedOption: 0
      },
      {
        id: 'battery_combat',
        name: 'Batería LiPo 3S 350mAh 80C Graphene',
        category: 'Energía',
        material: 'Celdas reforzadas contra impactos mecánicos con envoltura de aramida',
        weight_g: 38,
        price: 480.00,
        color: '#E2E8F0',
        description: 'Soporta picos de descarga extrema de hasta 30A sin deformarse durante los choques.',
        options: [
          { name: 'LiPo 3S 350mAh 80C (38g)', weight_g: 38, price_diff: 0 }
        ],
        selectedOption: 0
      },
      {
        id: 'wheels_combat',
        name: 'Ruedas de Goma Espuma Silicio Alto Agarre',
        category: 'Ruedas de Combate',
        material: 'Espuma de silicona vulcanizada sobre núcleo de nylon mecanizado',
        weight_g: 18,
        price: 480.00,
        color: '#334155',
        description: 'Absorben golpes laterales directos sin doblar los ejes de los motores de tracción.',
        options: [
          { name: 'Espuma Silicio Alto Agarre (18g)', weight_g: 18, price_diff: 0 }
        ],
        selectedOption: 0
      },
      {
        id: 'top_plate_combat',
        name: 'Tapa Superior Policarbonato Antibalas 2mm',
        category: 'Blindaje Superior',
        material: 'Policarbonato Makrolon termoformado con ventilación para batería',
        weight_g: 18,
        price: 1090.00,
        color: '#64748B',
        description: 'Protección transparente contra hachas y golpes superiores de 150 PSI.',
        options: [
          { name: 'Policarbonato 2mm (18g)', weight_g: 18, price_diff: 0 },
          { name: 'Titanio Grado 5 1.5mm (26g)', weight_g: 26, price_diff: 300 }
        ],
        selectedOption: 0
      }
    ]
  }
};

export default function ExplodedViewer({ category = 'sumo', onAddToCart }) {
  // Normalize category key
  const normalizedCategory = category.includes('seguidor') ? 'seguidor' : category.includes('combate') ? 'combate1lb' : 'sumo';
  const [activeCategoryKey, setActiveCategoryKey] = useState(normalizedCategory);
  const currentConfig = CATEGORY_CONFIGS[activeCategoryKey] || CATEGORY_CONFIGS.sumo;

  const [explosionFactor, setExplosionFactor] = useState(65);
  const [parts, setParts] = useState(currentConfig.parts);
  const [selectedPartId, setSelectedPartId] = useState(currentConfig.parts[0].id);
  const [autoRotate, setAutoRotate] = useState(true);

  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const rootGroupRef = useRef(null);
  const meshesRef = useRef({});

  // Sync when prop category changes
  useEffect(() => {
    const key = category.includes('seguidor') ? 'seguidor' : category.includes('combate') ? 'combate1lb' : 'sumo';
    setActiveCategoryKey(key);
  }, [category]);

  // When active category key changes, reset parts and selected part
  useEffect(() => {
    const conf = CATEGORY_CONFIGS[activeCategoryKey] || CATEGORY_CONFIGS.sumo;
    setParts(conf.parts);
    setSelectedPartId(conf.parts[0].id);
  }, [activeCategoryKey]);

  // Calculate live weight and price
  const totalWeight = parts.reduce((acc, p) => {
    const opt = p.options[p.selectedOption || 0];
    return acc + opt.weight_g;
  }, currentConfig.hardware_weight_g);

  const totalPrice = parts.reduce((acc, p) => {
    const opt = p.options[p.selectedOption || 0];
    return acc + p.price + (opt.price_diff || 0);
  }, 0);

  const MAX_LIMIT = currentConfig.max_weight_g;
  const isWeightValid = totalWeight <= MAX_LIMIT;
  const activePart = parts.find(p => p.id === selectedPartId) || parts[0];

  const handleOptionChange = (partId, optionIndex) => {
    setParts(prev => prev.map(p => {
      if (p.id === partId) {
        return { ...p, selectedOption: optionIndex };
      }
      return p;
    }));
  };

  // Three.js interactive exploded view setup with photorealistic mechatronics assemblies
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(5.2, 4.2, 7.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Grid Floor
    const grid = new THREE.GridHelper(14, 28, 0x334155, 0x1e293b);
    grid.position.y = -2.2;
    scene.add(grid);

    // Soft Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.19;
    scene.add(shadowMesh);

    // Studio Lighting Suite (High Contrast, Metallic Highlights, No Muddy Black)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(8, 14, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    fillLight.position.set(-8, 5, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff5a1f, 2.8);
    rimLight.position.set(-5, 8, -8);
    scene.add(rimLight);

    const underLight = new THREE.DirectionalLight(0xffffff, 1.2);
    underLight.position.set(0, -6, 5);
    scene.add(underLight);

    // Assembly Root Group
    const rootGroup = new THREE.Group();
    rootGroupRef.current = rootGroup;
    scene.add(rootGroup);

    // Shared Engineering Materials
    const matDuralumin = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const matPolishedAlu = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
    const matStainlessSteel = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.92, roughness: 0.15 });
    const matHardoxOrange = new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.6, roughness: 0.25 });
    const matGroundSteelTip = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
    const matCarbonFiber = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.45 });
    const matBrassGold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.88, roughness: 0.25 });
    const matSiliconeTire = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.05 });
    const matPCBMatte = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4, metalness: 0.2 });
    const matChipBlack = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6, metalness: 0.1 });
    const matRedLens = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.8, roughness: 0.2 });
    const matLiPoSilver = new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.75, roughness: 0.3 });
    const matWireRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const matWireBlack = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

    const meshes = {};

    // Build specific 3D exploded assembly based on activeCategoryKey
    if (activeCategoryKey === 'seguidor') {
      // -------------------------------------------------------------
      // SEGUIDOR DE LÍNEA VELOCISTA EXPLODED ASSEMBLY
      // -------------------------------------------------------------
      
      // 1. Turbina Centrífuga EDF 30mm (Explodes UPWARDS)
      const turbineGroup = new THREE.Group();
      const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.75, 24), matHardoxOrange);
      turbineGroup.add(shroud);
      const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16), matPolishedAlu);
      turbineGroup.add(rotor);
      // Fan blades
      for (let i = 0; i < 6; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.2), matStainlessSteel);
        blade.rotation.y = (i * Math.PI) / 3;
        blade.position.set(Math.sin((i * Math.PI) / 3) * 0.35, 0, Math.cos((i * Math.PI) / 3) * 0.35);
        turbineGroup.add(blade);
      }
      rootGroup.add(turbineGroup);
      meshes.turbine = { group: turbineGroup, basePos: new THREE.Vector3(0, 0.45, -0.2), explodeDir: new THREE.Vector3(0, 2.5, 0) };

      // 2. Barra Frontal 16 Sensores QTR (Explodes FORWARD)
      const sensorWingGroup = new THREE.Group();
      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.4), matCarbonFiber);
      sensorWingGroup.add(wing);
      for (let i = -1.2; i <= 1.2; i += 0.16) {
        const irDot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.1), matRedLens);
        irDot.position.set(i, -0.04, 0.05);
        sensorWingGroup.add(irDot);
      }
      rootGroup.add(sensorWingGroup);
      meshes.sensor_wing = { group: sensorWingGroup, basePos: new THREE.Vector3(0, 0.02, 1.6), explodeDir: new THREE.Vector3(0, 0.5, 2.6) };

      // 3. Chasis PCB Estructural FR4 ENIG (CENTER ANCHOR)
      const pcbGroup = new THREE.Group();
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 3.2), matPCBMatte);
      pcbGroup.add(pcb);
      // Gold traces border
      const pcbG = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.05, 3.24), matBrassGold);
      pcbG.position.y = -0.01;
      pcbGroup.add(pcbG);
      // Carbon stiffeners
      const sparL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 3.0), matCarbonFiber);
      sparL.position.set(-0.75, 0.08, 0);
      const sparR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 3.0), matCarbonFiber);
      sparR.position.set(0.75, 0.08, 0);
      pcbGroup.add(sparL);
      pcbGroup.add(sparR);
      // STM32 chip
      const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), matChipBlack);
      mcu.position.set(0, 0.05, 0.4);
      pcbGroup.add(mcu);
      rootGroup.add(pcbGroup);
      meshes.pcb_chassis = { group: pcbGroup, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) };

      // 4. Motores Velocistas (Explodes DOWNWARDS)
      const motorGroup = new THREE.Group();
      [-0.55, 0.55].forEach(x => {
        const mot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.85, 16), matStainlessSteel);
        mot.position.set(x, 0, -1.0);
        motorGroup.add(mot);
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), matBrassGold);
        pin.position.set(x, -0.45, -1.0);
        motorGroup.add(pin);
      });
      rootGroup.add(motorGroup);
      meshes.motors_line = { group: motorGroup, basePos: new THREE.Vector3(0, -0.15, 0), explodeDir: new THREE.Vector3(0, -1.8, 0) };

      // 5. Ruedas Aligeradas (Explodes BACKWARDS / SIDES)
      const wheelGroup = new THREE.Group();
      [-0.95, 0.95].forEach(x => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.18, 20), matSiliconeTire);
        tire.rotateZ(Math.PI / 2);
        tire.position.set(x, 0, -1.0);
        wheelGroup.add(tire);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), matPolishedAlu);
        rim.rotateZ(Math.PI / 2);
        rim.position.set(x, 0, -1.0);
        wheelGroup.add(rim);
      });
      rootGroup.add(wheelGroup);
      meshes.wheels_line = { group: wheelGroup, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, -2.2) };

      // 6. Batería LiPo 3S 300mAh (Explodes UPWARDS FORWARD)
      const batGroup = new THREE.Group();
      const bat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.65), matLiPoSilver);
      batGroup.add(bat);
      const xt = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.2), matBrassGold);
      xt.position.set(0.5, 0, 0);
      batGroup.add(xt);
      rootGroup.add(batGroup);
      meshes.battery_line = { group: batGroup, basePos: new THREE.Vector3(0, 0.2, 0.9), explodeDir: new THREE.Vector3(0, 2.0, 1.2) };

    } else if (activeCategoryKey === 'combate1lb') {
      // -------------------------------------------------------------
      // COMBATE 1LB VORTEX DRUM EXPLODED ASSEMBLY
      // -------------------------------------------------------------
      
      // 1. Tambor Giratorio de Impacto (Explodes FORWARD)
      const drumGroup = new THREE.Group();
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 24), matHardoxOrange);
      drum.rotateZ(Math.PI / 2);
      drumGroup.add(drum);
      // Hardened striking teeth
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.25), matGroundSteelTip);
      t1.position.set(0.38, 0, 0);
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.25), matGroundSteelTip);
      t2.position.set(-0.38, 0, 0);
      t2.rotation.x = Math.PI;
      drumGroup.add(t1);
      drumGroup.add(t2);
      rootGroup.add(drumGroup);
      meshes.drum_weapon = { group: drumGroup, basePos: new THREE.Vector3(0, 0.1, 1.1), explodeDir: new THREE.Vector3(0, 0.4, 2.8) };

      // 2. Motor de Arma Brushless (Explodes UPWARDS)
      const wMotorGroup = new THREE.Group();
      const wMot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 20), matStainlessSteel);
      wMot.rotateZ(Math.PI / 2);
      wMotorGroup.add(wMot);
      const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), matBrassGold);
      pulley.rotateZ(Math.PI / 2);
      pulley.position.set(0.35, 0, 0);
      wMotorGroup.add(pulley);
      rootGroup.add(wMotorGroup);
      meshes.weapon_motor = { group: wMotorGroup, basePos: new THREE.Vector3(0, 0.5, 0.4), explodeDir: new THREE.Vector3(0, 2.2, 0) };

      // 3. Chasis Titanio 3mm + UHMWPE (CENTER ANCHOR)
      const cChassisGroup = new THREE.Group();
      const cBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 1.8), matDuralumin);
      cChassisGroup.add(cBody);
      const cTop = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 1.6), matCarbonFiber);
      cTop.position.y = 0.31;
      cChassisGroup.add(cTop);
      // Wheel guards
      const gL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.8), matDuralumin);
      gL.position.set(-1.3, 0, -0.35);
      const gR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.8), matDuralumin);
      gR.position.set(1.3, 0, -0.35);
      cChassisGroup.add(gL);
      cChassisGroup.add(gR);
      rootGroup.add(cChassisGroup);
      meshes.chassis_combat = { group: cChassisGroup, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) };

      // 4. Motores Tracción N20 (Explodes DOWNWARDS)
      const n20Group = new THREE.Group();
      [-0.6, 0.6].forEach(x => {
        const n20 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.6), matBrassGold);
        n20.position.set(x, 0, -0.35);
        n20Group.add(n20);
      });
      rootGroup.add(n20Group);
      meshes.drive_motors = { group: n20Group, basePos: new THREE.Vector3(0, -0.2, 0), explodeDir: new THREE.Vector3(0, -1.8, 0) };

      // 5. Dual ESC Fail-Safe (Explodes UPWARDS BACK)
      const escGroup = new THREE.Group();
      const esc = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.6), matPCBMatte);
      escGroup.add(esc);
      rootGroup.add(escGroup);
      meshes.esc_combat = { group: escGroup, basePos: new THREE.Vector3(0, 0.35, -0.3), explodeDir: new THREE.Vector3(0, 1.8, -1.2) };

      // 6. Batería LiPo 3S 350mAh (Explodes UPWARDS HIGH)
      const cBatGroup = new THREE.Group();
      const cBat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.7), matLiPoSilver);
      cBatGroup.add(cBat);
      rootGroup.add(cBatGroup);
      meshes.battery_combat = { group: cBatGroup, basePos: new THREE.Vector3(0, 0.7, -0.3), explodeDir: new THREE.Vector3(0, 3.2, -1.0) };

    } else {
      // -------------------------------------------------------------
      // MINI-SUMO 500G KATANA MK-IV EXPLODED ASSEMBLY (DEFAULT)
      // -------------------------------------------------------------
      
      // 1. Blade
      const bladeGroup = new THREE.Group();
      const bladeWedgeGeo = new THREE.BufferGeometry();
      const bVerts = new Float32Array([
        -1.2,  0.35,  0.4,
         1.2,  0.35,  0.4,
         1.35, -0.35,  1.4,
        -1.2,  0.35,  0.4,
         1.35, -0.35,  1.4,
        -1.35, -0.35,  1.4,
      ]);
      bladeWedgeGeo.setAttribute('position', new THREE.BufferAttribute(bVerts, 3));
      bladeWedgeGeo.computeVertexNormals();
      const bladeMesh = new THREE.Mesh(bladeWedgeGeo, matHardoxOrange);
      bladeMesh.material.side = THREE.DoubleSide;
      bladeGroup.add(bladeMesh);
      const razorTip = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.03, 0.08), matGroundSteelTip);
      razorTip.position.set(0, -0.35, 1.42);
      bladeGroup.add(razorTip);
      const deflL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.7), matHardoxOrange);
      deflL.position.set(-1.26, 0.02, 0.85);
      deflL.rotation.y = 0.18;
      const deflR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.7), matHardoxOrange);
      deflR.position.set(1.26, 0.02, 0.85);
      deflR.rotation.y = -0.18;
      bladeGroup.add(deflL);
      bladeGroup.add(deflR);
      [-0.8, -0.3, 0.3, 0.8].forEach(x => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), matStainlessSteel);
        bolt.position.set(x, 0.22, 0.6);
        bolt.rotation.x = -Math.PI / 6;
        bladeGroup.add(bolt);
      });
      rootGroup.add(bladeGroup);
      meshes.blade = { group: bladeGroup, basePos: new THREE.Vector3(0, -0.3, 0.9), explodeDir: new THREE.Vector3(0, -0.6, 2.8) };

      // 2. Chassis
      const chassisGroup = new THREE.Group();
      const chassisBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 2.0), matDuralumin);
      chassisGroup.add(chassisBase);
      const carbonTopFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.9), matCarbonFiber);
      carbonTopFrame.position.y = 0.27;
      chassisGroup.add(carbonTopFrame);
      [[-0.88, 0.83], [0.88, 0.83], [-0.88, -0.83], [0.88, -0.83]].forEach(([x, z]) => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), matPolishedAlu);
        screw.position.set(x, 0.32, z);
        chassisGroup.add(screw);
      });
      rootGroup.add(chassisGroup);
      meshes.chassis = { group: chassisGroup, basePos: new THREE.Vector3(0, 0, 0), explodeDir: new THREE.Vector3(0, 0, 0) };

      // 3. Electronics
      const pcbGroup = new THREE.Group();
      const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 1.7), matPCBMatte);
      pcbGroup.add(pcbBoard);
      const pcbBorder = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.05, 1.72), matBrassGold);
      pcbBorder.position.y = -0.01;
      pcbGroup.add(pcbBorder);
      const stm32 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), matChipBlack);
      stm32.position.set(-0.25, 0.05, 0.1);
      pcbGroup.add(stm32);
      [-0.6, 0.4].forEach(xOff => {
        for (let z = -0.5; z <= 0.4; z += 0.3) {
          const mosfet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.18), matChipBlack);
          mosfet.position.set(xOff, 0.05, z);
          pcbGroup.add(mosfet);
        }
      });
      rootGroup.add(pcbGroup);
      meshes.electronics = { group: pcbGroup, basePos: new THREE.Vector3(0, 0.35, 0), explodeDir: new THREE.Vector3(0, 2.0, 0) };

      // 4. Motors
      const motorGroup = new THREE.Group();
      [-0.55, 0.55].forEach(x => {
        const mSub = new THREE.Group();
        mSub.position.set(x, 0, 0);
        const mCan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.8, 20), matStainlessSteel);
        mCan.rotation.x = Math.PI / 2;
        mCan.position.set(0, 0, -0.35);
        mSub.add(mCan);
        const gBox = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.5), matBrassGold);
        gBox.position.set(0, 0, 0.15);
        mSub.add(gBox);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.45, 12), matPolishedAlu);
        shaft.rotation.x = Math.PI / 2;
        shaft.position.set(0, 0, 0.5);
        mSub.add(shaft);
        motorGroup.add(mSub);
      });
      rootGroup.add(motorGroup);
      meshes.motors = { group: motorGroup, basePos: new THREE.Vector3(0, -0.22, 0), explodeDir: new THREE.Vector3(0, -1.8, 0) };

      // 5. Wheels
      const wheelsGroup = new THREE.Group();
      [-1.25, 1.25].forEach((x) => {
        const wSub = new THREE.Group();
        wSub.position.set(x, 0, -0.15);
        const tireGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.28, 28);
        tireGeo.rotateZ(Math.PI / 2);
        const tire = new THREE.Mesh(tireGeo, matSiliconeTire);
        wSub.add(tire);
        const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.3, 24);
        rimGeo.rotateZ(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, matPolishedAlu);
        wSub.add(rim);
        const nutGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.35, 6);
        nutGeo.rotateZ(Math.PI / 2);
        const nut = new THREE.Mesh(nutGeo, matBrassGold);
        wSub.add(nut);
        wheelsGroup.add(wSub);
      });
      rootGroup.add(wheelsGroup);
      meshes.wheels = { group: wheelsGroup, basePos: new THREE.Vector3(0, -0.05, 0), explodeDir: new THREE.Vector3(0, 0, -2.4) };

      // 6. Battery
      const batGroup = new THREE.Group();
      const lipoMain = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.32, 0.85), matLiPoSilver);
      batGroup.add(lipoMain);
      const labelStrip = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.01, 0.5), matHardoxOrange);
      labelStrip.position.y = 0.165;
      batGroup.add(labelStrip);
      const xt30 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), matBrassGold);
      xt30.position.set(0.85, 0.02, 0.15);
      batGroup.add(xt30);
      rootGroup.add(batGroup);
      meshes.battery = { group: batGroup, basePos: new THREE.Vector3(0, 0.7, -0.3), explodeDir: new THREE.Vector3(0, 3.2, -1.2) };

      // 7. Sensors
      const sensGroup = new THREE.Group();
      [
        { x: -0.7, rot: 0.35 },
        { x: -0.25, rot: 0 },
        { x: 0.25, rot: 0 },
        { x: 0.7, rot: -0.35 }
      ].forEach((sData) => {
        const pod = new THREE.Group();
        pod.position.set(sData.x, 0, 0);
        pod.rotation.y = sData.rot;
        const sPCB = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.05), matCarbonFiber);
        pod.add(sPCB);
        const sHousing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), matStainlessSteel);
        sHousing.position.set(0, 0, 0.05);
        pod.add(sHousing);
        [-0.045, 0.045].forEach(lx => {
          const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.04, 12), matRedLens);
          lens.rotation.x = Math.PI / 2;
          lens.position.set(lx, 0, 0.095);
          pod.add(lens);
        });
        sensGroup.add(pod);
      });
      rootGroup.add(sensGroup);
      meshes.sensors = { group: sensGroup, basePos: new THREE.Vector3(0, 0.1, 1.15), explodeDir: new THREE.Vector3(0, 1.6, 2.5) };
    }

    meshesRef.current = meshes;

    // Mouse drag rotation & Zoom controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !rootGroup) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      rootGroup.rotation.y += deltaX * 0.007;
      rootGroup.rotation.x += deltaY * 0.007;
      rootGroup.rotation.x = Math.max(-0.6, Math.min(0.8, rootGroup.rotation.x));
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.002;
      const newFov = Math.max(25, Math.min(65, camera.fov + zoomDelta * 10));
      camera.fov = newFov;
      camera.updateProjectionMatrix();
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Animation Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDragging && autoRotate) {
        rootGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [activeCategoryKey, autoRotate]);

  // Update mesh positions when explosionFactor changes
  useEffect(() => {
    const meshes = meshesRef.current;
    const factor = explosionFactor / 100;

    Object.keys(meshes).forEach((key) => {
      const item = meshes[key];
      if (item && item.group) {
        item.group.position.x = item.basePos.x + item.explodeDir.x * factor;
        item.group.position.y = item.basePos.y + item.explodeDir.y * factor;
        item.group.position.z = item.basePos.z + item.explodeDir.z * factor;
      }
    });
  }, [explosionFactor, activeCategoryKey]);

  const handleResetCamera = () => {
    if (!cameraRef.current || !rootGroupRef.current) return;
    cameraRef.current.position.set(5.2, 4.2, 7.5);
    cameraRef.current.fov = 40;
    cameraRef.current.updateProjectionMatrix();
    rootGroupRef.current.rotation.set(0, 0, 0);
  };

  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const newFov = Math.max(25, Math.min(65, cameraRef.current.fov + delta));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Selector de Modelos en la parte superior del Despiece */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-aerospace-800/80 p-3 rounded-lg border border-steel-border">
        <span className="text-xs font-mono text-steel-muted uppercase flex items-center gap-1.5 font-semibold">
          <Layers className="w-3.5 h-3.5 text-safety-orange" />
          MODELO EN INSPECCIÓN:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'sumo', label: 'Mini-Sumo 500g' },
            { key: 'seguidor', label: 'Seguidor de Línea Turbo' },
            { key: 'combate1lb', label: 'Combate 1lb Antweight' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryKey(cat.key)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all border ${
                activeCategoryKey === cat.key
                  ? 'bg-safety-orange text-white border-safety-orange font-bold shadow-sm'
                  : 'bg-aerospace-900 text-steel-light border-steel-border hover:border-steel-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-steel-border gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-safety-orange/10 border border-safety-orange/30 text-safety-orange text-xs font-mono font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            CONFIGURADOR INTERACTIVO POR CAPAS CAD
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            DESPIECE 3D: <span className="text-safety-orange">{currentConfig.title}</span>
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1">
            {currentConfig.subtitle}
          </p>
        </div>

        {/* Báscula en Vivo */}
        <div className="bg-aerospace-800 border border-steel-border p-3 rounded-lg flex items-center gap-4">
          <div>
            <span className="text-[10px] font-mono text-steel-muted uppercase block">Báscula Reglamentaria</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className={`text-2xl font-extrabold ${isWeightValid ? 'text-emerald-400' : 'text-rose-500'}`}>
                {totalWeight} g
              </span>
              <span className="text-xs text-steel-muted">/ {MAX_LIMIT} g max</span>
            </div>
          </div>
          <div className="border-l border-steel-border pl-4">
            {isWeightValid ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                HOMOLOGADO (PASSED)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                EXCESO (+{totalWeight - MAX_LIMIT}g)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Central: Visor 3D + Slider de Despiece + Panel de Piezas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Columna Izquierda: Visor 3D y Slider (7 columnas) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full h-[340px] sm:h-[460px] lg:h-[500px] bg-aerospace-800 rounded-xl border border-steel-border overflow-hidden shadow-xl">
            
            {/* Control Flotante de Despiece (Explosion Slider) */}
            <div className="absolute top-3 left-3 right-3 z-10 bg-aerospace-900 border border-steel-border rounded-lg p-2.5 sm:p-3 flex items-center gap-3 sm:gap-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono text-steel-light whitespace-nowrap">
                <Sliders className="w-4 h-4 text-safety-orange" />
                <span className="font-semibold text-[11px] sm:text-xs">NIVEL DE DESPIECE:</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={explosionFactor}
                onChange={(e) => setExplosionFactor(Number(e.target.value))}
                className="w-full accent-safety-orange cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-safety-orange w-10 sm:w-12 text-right">
                {explosionFactor}%
              </span>
            </div>

            {/* Botones de Control de Cámara a la izquierda */}
            <div className="absolute left-3 top-16 sm:top-20 z-10 flex flex-col gap-1 bg-aerospace-900 p-1 rounded-lg border border-steel-border shadow">
              <button
                onClick={() => handleZoom(-6)}
                className="p-1.5 text-steel-muted hover:text-white hover:bg-aerospace-800 rounded transition-colors"
                title="Acercar cámara (o usa rueda del mouse)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom(6)}
                className="p-1.5 text-steel-muted hover:text-white hover:bg-aerospace-800 rounded transition-colors"
                title="Alejar cámara"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetCamera}
                className="p-1.5 text-steel-muted hover:text-safety-orange hover:bg-aerospace-800 rounded transition-colors border-t border-steel-border/50"
                title="Restablecer vista centrada"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded transition-colors border-t border-steel-border/50 ${
                  autoRotate ? 'text-emerald-400 bg-emerald-500/10' : 'text-steel-muted hover:text-white'
                }`}
                title="Activar/Pausar rotación automática"
              >
                <Compass className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
              </button>
            </div>

            {/* Canvas 3D */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Leyenda de capas en la parte inferior */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-steel-muted bg-aerospace-900 px-3 py-1.5 rounded border border-steel-border shadow">
              <span>Arrastra: Rotar • Rueda: Zoom</span>
              <span className="text-steel-light font-semibold hidden xs:inline">{parts.length} Subsistemas Desacoplables</span>
            </div>
          </div>

          {/* Selector Rápido de Subsistemas (Píldoras con scroll horizontal en móvil) */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
            {parts.map((p) => {
              const isSelected = p.id === selectedPartId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPartId(p.id)}
                  className={`text-xs font-mono px-3 py-1.5 rounded border transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-safety-orange text-white border-safety-orange font-bold shadow-sm'
                      : 'bg-aerospace-800 text-steel-muted border-steel-border hover:text-steel-light hover:border-steel-muted'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span>{p.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Ficha Técnica de la Pieza Seleccionada y Variantes (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-aerospace-800 border border-steel-border rounded-xl p-5 space-y-4 shadow-xl">
            
            {/* Header de la pieza */}
            <div className="border-b border-steel-border pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-titanium-700 text-steel-light border border-steel-border font-semibold">
                  {activePart.category}
                </span>
                <span className="text-base font-mono font-bold text-white">
                  {formatPriceMXN(activePart.price + (activePart.options[activePart.selectedOption || 0].price_diff || 0))}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-2">{activePart.name}</h3>
              <p className="text-xs font-mono text-steel-muted mt-1 leading-relaxed">{activePart.description}</p>
            </div>

            {/* Materiales y Especificaciones */}
            <div className="bg-aerospace-900/80 p-3.5 rounded-lg border border-steel-border/50 text-xs font-mono space-y-2">
              <div>
                <span className="text-steel-muted block text-[10px] font-semibold uppercase">ESPECIFICACIÓN MECÁNICA / MATERIAL:</span>
                <span className="text-steel-light font-semibold">{activePart.material}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-steel-border/40 text-steel-muted">
                <span>Masa de este subsistema:</span>
                <span className="text-white font-bold">
                  {activePart.options[activePart.selectedOption || 0].weight_g} g
                </span>
              </div>
            </div>

            {/* Selector de Variantes de Material / Pieza */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-steel-muted block font-semibold uppercase">
                SELECCIONA VARIANTE O MEJORA DE RENDIMIENTO:
              </label>
              <div className="space-y-1.5">
                {activePart.options.map((opt, idx) => {
                  const isOptSelected = (activePart.selectedOption || 0) === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionChange(activePart.id, idx)}
                      className={`w-full text-left p-2.5 rounded text-xs font-mono border transition-all flex items-center justify-between ${
                        isOptSelected
                          ? 'bg-titanium-700 text-white border-safety-orange font-bold shadow-sm'
                          : 'bg-aerospace-900/60 text-steel-muted border-steel-border/60 hover:text-steel-light hover:border-steel-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isOptSelected ? 'border-safety-orange bg-safety-orange' : 'border-steel-border'
                        }`}>
                          {isOptSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                        <span>{opt.name}</span>
                      </div>
                      <span className="text-steel-light font-bold">
                        {opt.price_diff > 0 ? `+${formatPriceMXN(opt.price_diff)}` : opt.price_diff < 0 ? `-${formatPriceMXN(Math.abs(opt.price_diff))}` : 'Estándar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumen Final de Configuración */}
            <div className="pt-4 border-t border-steel-border space-y-3">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-xs text-steel-muted">TOTAL ROBOT CONFIGURADO:</span>
                <span className="text-xl font-extrabold text-white">{formatPriceMXN(totalPrice)}</span>
              </div>

              <button
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart({
                      id: `custom-${activeCategoryKey}`,
                      name: `${currentConfig.title} (Configurado: ${totalWeight}g)`,
                      price: totalPrice,
                      weight_g: totalWeight,
                      category: activeCategoryKey,
                      quantity: 1,
                      isCustomized: true
                    });
                  }
                }}
                disabled={!isWeightValid}
                className={`w-full py-3 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isWeightValid
                    ? 'bg-safety-orange hover:bg-safety-orangeHover text-white cursor-pointer'
                    : 'bg-titanium-800 text-steel-muted border border-steel-border cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isWeightValid ? 'AÑADIR ESTE SETUP AL CARRITO' : 'AJUSTA EL PESO PARA HOMOLOGAR'}
                </span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
