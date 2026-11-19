// Datos iniciales de homologación y catálogo en Pesos Mexicanos (MXN)
// Permite que la plataforma funcione tanto con backend SQLite local como de forma 100% autónoma en GitHub Pages.

export const formatPriceMXN = (amount) => {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

export const INITIAL_PRODUCTS = [
  {
    id: 'katana-mk4-mini-sumo',
    slug: 'katana-mk4-mini-sumo',
    name: 'Katana MK-IV Mini-Sumo 500g',
    category: 'sumo',
    level: 'ready',
    price: 6890.00,
    weight_g: 485,
    dimensions: '9.8 x 9.8 x 4.2 cm',
    max_speed_ms: 1.85,
    torque_nm: 2.4,
    sensors: '4x Láser ToF 2m + 2x Sensores de borde QRE1113 analógicos',
    motor_type: 'Dual Coreless 30:1 Reducción Planetaria Acero',
    chassis_material: 'Aluminio 7075-T6 CNC + Pala Hardox 450 Biselada',
    ruleset_compliance: 'All Japan Robot-Sumo & Torneos Nacionales (500g / 10x10cm)',
    description: 'Mini-Sumo autónomo de grado profesional. Diseñado para arranque agresivo con 5 perfiles de táctica seleccionables por interruptores DIP de microsegundos.',
    in_stock: 1,
    image_badge: 'SUMO-PRO',
    components: [
      { name: 'Pala Frontal Hardox 450 Templada', weight_g: 45, type: 'Pala' },
      { name: 'Chasis Mecanizado 7075 CNC', weight_g: 110, type: 'Estructura' },
      { name: 'PCB Central STM32G4 Dual 30A ESC', weight_g: 38, type: 'Electrónica' },
      { name: 'Motores Micro Coreless 30:1 (Par)', weight_g: 92, type: 'Propulsión' },
      { name: 'Llantas de Tracción Silicona Shore 25A', weight_g: 44, type: 'Tracción' },
      { name: 'Batería LiPo 3S 450mAh 75C Graphene', weight_g: 56, type: 'Energía' },
      { name: 'Sensores Láser ToF & Piso', weight_g: 22, type: 'Sensórica' },
      { name: 'Tornillería Titanio M2 y Arneses', weight_g: 78, type: 'Accesorios' }
    ]
  },
  {
    id: 'katana-mk4-diy-kit',
    slug: 'katana-mk4-diy-kit',
    name: 'Kit Modular DIY: Mini-Sumo Katana',
    category: 'sumo',
    level: 'kit',
    price: 5350.00,
    weight_g: 485,
    dimensions: '9.8 x 9.8 x 4.2 cm',
    max_speed_ms: 1.85,
    torque_nm: 2.4,
    sensors: '4x ToF + 2x Sensores de borde incluidos',
    motor_type: 'Dual Coreless 30:1 Metálico',
    chassis_material: 'Aluminio 7075-T6 fresado + Pala Acero templado',
    ruleset_compliance: 'All Japan Robot-Sumo (500g)',
    description: 'Mismo chasis y electrónica del MK-IV para ensamble en tu laboratorio. Incluye código base en C++ con librerías de filtrado de ruido y búsqueda en espiral.',
    in_stock: 1,
    image_badge: 'SUMO-KIT',
    components: [
      { name: 'Chasis y pala precortados', weight_g: 155, type: 'Estructura' },
      { name: 'Kit electrónico completo sin soldar', weight_g: 60, type: 'Electrónica' },
      { name: 'Motores y rines con moldes de silicona', weight_g: 136, type: 'Propulsión' },
      { name: 'Arnés y manual de calibración paso a paso', weight_g: 134, type: 'Accesorios' }
    ]
  },
  {
    id: 'oni-3kg-mega-sumo-rc',
    slug: 'oni-3kg-mega-sumo-rc',
    name: 'ONI 3kg Mega-Sumo Torneo RC',
    category: 'sumo',
    level: 'ready',
    price: 22900.00,
    weight_g: 2975,
    dimensions: '19.4 x 19.4 x 6.5 cm',
    max_speed_ms: 3.2,
    torque_nm: 14.8,
    sensors: 'Sistema RC 2.4GHz FHSS de baja latencia + Telemetría',
    motor_type: 'Brushless Outrunner Custom Direct Drive (x4)',
    chassis_material: 'Monobloque Duraluminio 7075 + Imanes de Neodimio N52 (85kg downforce)',
    ruleset_compliance: 'Reglamento Oficial Mega-Sumo 3kg RC',
    description: 'Monstruo de empuje con imanes de neodimio que aumentan la tracción sobre dohyo metálico a más de 80kg de fuerza de arrastre estática. ESCs de 60A continuos por motor.',
    in_stock: 1,
    image_badge: 'MEGA-SUMO',
    components: [
      { name: 'Pala de Acero Sueco Hardox 500', weight_g: 320, type: 'Pala' },
      { name: 'Chasis Monobloque 7075 + Porta-imanes', weight_g: 940, type: 'Estructura' },
      { name: '4x Motores Brushless con Reducción Planetaria', weight_g: 780, type: 'Propulsión' },
      { name: 'Cuádruple ESC 60A BLHeli_32', weight_g: 120, type: 'Electrónica' },
      { name: 'Banco Neodimio N52 de Adherencia', weight_g: 410, type: 'Física' },
      { name: 'Batería LiPo 6S 1500mAh 100C', weight_g: 245, type: 'Energía' },
      { name: 'Receptor RC & Tracción Uretano 20A', weight_g: 160, type: 'Tracción' }
    ]
  },
  {
    id: 'vortex-antweight-1lb-combat',
    slug: 'vortex-antweight-1lb-combat',
    name: 'Vortex Antweight 1lb Combate',
    category: 'combate',
    level: 'ready',
    price: 8350.00,
    weight_g: 445,
    dimensions: '14.0 x 12.5 x 6.2 cm',
    max_speed_ms: 3.8,
    torque_nm: 1.9,
    sensors: 'Falla segura Fail-Safe RF homologada según RoboGames',
    motor_type: 'Tracción N20 High-Speed + Tambor Brushless 22,000 RPM',
    chassis_material: 'Armazón de Titanio Grado 5 (3mm) y Tapa UHMWPE',
    ruleset_compliance: 'SPARC Ruleset & Torneos Antweight 1lb (454g)',
    description: 'Robot de combate con tambor vertical asimétrico de impacto destructivo. Chasis mecanizado en titanio grado 5 con absorción elástica de impactos.',
    in_stock: 1,
    image_badge: 'COMBAT-1LB',
    components: [
      { name: 'Tambor Giratorio Titanio Grado 5', weight_g: 115, type: 'Arma' },
      { name: 'Motor Brushless de Arma 2826 3000KV', weight_g: 52, type: 'Propulsión Arma' },
      { name: 'Chasis Estructural UHMWPE + Titanio', weight_g: 130, type: 'Estructura' },
      { name: 'Par Motores Tracción Planetarios Metálicos', weight_g: 58, type: 'Tracción' },
      { name: 'Electrónica Dual ESC con Fail-Safe', weight_g: 34, type: 'Electrónica' },
      { name: 'Batería LiPo 3S 350mAh 80C', weight_g: 38, type: 'Energía' },
      { name: 'Ruedas de Goma Espuma Silicio Alto Agarre', weight_g: 18, type: 'Tracción' }
    ]
  },
  {
    id: 'ripper-beetleweight-3lb-combat',
    slug: 'ripper-beetleweight-3lb-combat',
    name: 'Ripper Beetleweight 3lb Combate',
    category: 'combate',
    level: 'ready',
    price: 15450.00,
    weight_g: 1320,
    dimensions: '22.0 x 19.5 x 7.8 cm',
    max_speed_ms: 4.5,
    torque_nm: 5.6,
    sensors: 'Telemetría de voltaje y temperatura de bobina en vivo',
    motor_type: 'Tracción Brushless Directa + Disco Horizontal 18,000 RPM',
    chassis_material: 'Sándwich Fibra de Carbono 4mm + Escudo Frontal AR400',
    ruleset_compliance: 'Reglamento SPARC Beetleweight 3lb (1360g)',
    description: 'Arma de barra horizontal giratoria con filo de corte intercambiable. Capaz de propinar impactos de 350 Joules sin deformación estructural de bancada.',
    in_stock: 1,
    image_badge: 'COMBAT-3LB',
    components: [
      { name: 'Barra Horizontal Acero Templado 4140', weight_g: 340, type: 'Arma' },
      { name: 'Motor Outrunner Arma 3536 1400KV', weight_g: 105, type: 'Propulsión Arma' },
      { name: 'Chasis Fibra de Carbono Mate 4mm + AR400', weight_g: 410, type: 'Estructura' },
      { name: 'Tracción Brushless con Reducción Planetaria', weight_g: 220, type: 'Tracción' },
      { name: 'ESC Brushless Tracción & Arma (100A Total)', weight_g: 85, type: 'Electrónica' },
      { name: 'Batería LiPo 4S 850mAh 95C Graphene', weight_g: 110, type: 'Energía' },
      { name: 'Ruedas de Poliuretano Fundido Mecanizado', weight_g: 50, type: 'Tracción' }
    ]
  },
  {
    id: 'photon-turbo-v3-linefollower',
    slug: 'photon-turbo-v3-linefollower',
    name: 'Photon Turbo V3 Seguidor de Línea',
    category: 'seguidor',
    level: 'ready',
    price: 6150.00,
    weight_g: 162,
    dimensions: '23.5 x 16.0 x 4.8 cm',
    max_speed_ms: 4.85,
    torque_nm: 0.95,
    sensors: 'Barra 16 Sensores QTR-HD Calibrados con ADC de 16 bits',
    motor_type: 'Dual Coreless 12V + Turbina EDF 30mm Vacío 48,000 RPM',
    chassis_material: 'PCB Estructural FR4 Oro ENIG + Refuerzo Fibra Carbono 1.5mm',
    ruleset_compliance: 'RoboChallenge Europa & Torneos Internacionales Velocistas',
    description: 'Velocista puro con turbina centrífuga de succión al vacío que genera 650g de downforce aerodinámico contra el piso. Algoritmo PID con control predictivo de curvas.',
    in_stock: 1,
    image_badge: 'SEGUIDOR-TURBO',
    components: [
      { name: 'Turbina EDF 30mm Succión Aerodinámica', weight_g: 28, type: 'Downforce' },
      { name: 'Chasis PCB Integrado STM32G474 170MHz', weight_g: 36, type: 'Control' },
      { name: 'Barra Frontal 16x Sensores Infrarrojos', weight_g: 18, type: 'Sensórica' },
      { name: 'Motores Coreless Especiales 20,000 RPM', weight_g: 38, type: 'Propulsión' },
      { name: 'Rines de Aluminio CNC + Llantas Silicona D20', weight_g: 14, type: 'Tracción' },
      { name: 'Batería LiPo 3S 300mAh 60C Ultraligera', weight_g: 28, type: 'Energía' }
    ]
  },
  {
    id: 'labyrinth-chrono-s-micromouse',
    slug: 'labyrinth-chrono-s-micromouse',
    name: 'Labyrinth Chrono-S Micromouse',
    category: 'laberinto',
    level: 'ready',
    price: 7750.00,
    weight_g: 79,
    dimensions: '8.2 x 7.4 x 3.6 cm',
    max_speed_ms: 3.4,
    torque_nm: 0.6,
    sensors: '4x Láser Micro-LIDAR ToF + 2x Encoders Magnéticos 4096 CPR + Giroscopio 6-Ejes',
    motor_type: 'Micromotores Coreless Paso a Paso / DC Sin Escobillas de Alta Resolución',
    chassis_material: 'Impresión 3D SLS Nylon PA12 + Fibra de Carbono',
    ruleset_compliance: 'Reglamento Internacional IEEE Micromouse (Laberinto 16x16 celdas)',
    description: 'Resuelve-laberintos autónomo de alta velocidad con algoritmo Flood-Fill optimizado y mapeo en RAM no volátil. Calcula diagonales automáticas en la segunda corrida.',
    in_stock: 1,
    image_badge: 'MICROMOUSE',
    components: [
      { name: 'Sensor 4x Micro-LIDAR de Distancia', weight_g: 8, type: 'Sensórica' },
      { name: 'Procesador Dual-Core ESP32-S3 + IMU 6-Axis', weight_g: 14, type: 'Cerebro' },
      { name: 'Chasis Ultraligero SLS Nylon PA12', weight_g: 19, type: 'Estructura' },
      { name: 'Motores Coreless con Encoders Magnéticos', weight_g: 22, type: 'Propulsión' },
      { name: 'Batería LiPo 2S 250mAh High Discharge', weight_g: 16, type: 'Energía' }
    ]
  }
];

export const INITIAL_RULESETS = [
  {
    id: 1,
    league_name: 'All Japan Robot-Sumo',
    category_name: 'Mini-Sumo 500g Autónomo',
    max_weight_g: 500,
    max_dim_l_cm: 10.0,
    max_dim_w_cm: 10.0,
    max_dim_h_cm: null,
    max_voltage_s: 3,
    description: 'Dohyo circular de acero pintado de negro con borde blanco de 2.5cm. Arranque obligatorio tras 5 segundos de cuenta regresiva.',
    notes: 'No se permiten sistemas de adherencia neumática o succión de aire artificial.'
  },
  {
    id: 2,
    league_name: 'All Japan Robot-Sumo',
    category_name: 'Mega-Sumo 3kg RC / Autónomo',
    max_weight_g: 3000,
    max_dim_l_cm: 20.0,
    max_dim_w_cm: 20.0,
    max_dim_h_cm: null,
    max_voltage_s: 6,
    description: 'Dohyo de acero macizo de 154cm de diámetro. Se permite adherencia magnética pasiva con imanes permanentes de neodimio.',
    notes: 'Las palas de acero templado no deben dañar el acabado de pintura del dohyo.'
  },
  {
    id: 3,
    league_name: 'SPARC / RoboGames',
    category_name: 'Combate Antweight 1lb',
    max_weight_g: 454,
    max_dim_l_cm: null,
    max_dim_w_cm: null,
    max_dim_h_cm: null,
    max_voltage_s: 4,
    description: 'Pelea en arena cerrada de policarbonato con foso de eliminación o riesgos de piso. Desconexión de energía exterior obligatoria.',
    notes: 'Armas activas (discos, tambores, barras) deben frenar a cero en menos de 30 segundos tras apagado de emergencia (Fail-Safe).'
  },
  {
    id: 4,
    league_name: 'SPARC / RoboGames',
    category_name: 'Combate Beetleweight 3lb',
    max_weight_g: 1361,
    max_dim_l_cm: null,
    max_dim_w_cm: null,
    max_dim_h_cm: null,
    max_voltage_s: 4,
    description: 'Combate destructivo con límite de velocidad de punta de arma a 400 km/h (250 mph). Baterías protegidas en carcasa a prueba de punzonado.',
    notes: 'Permite armas giratorias, neumáticas, levantadoras y aplastadoras.'
  },
  {
    id: 5,
    league_name: 'RoboChallenge Internacional',
    category_name: 'Seguidor de Línea Enhanced (Turbina Vacío)',
    max_weight_g: null,
    max_dim_l_cm: 30.0,
    max_dim_w_cm: 20.0,
    max_dim_h_cm: null,
    max_voltage_s: 3,
    description: 'Pista de fondo blanco con línea negra mate de 19mm de ancho. Curvas de radio mínimo 10cm y rectas de aceleración libre.',
    notes: 'Se permite downforce mediante turbinas de succión si no dañan el vinilo de la pista.'
  },
  {
    id: 6,
    league_name: 'IEEE Micromouse Standard',
    category_name: 'Micromouse Laberinto Clásico',
    max_weight_g: 250,
    max_dim_l_cm: 12.0,
    max_dim_w_cm: 12.0,
    max_dim_h_cm: null,
    max_voltage_s: 2,
    description: 'Laberinto ortogonal de 16x16 celdas de 18x18cm cada una. Paredes de 5cm de alto pintadas de blanco con tope rojo.',
    notes: 'El robot debe ser totalmente autónomo; no se permite comunicación por radio exterior durante la corrida.'
  }
];

export const INITIAL_HALL_OF_FAME = [
  {
    id: 1,
    robot_name: 'Katana Redux V2',
    category: 'Mini-Sumo 500g',
    tournament: 'Torneo Nacional de Robótica 2025',
    result: '1er Lugar (Invicto 14-0)',
    year: 2025,
    pilot_team: 'Equipo MechaTech - Fac. Ingeniería',
    record_metric: 'Tiempo de combate promedio: 1.4 segundos',
    key_specs: ['Chasis CNC 7075 Apex', 'Sensores Láser ToF 50Hz', 'Llantas Neosilicona 20A'],
    image_tag: 'SUMO_CHAMPION'
  },
  {
    id: 2,
    robot_name: 'HyperBorealis',
    category: 'Seguidor de Línea',
    tournament: 'Copa Latinoamericana de Velocistas',
    result: 'Récord de Pista & 1er Lugar',
    year: 2025,
    pilot_team: 'Ing. Carlos Mendoza & Apex Lab',
    record_metric: 'Circuito 24.8m en 3.72 segundos (6.66 m/s pico)',
    key_specs: ['Turbina EDF 32mm 50,000 RPM', 'Barra 16 Sensores QTR', 'Controlador STM32G4'],
    image_tag: 'LINE_RECORD'
  },
  {
    id: 3,
    robot_name: 'Titanium Jaw 3lb',
    category: 'Combate Beetleweight',
    tournament: 'RoboClash Arena Ciudad de México',
    result: '1er Lugar & Premio Mejor Diseño Mecánico',
    year: 2026,
    pilot_team: 'Robotic Warfare Club',
    record_metric: '4 Knockouts por expulsión fuera del ring en menos de 45s',
    key_specs: ['Tambor Asimétrico Hardox 500', 'Batería 4S 100C', 'Armadura UHMWPE mecanizada'],
    image_tag: 'COMBAT_WINNER'
  }
];

export const INITIAL_CUSTOM_PROJECTS = [
  {
    id: 'LAB-2026-0842',
    client_name: 'Prof. David Morales (Lab de Mecatrónica)',
    client_email: 'dmorales@ingenieria.edu',
    client_phone: '+52 55 1234 5678',
    category: 'sumo',
    stage: 'cad',
    description: 'Chasis de Mini-Sumo con inclinación de pala a 15 grados y ranuras para motores 30:1. Requerimos mecanizado en aluminio 7075 y pala templada en Hardox.',
    file_name: 'chasis_sumo_v3_rev2.step',
    file_url: '/uploads/sample_chassis.step',
    services: ['Mecanizado CNC 7075', 'Corte de pala Hardox', 'Banco de pruebas de tracción'],
    target_weight_g: 490,
    target_tournament: 'Torneo All Japan Qualifier',
    estimated_cost: 4300.00,
    status: 'maquila',
    telemetry_notes: 'Corte CNC finalizado. Tolerancia dimensional verificada a ±0.03mm. En proceso de arenado y tratamiento de pala.'
  },
  {
    id: 'LAB-2026-0843',
    client_name: 'Valeria Cruz (Escudería Robótica)',
    client_email: 'vcruz.robotics@gmail.com',
    client_phone: '+52 81 9876 5432',
    category: 'combate',
    stage: 'concept',
    description: 'Robot de combate 1lb con disco vertical. Tenemos los motores y la batería, necesitamos diseño de chasis en fibra de carbono y maquinado del disco en acero templado.',
    file_name: 'boceto_combate_disco.pdf',
    file_url: '/uploads/boceto_combate.pdf',
    services: ['Diseño CAD completo', 'Corte en Fibra de Carbono 3mm', 'Maquinado CNC de Disco 4140', 'Ensamble de Potencia'],
    target_weight_g: 440,
    target_tournament: 'RoboGames 2026 Antweight',
    estimated_cost: 6400.00,
    status: 'revision_cad',
    telemetry_notes: 'Diseño CAD inicial enviado al cliente para aprobación de centro de gravedad y posición del switch de corte.'
  }
];

export const INITIAL_STATS = {
  lab_status: 'OPERACIONAL',
  tolerance: '±0.03mm',
  active_projects: 2,
  catalog_models: 7,
  orders_processed: 48,
  next_dispatch_hours: 24
};
