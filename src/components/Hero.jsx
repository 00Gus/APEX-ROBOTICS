import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ArrowRight, ShieldCheck, Cpu, Gauge, Zap, Compass, RefreshCw, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const CATEGORY_MODELS = [
  {
    id: 'sumo',
    name: 'MINI-SUMO 500G',
    subname: 'KATANA MK-IV AUTÓNOMO',
    color: '#FF5A1F',
    mass: '485 g',
    limit: '500 g max',
    dimensions: '9.8 x 9.8 x 4.2 cm',
    topSpeed: '1.85 m/s',
    torque: '2.4 Nm',
    sensors: '4x Láser ToF + 2x Ópticos',
    drivetrain: 'Dual Coreless 30:1 Planetario',
    armor: 'Pala Hardox 450 + Chasis 7075',
    tournament: 'All Japan Robot-Sumo / Nacionales',
    badge: '100% HOMOLOGADO'
  },
  {
    id: 'combate-1lb',
    name: 'COMBATE 1LB ANTWEIGHT',
    subname: 'VORTEX DRUM SPINNER',
    color: '#0284C7',
    mass: '445 g',
    limit: '454 g max',
    dimensions: '14.0 x 12.5 x 6.2 cm',
    topSpeed: '3.8 m/s',
    torque: '1.9 Nm (Arma: 22,000 RPM)',
    sensors: 'Fail-Safe RF + Telemetría',
    drivetrain: 'Tracción N20 HP + Tambor Brushless',
    armor: 'Titanio Grado 5 (3mm) + UHMWPE',
    tournament: 'SPARC / RoboGames International',
    badge: 'DESTRUCTIVE IMPACT'
  },
  {
    id: 'combate-3lb',
    name: 'COMBATE 3LB BEETLEWEIGHT',
    subname: 'RIPPER HORIZONTAL BAR',
    color: '#EAB308',
    mass: '1,320 g',
    limit: '1,361 g max',
    dimensions: '22.0 x 19.5 x 7.8 cm',
    topSpeed: '4.5 m/s',
    torque: '350 Joules de impacto en arma',
    sensors: 'Telemetría de corriente y temperatura',
    drivetrain: 'Outrunners Direct Drive Tracción',
    armor: 'Sándwich Fibra Carbono 4mm + AR400',
    tournament: 'RoboClash / SPARC Beetle',
    badge: 'HIGH KINETIC ENERGY'
  },
  {
    id: 'seguidor',
    name: 'SEGUIDOR DE LÍNEA VELOCISTA',
    subname: 'PHOTON TURBO V3 VACUUM',
    color: '#10B981',
    mass: '162 g',
    limit: 'Libre (Ultraligero)',
    dimensions: '23.5 x 16.0 x 4.8 cm',
    topSpeed: '4.85 m/s (Pico 6.2 m/s)',
    torque: 'Downforce: 650g succión',
    sensors: '16x Sensores QTR-HD ADC 16-bit',
    drivetrain: 'Dual Coreless 12V + EDF 30mm 48,000 RPM',
    armor: 'PCB Estructural ENIG + Carbono',
    tournament: 'RoboChallenge Europa & Nacionales',
    badge: 'AERODYNAMIC DOWNFORCE'
  },
  {
    id: 'laberinto',
    name: 'RESUELVE LABERINTOS',
    subname: 'CHRONO-S MICROMOUSE',
    color: '#A855F7',
    mass: '79 g',
    limit: 'Libre (< 200g)',
    dimensions: '8.2 x 7.4 x 3.6 cm',
    topSpeed: '3.4 m/s',
    torque: 'Resolución: 4096 CPR',
    sensors: '4x Micro-LIDAR ToF + IMU 6-Ejes',
    drivetrain: 'Micromotores con Encoders Magnéticos',
    armor: 'SLS Nylon PA12 + Carbono',
    tournament: 'IEEE Micromouse Standard',
    badge: 'AUTONOMOUS FLOOD-FILL'
  }
];

export default function Hero({ onExploreCatalog, onOpenCustomLab, onOpenExplodedView }) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_MODELS[0]);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const robotGroupRef = useRef(null);

  // Initialize and update Three.js 3D viewport with Studio Lighting & Rich Engineering Geometries
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(4.2, 3.2, 4.6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Grid Floor with dual contrast
    const gridHelper = new THREE.GridHelper(12, 24, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.7;
    scene.add(gridHelper);

    // Contact shadow beneath the robot
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
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
    const shadowTexture = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.69;
    scene.add(shadowMesh);

    // High-End Studio Lighting System (prevents dark pitch-black surfaces)
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 1.4);
    scene.add(ambientLight);

    // Key Light (Main white illumination from top-front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 9, 6);
    scene.add(keyLight);

    // Fill Light (Cool slate/cyan from left side)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-6, 4, 3);
    scene.add(fillLight);

    // Rim / Backlight (Industrial Safety Amber / Orange rim glow)
    const rimLight = new THREE.DirectionalLight(0xff6b00, 2.5);
    rimLight.position.set(-4, 6, -6);
    scene.add(rimLight);

    // Front Scoop Accent Light (Direct illumination on the blade and sensors)
    const frontAccent = new THREE.DirectionalLight(0xffedd5, 1.6);
    frontAccent.position.set(0, 1.5, 7);
    scene.add(frontAccent);

    // Robot group
    const robotGroup = new THREE.Group();
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    // Build procedural 3D model with rich components
    buildModelGeometry(robotGroup, selectedCategory.id, wireframeMode);

    // Mouse drag rotation & Zoom controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !robotGroup) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      robotGroup.rotation.y += deltaX * 0.008;
      robotGroup.rotation.x += deltaY * 0.008;
      // Clamp vertical tilt
      robotGroup.rotation.x = Math.max(-0.6, Math.min(0.8, robotGroup.rotation.x));
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

    // Render loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDragging && autoRotate && robotGroup) {
        robotGroup.rotation.y += 0.005;
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
  }, [selectedCategory, wireframeMode, autoRotate]);

  // Procedural Mechatronics 3D Geometry with High Contrast & Visual Fidelity
  function buildModelGeometry(group, categoryId, wireframe) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Material Library (Calibrated for studio lighting, no pitch-black surfaces)
    const matChassis7075 = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Crisp titanium / Duralumin 7075
      metalness: 0.65,
      roughness: 0.35,
      wireframe
    });

    const matCarbonFiber = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark carbon composite
      metalness: 0.3,
      roughness: 0.5,
      wireframe
    });

    const matHardoxOrange = new THREE.MeshStandardMaterial({
      color: 0xff5a1f, // Vivid industrial safety orange
      metalness: 0.5,
      roughness: 0.25,
      wireframe
    });

    const matHardoxSteel = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Tempered amber steel
      metalness: 0.75,
      roughness: 0.2,
      wireframe
    });

    const matAluminumRim = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Polished turned aluminum
      metalness: 0.85,
      roughness: 0.2,
      wireframe
    });

    const matSiliconeTire = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // High-grip vulcanized silicone
      roughness: 0.9,
      metalness: 0.05,
      wireframe
    });

    const matSensorLens = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Laser ToF red optical lens
      emissive: 0xdc2626,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      wireframe
    });

    const matGoldPin = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // ENIG gold / brass fasteners
      metalness: 0.9,
      roughness: 0.2,
      wireframe
    });

    const matPCBGreen = new THREE.MeshStandardMaterial({
      color: 0x047857, // Professional matte solder mask
      roughness: 0.45,
      metalness: 0.2,
      wireframe
    });

    // Helper: Hex corner screws
    const addCornerScrews = (parent, w, h, d, yPos) => {
      const screwGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6);
      const halfW = w / 2 - 0.12;
      const halfD = d / 2 - 0.12;
      [
        [-halfW, halfD],
        [halfW, halfD],
        [-halfW, -halfD],
        [halfW, -halfD]
      ].forEach(([x, z]) => {
        const s = new THREE.Mesh(screwGeo, matGoldPin);
        s.position.set(x, yPos, z);
        parent.add(s);
      });
    };

    // Helper: Turned wheels with aluminum rim + silicone tire
    const createCompetitionWheel = (radius, width) => {
      const wGroup = new THREE.Group();
      
      // Outer silicone tire
      const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, matSiliconeTire);
      wGroup.add(tire);

      // Inner aluminum hub
      const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 20);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, matAluminumRim);
      wGroup.add(rim);

      // Center locknut
      const nutGeo = new THREE.CylinderGeometry(0.08, 0.08, width + 0.06, 6);
      nutGeo.rotateZ(Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, matGoldPin);
      wGroup.add(nut);

      return wGroup;
    };

    if (categoryId === 'sumo') {
      // 1. MINI-SUMO KATANA MK-IV: Aggressive low profile wedge + Hardox scoop + ToF sensors
      const sumoGroup = new THREE.Group();
      group.add(sumoGroup);

      // Main CNC 7075 Milled Chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 1.8), matChassis7075);
      sumoGroup.add(chassis);

      // Top Carbon Fiber Deck Plate
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 1.7), matCarbonFiber);
      topPlate.position.y = 0.31;
      sumoGroup.add(topPlate);
      addCornerScrews(sumoGroup, 1.7, 0, 1.7, 0.35);

      // Front Hardox 450 Knife-Edge Wedge Blade
      const bladeWedge = new THREE.BufferGeometry();
      const bVertices = new Float32Array([
        // Top front edge to bottom razor edge
        -1.0, 0.25, 0.9,
         1.0, 0.25, 0.9,
         1.15, -0.27, 1.6,
        -1.0, 0.25, 0.9,
         1.15, -0.27, 1.6,
        -1.15, -0.27, 1.6,
      ]);
      bladeWedge.setAttribute('position', new THREE.BufferAttribute(bVertices, 3));
      bladeWedge.computeVertexNormals();
      const blade = new THREE.Mesh(bladeWedge, matHardoxOrange);
      blade.material.side = THREE.DoubleSide;
      sumoGroup.add(blade);

      // Sharpened razor-edge bevel in front
      const razorTip = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.02, 0.08), matHardoxSteel);
      razorTip.position.set(0, -0.27, 1.62);
      sumoGroup.add(razorTip);

      // Side Deflector Wings
      const deflL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.6), matHardoxOrange);
      deflL.position.set(-1.08, -0.05, 1.1);
      deflL.rotation.y = 0.2;
      const deflR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.6), matHardoxOrange);
      deflR.position.set(1.08, -0.05, 1.1);
      deflR.rotation.y = -0.2;
      sumoGroup.add(deflL);
      sumoGroup.add(deflR);

      // Dual High-Grip Wheels
      const wheelL = createCompetitionWheel(0.42, 0.26);
      wheelL.position.set(-1.05, -0.05, -0.15);
      const wheelR = createCompetitionWheel(0.42, 0.26);
      wheelR.position.set(1.05, -0.05, -0.15);
      sumoGroup.add(wheelL);
      sumoGroup.add(wheelR);

      // 4x Laser ToF Distance Sensors on front
      const sensorPositions = [-0.65, -0.25, 0.25, 0.65];
      sensorPositions.forEach((xPos, idx) => {
        const sBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), matCarbonFiber);
        sBox.position.set(xPos, 0.18, 0.95);
        sBox.rotation.y = idx === 0 ? 0.3 : idx === 3 ? -0.3 : 0;
        const sLens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 12), matSensorLens);
        sLens.rotation.x = Math.PI / 2;
        sLens.position.set(0, 0, 0.045);
        sBox.add(sLens);
        sumoGroup.add(sBox);
      });

      // Rear Power Kill-Switch and DIP bank
      const killSwitch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), matHardoxOrange);
      killSwitch.position.set(0.5, 0.38, -0.6);
      sumoGroup.add(killSwitch);

      const dipBank = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.15), matGoldPin);
      dipBank.position.set(-0.5, 0.34, -0.6);
      sumoGroup.add(dipBank);

    } else if (categoryId === 'combate-1lb') {
      // 2. COMBATE 1LB: Vortex Asymmetric Drum Spinner
      const combatGroup = new THREE.Group();
      group.add(combatGroup);

      // Sloped Titanium Wedge Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.7), matChassis7075);
      combatGroup.add(body);

      // Top UHMWPE Shock Armor
      const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.5), matCarbonFiber);
      topPlate.position.y = 0.28;
      combatGroup.add(topPlate);
      addCornerScrews(combatGroup, 1.6, 0, 1.5, 0.33);

      // Heavy Spinning Drum Weapon (Orange & Steel)
      const drumGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.3, 24);
      drumGeo.rotateZ(Math.PI / 2);
      const drum = new THREE.Mesh(drumGeo, matHardoxOrange);
      drum.position.set(0, 0.1, 1.05);
      combatGroup.add(drum);

      // Dual Hardened Striking Teeth
      const toothGeo = new THREE.BoxGeometry(0.28, 0.6, 0.22);
      const t1 = new THREE.Mesh(toothGeo, matHardoxSteel);
      t1.position.set(0.4, 0.1, 1.05);
      const t2 = new THREE.Mesh(toothGeo, matHardoxSteel);
      t2.position.set(-0.4, 0.1, 1.05);
      t2.rotation.x = Math.PI;
      combatGroup.add(t1);
      combatGroup.add(t2);

      // Belt Pulley and Motor Housing
      const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), matGoldPin);
      pulley.rotation.z = Math.PI / 2;
      pulley.position.set(0.75, 0.1, 1.05);
      combatGroup.add(pulley);

      // Armored Wheels
      const wL = createCompetitionWheel(0.44, 0.3);
      wL.position.set(-1.1, -0.05, -0.35);
      const wR = createCompetitionWheel(0.44, 0.3);
      wR.position.set(1.1, -0.05, -0.35);
      combatGroup.add(wL);
      combatGroup.add(wR);

      // Titanium Wheel Guards
      const guardL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.8), matChassis7075);
      guardL.position.set(-1.28, 0, -0.35);
      const guardR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.8), matChassis7075);
      guardR.position.set(1.28, 0, -0.35);
      combatGroup.add(guardL);
      combatGroup.add(guardR);

    } else if (categoryId === 'combate-3lb') {
      // 3. COMBATE 3LB: Ripper Horizontal Bar Spinner
      const beetleGroup = new THREE.Group();
      group.add(beetleGroup);

      // Triangular / Low Profile Armored Body
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 1.8), matCarbonFiber);
      beetleGroup.add(chassis);

      // AR400 Front Wedges
      const frontWedge = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.4), matHardoxOrange);
      frontWedge.position.set(0, -0.15, 0.95);
      beetleGroup.add(frontWedge);

      // Giant Brushless Outrunner Weapon Motor Mount
      const motorCan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 24), matChassis7075);
      motorCan.position.set(0, 0.4, 0.3);
      beetleGroup.add(motorCan);

      // Horizontal Bar Spinner 4140 Steel
      const barGeo = new THREE.BoxGeometry(2.8, 0.12, 0.45);
      const spinnerBar = new THREE.Mesh(barGeo, matHardoxOrange);
      spinnerBar.position.set(0, 0.6, 0.3);
      beetleGroup.add(spinnerBar);

      // Hardened Cutting Tips on the bar
      const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.47), matHardoxSteel);
      tipL.position.set(-1.3, 0.6, 0.3);
      const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.47), matHardoxSteel);
      tipR.position.set(1.3, 0.6, 0.3);
      beetleGroup.add(tipL);
      beetleGroup.add(tipR);

      // Wheels with protective armor
      const wL = createCompetitionWheel(0.48, 0.32);
      wL.position.set(-1.25, -0.05, -0.4);
      const wR = createCompetitionWheel(0.48, 0.32);
      wR.position.set(1.25, -0.05, -0.4);
      beetleGroup.add(wL);
      beetleGroup.add(wR);

    } else if (categoryId === 'seguidor') {
      // 4. SEGUIDOR DE LÍNEA: Photon Turbo V3 with Vacuum Turbine
      const lineGroup = new THREE.Group();
      group.add(lineGroup);

      // Long Matte PCB Chassis with ENIG Gold Border
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 2.8), matPCBGreen);
      lineGroup.add(pcb);

      // Carbon Fiber Stiffener Spars
      const sparL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 2.6), matCarbonFiber);
      sparL.position.set(-0.65, 0.06, 0);
      const sparR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 2.6), matCarbonFiber);
      sparR.position.set(0.65, 0.06, 0);
      lineGroup.add(sparL);
      lineGroup.add(sparR);

      // Front Curved 16-Sensor Bar Wing
      const sensorWing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.05, 0.35), matCarbonFiber);
      sensorWing.position.set(0, -0.01, 1.45);
      lineGroup.add(sensorWing);

      // 16 Micro IR Sensor Dots
      for (let i = -1.1; i <= 1.1; i += 0.15) {
        const ir = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.08), matSensorLens);
        ir.position.set(i, -0.04, 1.45);
        lineGroup.add(ir);
      }

      // Central 30mm EDF Vacuum Fan Turbine (Orange Shroud + Silver Rotor)
      const fanShroud = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.65, 24), matHardoxOrange);
      fanShroud.position.set(0, 0.35, -0.1);
      lineGroup.add(fanShroud);

      const fanBell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16), matAluminumRim);
      fanBell.position.set(0, 0.35, -0.1);
      lineGroup.add(fanBell);

      // Dual High-Speed Coreless Motors with Brass Pinions
      const motL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.75, 16), matChassis7075);
      motL.position.set(-0.55, 0.1, -0.9);
      const motR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.75, 16), matChassis7075);
      motR.position.set(0.55, 0.1, -0.9);
      lineGroup.add(motL);
      lineGroup.add(motR);

      // Ultra-light Turned Wheels
      const wL = createCompetitionWheel(0.38, 0.18);
      wL.position.set(-0.85, 0.02, -0.9);
      const wR = createCompetitionWheel(0.38, 0.18);
      wR.position.set(0.85, 0.02, -0.9);
      lineGroup.add(wL);
      lineGroup.add(wR);

      // Compact LiPo Battery in Center
      const lipo = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.6), matHardoxSteel);
      lipo.position.set(0, 0.15, 0.75);
      lineGroup.add(lipo);

    } else {
      // 5. MICROMOUSE: Chrono-S Autonomous Maze Solver
      const mouseGroup = new THREE.Group();
      group.add(mouseGroup);

      // Dual-Deck Stacked Chassis with Brass Standoffs
      const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 1.3), matCarbonFiber);
      lowerDeck.position.y = -0.05;
      mouseGroup.add(lowerDeck);

      const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 1.3), matPCBGreen);
      upperDeck.position.y = 0.35;
      mouseGroup.add(upperDeck);

      // 4 Brass Standoffs
      const standoffs = [
        [-0.55, -0.55],
        [0.55, -0.55],
        [-0.55, 0.55],
        [0.55, 0.55]
      ];
      standoffs.forEach(([sx, sz]) => {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), matGoldPin);
        pin.position.set(sx, 0.15, sz);
        mouseGroup.add(pin);
      });

      // 4 Angular LIDAR Towers (45 degrees forward and sideways)
      const angles = [
        { ang: Math.PI / 4, x: 0.5, z: 0.5 },
        { ang: -Math.PI / 4, x: -0.5, z: 0.5 },
        { ang: 0, x: 0, z: 0.65 },
        { ang: Math.PI / 2, x: 0.65, z: 0 },
        { ang: -Math.PI / 2, x: -0.65, z: 0 },
      ];
      angles.forEach((item) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12), matHardoxOrange);
        tower.position.set(item.x, 0.5, item.z);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), matSensorLens);
        eye.position.set(0, 0.12, 0);
        tower.add(eye);
        mouseGroup.add(tower);
      });

      // Main Microcontroller IC Chip
      const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.4), matCarbonFiber);
      mcu.position.set(0, 0.4, 0);
      mouseGroup.add(mcu);

      // Magnetic Encoder Wheels
      const wL = createCompetitionWheel(0.35, 0.14);
      wL.position.set(-0.75, 0, 0);
      const wR = createCompetitionWheel(0.35, 0.14);
      wR.position.set(0.75, 0, 0);
      mouseGroup.add(wL);
      mouseGroup.add(wR);
    }
  }

  const handleResetCamera = () => {
    if (!cameraRef.current || !robotGroupRef.current) return;
    cameraRef.current.position.set(4.2, 3.2, 4.6);
    cameraRef.current.fov = 42;
    cameraRef.current.updateProjectionMatrix();
    robotGroupRef.current.rotation.set(0, 0, 0);
  };

  const handleZoom = (delta) => {
    if (!cameraRef.current) return;
    const newFov = Math.max(25, Math.min(65, cameraRef.current.fov + delta));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 border-b border-steel-border bg-aerospace-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera del Hero */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-aerospace-800 border border-steel-border text-xs font-mono text-steel-muted mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-safety-orange"></span>
            INGENIERÍA MECATRÓNICA DE PRECISIÓN MILIMÉTRICA
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            ROBOTS DE COMPETICIÓN <br className="hidden sm:inline" />
            <span className="text-safety-orange">
              DISEÑADOS PARA EL PÓDIUM
            </span>
          </h1>
          <p className="text-steel-muted text-base sm:text-lg">
            Kits y robots listos para la arena (Sumo, Combate, Velocistas y Micromouse), o envíanos tu diseño/robot y nosotros maquinamos las piezas o lo armamos por ti.
          </p>

          {/* Selector de Categorías en el Hero (Scrollable en móvil para evitar saltos de línea molestos) */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar py-1 px-1 justify-start sm:justify-center">
            {CATEGORY_MODELS.map((cat) => {
              const isSelected = selectedCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-all border flex-shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-safety-orange text-white border-safety-orange font-bold shadow-sm'
                      : 'bg-aerospace-800 text-steel-light border-steel-border hover:border-steel-muted'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport Interactivo 3D + Instrumentación Técnica */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Panel Lateral Izquierdo: Ficha Técnica de Homologación */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-aerospace-800 border border-steel-border rounded-lg p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-steel-border pb-2">
                <span className="text-[11px] font-mono text-steel-muted uppercase">Homologación</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {selectedCategory.badge}
                </span>
              </div>

              <div>
                <p className="text-xs font-mono text-steel-muted">Categoría Oficial</p>
                <p className="text-sm font-bold text-white font-mono">{selectedCategory.name}</p>
                <p className="text-xs text-safety-orange font-mono font-medium">{selectedCategory.subname}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-steel-border/50">
                <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                  <span className="text-steel-muted block text-[10px]">Masa Oficial</span>
                  <span className="text-white font-bold">{selectedCategory.mass}</span>
                  <span className="text-[9px] text-steel-muted block">({selectedCategory.limit})</span>
                </div>
                <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                  <span className="text-steel-muted block text-[10px]">Dimensiones</span>
                  <span className="text-white font-bold">{selectedCategory.dimensions}</span>
                </div>
                <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                  <span className="text-steel-muted block text-[10px]">Velocidad Pico</span>
                  <span className="text-white font-bold">{selectedCategory.topSpeed}</span>
                </div>
                <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                  <span className="text-steel-muted block text-[10px]">Tracción/Par</span>
                  <span className="text-white font-bold">{selectedCategory.torque}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] font-mono text-steel-muted">
                <span className="text-steel-light font-semibold block mb-0.5">Torneo Compatible:</span>
                {selectedCategory.tournament}
              </div>
            </div>

            <div className="bg-aerospace-800 border border-steel-border rounded-lg p-3 text-xs font-mono text-steel-muted flex items-start gap-2 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Garantía de pase de báscula en inspección técnica previa a la arena.</span>
            </div>
          </div>

          {/* Centro: Escena 3D Interactiva */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[460px] bg-aerospace-800 rounded-xl border border-steel-border overflow-hidden shadow-xl">
              
              {/* Controles Superiores del Visor 3D */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono bg-aerospace-900 px-2.5 py-1 rounded text-steel-muted border border-steel-border flex items-center gap-1.5 shadow">
                  <Compass className="w-3 h-3 text-safety-orange" />
                  ARRASTRA PARA ROTAR EN 3D
                </span>
              </div>

              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                {/* Botón de Rotación Automática */}
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all flex items-center gap-1 shadow ${
                    autoRotate
                      ? 'bg-aerospace-900 text-emerald-400 border-emerald-500/40'
                      : 'bg-aerospace-900 text-steel-muted border-steel-border hover:text-white'
                  }`}
                  title="Activar/Desactivar rotación automática"
                >
                  <RotateCcw className={`w-3 h-3 ${autoRotate ? 'animate-spin-slow' : ''}`} />
                  <span>{autoRotate ? 'AUTO: ON' : 'AUTO: OFF'}</span>
                </button>

                {/* Botón Wireframe */}
                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`text-[10px] font-mono px-2 py-1 rounded border transition-all flex items-center gap-1 shadow ${
                    wireframeMode
                      ? 'bg-cobalt-500 text-white border-cobalt-400 font-bold'
                      : 'bg-aerospace-900 text-steel-muted border-steel-border hover:text-white'
                  }`}
                  title="Activar vista de malla técnica CAD"
                >
                  <Layers className="w-3 h-3" />
                  <span>{wireframeMode ? 'CAD WIRE' : 'SOLIDO'}</span>
                </button>
              </div>

              {/* Botones de Zoom flotantes a la izquierda */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-aerospace-900 p-1 rounded border border-steel-border shadow">
                <button
                  onClick={() => handleZoom(-6)}
                  className="p-1.5 text-steel-muted hover:text-white hover:bg-aerospace-800 rounded transition-colors"
                  title="Acercar modelo (o usa la rueda del ratón)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom(6)}
                  className="p-1.5 text-steel-muted hover:text-white hover:bg-aerospace-800 rounded transition-colors"
                  title="Alejar modelo"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetCamera}
                  className="p-1.5 text-steel-muted hover:text-safety-orange hover:bg-aerospace-800 rounded transition-colors border-t border-steel-border/50"
                  title="Restablecer posición de cámara"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Contenedor Three.js */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Botón flotante para ver despiece completo de este modelo */}
              <div className="absolute bottom-3 right-3 z-10">
                <button
                  onClick={() => onOpenExplodedView(selectedCategory.id)}
                  className="text-xs font-mono bg-aerospace-900 hover:bg-aerospace-800 text-steel-light hover:text-white border border-steel-border px-3 py-1.5 rounded flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-safety-orange" />
                  <span>Ver Despiece por Capas</span>
                </button>
              </div>

              {/* Indicador de ayuda táctil/zoom en la esquina inferior izquierda */}
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-steel-muted pointer-events-none bg-aerospace-900 px-2 py-0.5 rounded border border-steel-border/40">
                Girar: Arrastra | Zoom: Rueda/Pellizco
              </div>
            </div>
          </div>

          {/* Panel Lateral Derecho: Configuración & Opciones de Adquisición */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-aerospace-800 border border-steel-border rounded-lg p-4 space-y-4 shadow-md">
              <span className="text-[11px] font-mono text-steel-muted uppercase block border-b border-steel-border pb-2">
                Arquitectura de Construcción
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-steel-muted text-[10px] block">Blindaje / Chasis</span>
                  <span className="text-steel-light font-semibold">{selectedCategory.armor}</span>
                </div>
                <div>
                  <span className="text-steel-muted text-[10px] block">Tren Motriz</span>
                  <span className="text-steel-light font-semibold">{selectedCategory.drivetrain}</span>
                </div>
                <div>
                  <span className="text-steel-muted text-[10px] block">Sistema de Sensores</span>
                  <span className="text-steel-light font-semibold">{selectedCategory.sensors}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-steel-border space-y-2">
                <button
                  onClick={onExploreCatalog}
                  className="w-full py-2.5 px-4 rounded bg-safety-orange hover:bg-safety-orangeHover text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow transition-all"
                >
                  <span>Ver Modelos & Kits Listos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenCustomLab}
                  className="w-full py-2.5 px-4 rounded bg-aerospace-900 hover:bg-aerospace-700 text-steel-light hover:text-white border border-steel-border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Tengo mi propio diseño CAD</span>
                </button>
              </div>
            </div>

            <div className="bg-aerospace-800 border border-steel-border rounded p-3 text-[11px] font-mono text-steel-muted flex items-center justify-between shadow-sm">
              <span>MECANIZADO CNC DISPONIBLE</span>
              <span className="text-steel-light font-bold">ALU 7075 / HARDOX</span>
            </div>
          </div>

        </div>

        {/* Barra Inferior de Métricas de Confianza (Social Proof Técnico) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-steel-border pt-8">
          <div className="bg-aerospace-800 p-3 sm:p-4 rounded border border-steel-border text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white block">±0.03mm</span>
            <span className="text-[11px] font-mono text-steel-muted">Tolerancia CNC</span>
          </div>
          <div className="bg-aerospace-800 p-3 sm:p-4 rounded border border-steel-border text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white block">100%</span>
            <span className="text-[11px] font-mono text-steel-muted">Homologación de Báscula</span>
          </div>
          <div className="bg-aerospace-800 p-3 sm:p-4 rounded border border-steel-border text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white block">48 Horas</span>
            <span className="text-[11px] font-mono text-steel-muted">Despacho de Refacciones</span>
          </div>
          <div className="bg-aerospace-800 p-3 sm:p-4 rounded border border-steel-border text-center shadow-sm">
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-white block">B2B / PDF</span>
            <span className="text-[11px] font-mono text-steel-muted">Cotización Formal</span>
          </div>
        </div>

      </div>
    </section>
  );
}
