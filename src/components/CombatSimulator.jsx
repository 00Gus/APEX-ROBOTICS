import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Swords, Flame, Play, RotateCcw, Sliders, Shield, Zap, CheckCircle2, AlertTriangle, ArrowRight, Crosshair, Wrench, Eye, Camera, RefreshCw } from 'lucide-react';

const WEAPON_PRESETS = [
  {
    id: 'drum',
    name: 'Tambor Vertical Asimétrico Hardox',
    category: 'Vertical Drum Spinner',
    defaultRpm: 22000,
    mass_g: 135,
    radius_cm: 3.8,
    inertiaFactor: 0.5,
    tipSpeedLimit_kmh: 400,
    description: 'Arma de tambor cilíndrico asimétrico en Hardox 500. Diseñado para morder la armadura del oponente y proyectarlo verticalmente hacia el techo de la arena.',
    effectType: 'vertical_launch',
    color: '#FF5A1F'
  },
  {
    id: 'bar',
    name: 'Barra Horizontal de Acero 4140',
    category: 'Horizontal Bar Spinner',
    defaultRpm: 18000,
    mass_g: 220,
    radius_cm: 6.5,
    inertiaFactor: 0.33,
    tipSpeedLimit_kmh: 400,
    description: 'Barra de choque de acero pre-endurecido 4140. Acumula una inercia cinética colosal capaz de desgarrar paneles de blindaje y expulsar al rival contra las paredes.',
    effectType: 'lateral_blast',
    color: '#EAB308'
  },
  {
    id: 'disc',
    name: 'Disco Vertical de Titanio Grado 5',
    category: 'Single Tooth Vertical Disc',
    defaultRpm: 24000,
    mass_g: 110,
    radius_cm: 4.5,
    inertiaFactor: 0.5,
    tipSpeedLimit_kmh: 400,
    description: 'Disco aligerado con diente único de contacto. Maximiza la mordida por revolución con una velocidad de punta cercana al límite oficial reglamentario.',
    effectType: 'vertical_launch',
    color: '#0284C7'
  },
  {
    id: 'hammer',
    name: 'Hacha / Martillo Neumático Superior',
    category: 'Pneumatic Overhead Axe',
    defaultRpm: 0,
    mass_g: 180,
    radius_cm: 7.0,
    inertiaFactor: 1.0,
    tipSpeedLimit_kmh: 250,
    description: 'Brazo articulado accionado por pistón neumático a 150 PSI. Asesta golpes descendentes directos sobre las baterías y la electrónica del oponente.',
    effectType: 'overhead_crush',
    color: '#EC4899'
  },
  {
    id: 'flipper',
    name: 'Pala Levantadora Hidroneumática (Flipper)',
    category: 'Pneumatic Flipper',
    defaultRpm: 0,
    mass_g: 160,
    radius_cm: 8.0,
    inertiaFactor: 1.0,
    tipSpeedLimit_kmh: 150,
    description: 'Cuña de elevación rápida con cilindro neumático. Lanza al robot enemigo a más de 2 metros de altura para voltearlo o dejarlo fuera de combate.',
    effectType: 'flip_over',
    color: '#10B981'
  }
];

export default function CombatSimulator({ onOpenCustomLab }) {
  const [selectedWeapon, setSelectedWeapon] = useState(WEAPON_PRESETS[0]);
  const [rpm, setRpm] = useState(selectedWeapon.defaultRpm);
  const [weaponMass, setWeaponMass] = useState(selectedWeapon.mass_g);
  const [dummyArmor, setDummyArmor] = useState('alu6061');
  const [isSpinning, setIsSpinning] = useState(false);
  const [dummyDamage, setDummyDamage] = useState(0);
  const [strikeActive, setStrikeActive] = useState(false);
  const [impactCount, setImpactCount] = useState(0);
  const [cameraView, setCameraView] = useState('action'); // 'action', 'top', 'cinematic'

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // 3D Objects refs
  const robotARef = useRef(null);
  const weaponMeshRef = useRef(null);
  const robotBRef = useRef(null);
  const sparksRef = useRef(null);
  const debrisRef = useRef([]);
  const impactLightRef = useRef(null);

  // Physics calculation
  const radius_m = selectedWeapon.radius_cm / 100;
  const mass_kg = weaponMass / 1000;
  const effectiveRpm = selectedWeapon.defaultRpm === 0 ? 12000 : rpm;
  const omega = (effectiveRpm * 2 * Math.PI) / 60;
  const momentOfInertia = selectedWeapon.inertiaFactor * mass_kg * (radius_m * radius_m);
  const kineticJoules = 0.5 * momentOfInertia * (omega * omega);
  const tipSpeed_ms = omega * radius_m;
  const tipSpeed_kmh = tipSpeed_ms * 3.6;

  // Sync state when weapon changes
  useEffect(() => {
    setRpm(selectedWeapon.defaultRpm);
    setWeaponMass(selectedWeapon.mass_g);
    setIsSpinning(false);
  }, [selectedWeapon]);

  // Main Three.js Realistic Arena Construction
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 4.8, 8.2);
    camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // REALISTIC ARENA FLOOR WITH STEEL PLATES & HAZARD STRIPES
    // -------------------------------------------------------------
    const arenaWidth = 11;
    const arenaDepth = 8.5;

    // Procedural Steel Plate Texture with Chevrons and Center Ring
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 768;
    const fCtx = floorCanvas.getContext('2d');

    // Dark brushed steel background
    fCtx.fillStyle = '#161d27';
    fCtx.fillRect(0, 0, 1024, 768);

    // Subtle plate weld seams
    fCtx.strokeStyle = '#232d3d';
    fCtx.lineWidth = 3;
    for (let x = 0; x <= 1024; x += 128) {
      fCtx.beginPath();
      fCtx.moveTo(x, 0);
      fCtx.lineTo(x, 768);
      fCtx.stroke();
    }
    for (let y = 0; y <= 768; y += 128) {
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(1024, y);
      fCtx.stroke();
    }

    // Yellow/Black Hazard Stripes along perimeter
    const stripeWidth = 24;
    fCtx.save();
    fCtx.beginPath();
    fCtx.rect(20, 20, 984, 728);
    fCtx.lineWidth = 18;
    fCtx.strokeStyle = '#d97706';
    fCtx.stroke();
    fCtx.restore();

    // Center Combat Ring Markings
    fCtx.strokeStyle = '#0284c7';
    fCtx.lineWidth = 5;
    fCtx.beginPath();
    fCtx.arc(512, 384, 180, 0, Math.PI * 2);
    fCtx.stroke();

    fCtx.strokeStyle = '#ff5a1f';
    fCtx.lineWidth = 3;
    fCtx.beginPath();
    fCtx.arc(512, 384, 60, 0, Math.PI * 2);
    fCtx.stroke();

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    const arenaMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.45,
      metalness: 0.65
    });
    const arenaFloor = new THREE.Mesh(new THREE.BoxGeometry(arenaWidth, 0.3, arenaDepth), arenaMat);
    arenaFloor.position.y = -0.15;
    scene.add(arenaFloor);

    // Reinforced Steel Arena Curbing Border
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const curbFront = new THREE.Mesh(new THREE.BoxGeometry(arenaWidth + 0.2, 0.4, 0.25), curbMat);
    curbFront.position.set(0, 0.05, arenaDepth / 2);
    const curbBack = new THREE.Mesh(new THREE.BoxGeometry(arenaWidth + 0.2, 0.4, 0.25), curbMat);
    curbBack.position.set(0, 0.05, -arenaDepth / 2);
    scene.add(curbFront);
    scene.add(curbBack);

    // Polycarbonate Safety Arena Blast Enclosure (Back & Sides)
    const polyMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.9
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(arenaWidth, 3.2, 0.08), polyMat);
    backWall.position.set(0, 1.6, -arenaDepth / 2);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, arenaDepth), polyMat);
    leftWall.position.set(-arenaWidth / 2, 1.6, 0);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, arenaDepth), polyMat);
    rightWall.position.set(arenaWidth / 2, 1.6, 0);
    scene.add(leftWall);
    scene.add(rightWall);

    // Heavy Steel Corner Support Pillars with Warning Chevrons
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
    [
      [-arenaWidth / 2, -arenaDepth / 2],
      [arenaWidth / 2, -arenaDepth / 2],
      [-arenaWidth / 2, arenaDepth / 2],
      [arenaWidth / 2, arenaDepth / 2]
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.4, 16), postMat);
      post.position.set(px, 1.7, pz);
      scene.add(post);
    });

    // -------------------------------------------------------------
    // STADIUM BATTLE LIGHTING (Overhead Spots + Rim Warmth)
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // 4 Corner Arena Spotlights (Cross-illumination)
    const spot1 = new THREE.SpotLight(0xffffff, 3.5, 25, Math.PI / 4, 0.3);
    spot1.position.set(-5, 9, 4);
    scene.add(spot1);

    const spot2 = new THREE.SpotLight(0xffedd5, 3.0, 25, Math.PI / 4, 0.3);
    spot2.position.set(5, 9, -4);
    scene.add(spot2);

    const rimLight = new THREE.DirectionalLight(0xff5a1f, 2.5);
    rimLight.position.set(-4, 6, -6);
    scene.add(rimLight);

    // Flash light for impact moment
    const impactPointLight = new THREE.PointLight(0xffffff, 0, 10);
    impactPointLight.position.set(0.6, 0.5, 0);
    scene.add(impactPointLight);
    impactLightRef.current = impactPointLight;

    // -------------------------------------------------------------
    // ROBOT A (ATTACKER: Highly-Detailed Combat Machine)
    // -------------------------------------------------------------
    const robotA = new THREE.Group();
    robotA.position.set(-2.0, 0.28, 0);
    scene.add(robotA);
    robotARef.current = robotA;

    // Materials
    const matChassis = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const matCarbon = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.45 });
    const matHardox = new THREE.MeshStandardMaterial({ color: 0xff5a1f, metalness: 0.65, roughness: 0.2 });
    const matSteelGround = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
    const matTire = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const matAluRim = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 });
    const matLedGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9 });

    // Multi-faceted Wedge Chassis
    const chassisGeo = new THREE.BoxGeometry(1.8, 0.5, 1.5);
    const bodyA = new THREE.Mesh(chassisGeo, matChassis);
    robotA.add(bodyA);

    // Top Armor Plate with Rivets
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.3), matCarbon);
    topPlate.position.y = 0.28;
    robotA.add(topPlate);

    // Front Angled Deflector Wedges
    const wedgeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.4), matHardox);
    wedgeL.position.set(0.85, -0.05, 0.65);
    wedgeL.rotation.y = -0.3;
    const wedgeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.4), matHardox);
    wedgeR.position.set(0.85, -0.05, -0.65);
    wedgeR.rotation.y = 0.3;
    robotA.add(wedgeL);
    robotA.add(wedgeR);

    // Weapon Mount Bearing Blocks (Pillow blocks with screws)
    const bBlockL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.2), matChassis);
    bBlockL.position.set(0.85, 0.12, 0.5);
    const bBlockR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.2), matChassis);
    bBlockR.position.set(0.85, 0.12, -0.5);
    robotA.add(bBlockL);
    robotA.add(bBlockR);

    // Active Status Indicator LED
    const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), matLedGreen);
    statusLed.position.set(-0.6, 0.33, 0.45);
    robotA.add(statusLed);

    // Armored Wheels for Robot A with Aluminum Rims
    [-0.85, 0.85].forEach(z => {
      const wGroup = new THREE.Group();
      wGroup.position.set(-0.4, -0.02, z);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 20), matTire);
      tire.rotateZ(Math.PI / 2);
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.26, 16), matAluRim);
      rim.rotateZ(Math.PI / 2);
      wGroup.add(rim);

      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 6), matGold);
      nut.rotateZ(Math.PI / 2);
      wGroup.add(nut);

      // Wheel Armor Guard
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.08), matChassis);
      guard.position.set(0, 0, (z > 0 ? 0.16 : -0.16));
      wGroup.add(guard);

      robotA.add(wGroup);
    });

    // Weapon Assembly Group
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.95, 0.12, 0);
    robotA.add(weaponGroup);
    weaponMeshRef.current = weaponGroup;

    buildDetailedWeapon(weaponGroup, selectedWeapon.id, matHardox, matSteelGround, matGold, matChassis);

    // -------------------------------------------------------------
    // ROBOT B (AUTHENTIC TARGET TEST DUMMY WITH ARMOR DAMAGE)
    // -------------------------------------------------------------
    const robotB = new THREE.Group();
    robotB.position.set(1.8, 0.28, 0);
    scene.add(robotB);
    robotBRef.current = robotB;

    // Dummy Chassis Body
    const matDummyBase = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const dummyBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.5), matDummyBase);
    robotB.add(dummyBody);

    // Replaceable Top Armor Plate with Hazard Screws
    const dummyTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.3), matChassis);
    dummyTop.position.y = 0.28;
    robotB.add(dummyTop);

    // Front High-Contrast Target Plate with Bullseye Decal
    const targetFace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 1.2), matSteelGround);
    targetFace.position.set(-0.81, 0.02, 0);
    robotB.add(targetFace);

    const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.09, 20), matHardox);
    bullseye.rotateZ(Math.PI / 2);
    bullseye.position.set(-0.82, 0.02, 0);
    robotB.add(bullseye);

    // Dummy Wheels
    [-0.85, 0.85].forEach(z => {
      const dw = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16), matTire);
      dw.rotateZ(Math.PI / 2);
      dw.position.set(0.3, -0.02, z);
      robotB.add(dw);
    });

    // -------------------------------------------------------------
    // EXPANDED SPARK & FLYING DEBRIS SYSTEM
    // -------------------------------------------------------------
    const sparkCount = 90;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -10;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3(0, 0, 0));
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffedd5,
      size: 0.15,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const sparkSystem = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkSystem);
    sparksRef.current = { system: sparkSystem, velocities: sparkVelocities, life: 0 };

    // Flying metal debris shards
    const debrisList = [];
    const shardGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    const shardMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const shard = new THREE.Mesh(shardGeo, shardMat);
      shard.position.set(0, -10, 0);
      scene.add(shard);
      debrisList.push({ mesh: shard, vel: new THREE.Vector3(0, 0, 0), rot: new THREE.Vector3(0, 0, 0), life: 0 });
    }
    debrisRef.current = debrisList;

    // Interactive mouse drag rotation
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !sceneRef.current) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      
      // Orbit camera around arena center
      const rotSpeed = 0.006;
      const r = Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z);
      let theta = Math.atan2(camera.position.x, camera.position.z) - deltaX * rotSpeed;
      camera.position.x = r * Math.sin(theta);
      camera.position.z = r * Math.cos(theta);
      camera.position.y = Math.max(1.8, Math.min(8.5, camera.position.y + deltaY * 0.015));
      camera.lookAt(0, 0.4, 0);

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoom = e.deltaY * 0.003;
      camera.fov = Math.max(20, Math.min(65, camera.fov + zoom * 8));
      camera.updateProjectionMatrix();
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Main Render Loop
    let reqId;
    let weaponRotAngle = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Weapon Rotation
      if (weaponMeshRef.current && isSpinning) {
        const spinSpeed = (effectiveRpm / 60) * 0.08;
        weaponRotAngle += spinSpeed;

        if (selectedWeapon.id === 'drum' || selectedWeapon.id === 'disc') {
          weaponMeshRef.current.rotation.z = -weaponRotAngle;
        } else if (selectedWeapon.id === 'bar') {
          weaponMeshRef.current.rotation.y = weaponRotAngle;
        } else if (selectedWeapon.id === 'hammer') {
          weaponMeshRef.current.rotation.z = Math.sin(weaponRotAngle * 0.4) * 0.4;
        }
      }

      // Update Sparks
      const sparks = sparksRef.current;
      if (sparks && sparks.life > 0) {
        sparks.life -= 0.035;
        const posAttr = sparks.system.geometry.attributes.position;
        for (let i = 0; i < sparkCount; i++) {
          posAttr.array[i * 3] += sparks.velocities[i].x;
          posAttr.array[i * 3 + 1] += sparks.velocities[i].y;
          posAttr.array[i * 3 + 2] += sparks.velocities[i].z;
          sparks.velocities[i].y -= 0.018; // Gravity
        }
        posAttr.needsUpdate = true;
        sparks.system.material.opacity = Math.max(0, sparks.life);
      }

      // Update Debris Shards
      const debris = debrisRef.current;
      debris.forEach((sh) => {
        if (sh.life > 0) {
          sh.life -= 0.03;
          sh.mesh.position.add(sh.vel);
          sh.mesh.rotation.x += sh.rot.x;
          sh.mesh.rotation.y += sh.rot.y;
          sh.vel.y -= 0.015;
          if (sh.mesh.position.y < 0.05) {
            sh.mesh.position.y = 0.05;
            sh.vel.set(0, 0, 0);
          }
        }
      });

      // Impact Light Fade
      if (impactLightRef.current && impactLightRef.current.intensity > 0) {
        impactLightRef.current.intensity = Math.max(0, impactLightRef.current.intensity - 0.4);
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
  }, [selectedWeapon, isSpinning]);

  // Construct Realistic Weapon Assemblies
  function buildDetailedWeapon(group, weaponId, matHardox, matGroundTip, matGold, matChassis) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (weaponId === 'drum') {
      // Machined Hardox Drum with dual tool-steel teeth & timing belt pulley
      const drumGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.0, 24);
      drumGeo.rotateX(Math.PI / 2);
      const drum = new THREE.Mesh(drumGeo, matHardox);
      group.add(drum);

      // Dual Hardened Striking Teeth
      const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.22), matGroundTip);
      t1.position.set(0, 0, 0.32);
      const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.62, 0.22), matGroundTip);
      t2.position.set(0, 0, -0.32);
      t2.rotation.x = Math.PI;
      group.add(t1);
      group.add(t2);

      // Timing Belt Pulley
      const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 16), matGold);
      pulley.rotateX(Math.PI / 2);
      pulley.position.set(0, 0, 0.6);
      group.add(pulley);

    } else if (weaponId === 'bar') {
      // Horizontal 4140 Steel Bar with center hub and cutting bevels
      const barGeo = new THREE.BoxGeometry(0.32, 0.14, 2.4);
      const bar = new THREE.Mesh(barGeo, matHardox);
      group.add(bar);

      const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.35), matGroundTip);
      tipL.position.set(0, 0, 1.15);
      const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.35), matGroundTip);
      tipR.position.set(0, 0, -1.15);
      group.add(tipL);
      group.add(tipR);

      // Central Hub with 4 mounting bolts
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.28, 16), matGold);
      group.add(hub);

    } else if (weaponId === 'disc') {
      // Vertical Titanium Disc with lightening cutouts
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.14, 28), matHardox);
      disc.rotateX(Math.PI / 2);
      group.add(disc);

      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.16), matGroundTip);
      tooth.position.set(0, 0.32, 0);
      group.add(tooth);

      const centerNut = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 6), matGold);
      centerNut.rotateX(Math.PI / 2);
      group.add(centerNut);

    } else if (weaponId === 'hammer') {
      // Overhead Pneumatic Hammer
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), matGold);
      arm.position.set(0, 0.65, 0);
      group.add(arm);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.3), matGroundTip);
      head.position.set(0, 1.3, 0);
      group.add(head);

      const pick = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 16), matHardox);
      pick.rotation.x = -Math.PI / 2;
      pick.position.set(0, 1.3, 0.3);
      group.add(pick);

    } else {
      // Flipper Scoop
      const flipperGeo = new THREE.BufferGeometry();
      const sVerts = new Float32Array([
        0, 0, -0.65,
        0, 0, 0.65,
        1.2, 0.42, 0.55,
        0, 0, -0.65,
        1.2, 0.42, 0.55,
        1.2, 0.42, -0.55
      ]);
      flipperGeo.setAttribute('position', new THREE.BufferAttribute(sVerts, 3));
      flipperGeo.computeVertexNormals();
      const flipper = new THREE.Mesh(flipperGeo, matHardox);
      flipper.material.side = THREE.DoubleSide;
      group.add(flipper);
    }
  }

  // TRIGGER REALISTIC STRIKE
  const handleExecuteStrike = () => {
    if (strikeActive) return;
    setStrikeActive(true);
    setImpactCount(prev => prev + 1);

    const robotA = robotARef.current;
    const robotB = robotBRef.current;
    const camera = cameraRef.current;

    if (!robotA || !robotB) return;

    // 1. Robot A rushes forward
    const startXA = -2.0;
    const targetXA = -0.5;

    let step = 0;
    const rushInterval = setInterval(() => {
      step += 0.16;
      robotA.position.x = THREE.MathUtils.lerp(startXA, targetXA, Math.min(1, step));

      if (step >= 1) {
        clearInterval(rushInterval);

        // 2. MOMENT OF IMPACT!
        triggerSparksAndDebris();
        applyCameraShake(camera);
        applyOpponentPhysicsReaction(robotB, selectedWeapon.effectType);

        // Flash arena impact light
        if (impactLightRef.current) {
          impactLightRef.current.intensity = 6.0;
        }

        // Damage formula
        const damagePercent = Math.min(100, Math.round(kineticJoules / 4.2));
        setDummyDamage(prev => Math.min(100, prev + damagePercent));

        // 3. Robot A recoils backward
        setTimeout(() => {
          let recoilStep = 0;
          const recoilInterval = setInterval(() => {
            recoilStep += 0.12;
            robotA.position.x = THREE.MathUtils.lerp(targetXA, startXA, Math.min(1, recoilStep));
            if (recoilStep >= 1) {
              clearInterval(recoilInterval);
              setStrikeActive(false);
            }
          }, 20);
        }, 400);
      }
    }, 20);
  };

  const triggerSparksAndDebris = () => {
    // 90 Sparks
    const sparks = sparksRef.current;
    if (sparks) {
      sparks.life = 1.0;
      const posAttr = sparks.system.geometry.attributes.position;
      for (let i = 0; i < 90; i++) {
        posAttr.array[i * 3] = 0.55;
        posAttr.array[i * 3 + 1] = 0.38;
        posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

        sparks.velocities[i].set(
          (Math.random() - 0.3) * 0.32,
          Math.random() * 0.35 + 0.12,
          (Math.random() - 0.5) * 0.35
        );
      }
      posAttr.needsUpdate = true;
    }

    // Flying metal debris shards
    const debris = debrisRef.current;
    debris.forEach((sh) => {
      sh.life = 1.0;
      sh.mesh.position.set(0.55, 0.35, (Math.random() - 0.5) * 0.3);
      sh.vel.set(
        Math.random() * 0.25 + 0.1,
        Math.random() * 0.25 + 0.15,
        (Math.random() - 0.5) * 0.25
      );
      sh.rot.set(Math.random() * 0.3, Math.random() * 0.3, 0);
    });
  };

  const applyCameraShake = (camera) => {
    if (!camera) return;
    const origPos = camera.position.clone();
    let shakeCount = 0;

    const shakeInterval = setInterval(() => {
      shakeCount++;
      camera.position.x = origPos.x + (Math.random() - 0.5) * 0.3;
      camera.position.y = origPos.y + (Math.random() - 0.5) * 0.2;

      if (shakeCount > 10) {
        clearInterval(shakeInterval);
        camera.position.copy(origPos);
      }
    }, 25);
  };

  const applyOpponentPhysicsReaction = (robotB, effectType) => {
    let t = 0;
    const startX = 1.8;
    const startY = 0.28;

    if (effectType === 'vertical_launch') {
      // Catapulted 2.5 meters high with violent backflip
      const launchInterval = setInterval(() => {
        t += 0.07;
        robotB.position.x = startX + t * 1.2;
        robotB.position.y = startY + Math.sin(t * Math.PI) * 2.6;
        robotB.rotation.z = -t * Math.PI * 2;

        if (t >= 1) {
          clearInterval(launchInterval);
          robotB.position.set(startX + 1.2, startY, 0);
          robotB.rotation.set(0, 0, 0);
        }
      }, 25);

    } else if (effectType === 'lateral_blast') {
      // Blasted sideways into arena wall
      const blastInterval = setInterval(() => {
        t += 0.08;
        robotB.position.x = startX + t * 2.2;
        robotB.position.z = Math.sin(t * Math.PI) * 1.8;
        robotB.rotation.y = t * Math.PI * 4;

        if (t >= 1) {
          clearInterval(blastInterval);
          robotB.position.set(startX + 2.0, startY, 0.6);
          robotB.rotation.set(0, 0.6, 0);
        }
      }, 25);

    } else if (effectType === 'overhead_crush') {
      // Crushed downward with heavy impact dent
      robotB.scale.y = 0.55;
      setTimeout(() => {
        robotB.scale.y = 1.0;
      }, 550);

    } else {
      // Flipped upside down
      const flipInterval = setInterval(() => {
        t += 0.09;
        robotB.position.y = startY + Math.sin(t * Math.PI) * 1.8;
        robotB.rotation.z = -t * Math.PI;

        if (t >= 1) {
          clearInterval(flipInterval);
          robotB.position.set(startX + 0.8, startY, 0);
          robotB.rotation.set(0, 0, Math.PI);
        }
      }, 25);
    }
  };

  const handleResetDummy = () => {
    setDummyDamage(0);
    setImpactCount(0);
    if (robotBRef.current) {
      robotBRef.current.position.set(1.8, 0.28, 0);
      robotBRef.current.rotation.set(0, 0, 0);
      robotBRef.current.scale.set(1, 1, 1);
    }
  };

  const setCameraPreset = (preset) => {
    setCameraView(preset);
    if (!cameraRef.current) return;
    if (preset === 'action') {
      cameraRef.current.position.set(0, 4.8, 8.2);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0, 10.5, 0.1);
    } else if (preset === 'cinematic') {
      cameraRef.current.position.set(-3.5, 2.2, 5.0);
    }
    cameraRef.current.fov = 40;
    cameraRef.current.updateProjectionMatrix();
    cameraRef.current.lookAt(0, 0.4, 0);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* Header */}
      <div className="border-b border-steel-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-safety-orange/10 border border-safety-orange/30 text-safety-orange text-xs font-semibold mb-2">
            <Swords className="w-3.5 h-3.5" />
            SIMULADOR CINÉTICO DE IMPACTO // ARENA DE COMBATE REAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ARMERÍA DE COMBATE & BANCO DE PRUEBAS 3D
          </h2>
          <p className="text-xs text-steel-muted mt-1 max-w-2xl leading-relaxed">
            Personaliza el tren de ataque de tu robot, modula la masa y las RPM de impacto, y simula en tiempo real la colisión destructiva contra un robot objetivo de prueba.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleResetDummy}
            className="px-3 py-2 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light border border-steel-border text-xs flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-safety-orange" />
            <span>Restablecer Dummy</span>
          </button>
        </div>
      </div>

      {/* Grid: Arena 3D a la izquierda, Controles de Armería a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Viewport 3D de la Arena (7 columnas) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full h-[340px] sm:h-[460px] lg:h-[500px] bg-aerospace-900 rounded-xl border border-steel-border overflow-hidden shadow-xl">
            
            {/* HUD Superior de Estado de Combate */}
            <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between text-[11px] sm:text-xs bg-aerospace-900 p-2 sm:p-2.5 rounded-lg border border-steel-border shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${isSpinning ? 'bg-safety-orange animate-ping' : 'bg-emerald-400'}`}></span>
                <span className="text-white font-bold hidden xs:inline">ROBOT A:</span>
                <span className="text-safety-orange font-semibold truncate text-[10px] sm:text-xs">{selectedWeapon.name}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span className="text-steel-muted text-[10px] sm:text-xs hidden sm:inline">DUMMY B:</span>
                <div className="w-16 sm:w-24 bg-aerospace-800 h-2 sm:h-2.5 rounded border border-steel-border overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      dummyDamage > 70 ? 'bg-rose-500' : dummyDamage > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(0, 100 - dummyDamage)}%` }}
                  ></div>
                </div>
                <span className="font-bold text-white text-[10px] sm:text-[11px]">{Math.max(0, 100 - dummyDamage)}% HP</span>
              </div>
            </div>

            {/* Selector de Ángulos de Cámara */}
            <div className="absolute top-14 sm:top-16 left-2 sm:left-3 z-10 flex flex-col gap-1 bg-aerospace-900 p-1 rounded-lg border border-steel-border shadow">
              <button
                onClick={() => setCameraPreset('action')}
                className={`p-1.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                  cameraView === 'action' ? 'bg-safety-orange text-white font-bold' : 'text-steel-muted hover:text-white'
                }`}
                title="Vista de Acción Frontal"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Acción</span>
              </button>
              <button
                onClick={() => setCameraPreset('top')}
                className={`p-1.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                  cameraView === 'top' ? 'bg-safety-orange text-white font-bold' : 'text-steel-muted hover:text-white'
                }`}
                title="Vista Cenital / Aérea"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cenital</span>
              </button>
              <button
                onClick={() => setCameraPreset('cinematic')}
                className={`p-1.5 rounded text-[10px] flex items-center gap-1 transition-colors ${
                  cameraView === 'cinematic' ? 'bg-safety-orange text-white font-bold' : 'text-steel-muted hover:text-white'
                }`}
                title="Cámara Lateral Dinámica"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lateral</span>
              </button>
            </div>

            {/* Canvas Three.js */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Barra de Acciones de Prueba en la Arena */}
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-10 flex items-center justify-between gap-2 bg-aerospace-900 p-2 sm:p-2.5 rounded-lg border border-steel-border shadow-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSpinning(!isSpinning)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSpinning
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-titanium-800 text-steel-light border-steel-border hover:border-steel-muted'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isSpinning ? 'text-emerald-400 animate-spin-slow' : 'text-steel-muted'}`} />
                  <span>{isSpinning ? 'SPINNING' : 'ARMAR ARMA'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteStrike}
                  disabled={strikeActive}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-xl ${
                    strikeActive
                      ? 'bg-titanium-800 text-steel-muted border border-steel-border cursor-not-allowed'
                      : 'bg-safety-orange hover:bg-safety-orangeHover text-white cursor-pointer active:scale-95'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>{strikeActive ? 'IMPACTANDO...' : 'PROBAR IMPACTO (STRIKE!)'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Selector Rápido de Armas de Combate (Horizontal scroll en móvil) */}
          <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto no-scrollbar gap-2 pb-1">
            {WEAPON_PRESETS.map((w) => {
              const isSelected = w.id === selectedWeapon.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeapon(w)}
                  className={`p-2.5 rounded text-left border transition-all text-xs flex-shrink-0 w-40 sm:w-auto ${
                    isSelected
                      ? 'bg-safety-orange text-white border-safety-orange font-bold shadow-sm'
                      : 'bg-aerospace-800 text-steel-muted border-steel-border hover:text-steel-light hover:border-steel-muted'
                  }`}
                >
                  <span className="block truncate font-semibold text-[11px]">{w.name.split(' ')[0]} {w.name.split(' ')[1]}</span>
                  <span className="block text-[9px] opacity-75 mt-0.5">{w.category.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de Configuración de Armería & Fórmulas Cinéticas (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-aerospace-800 border border-steel-border rounded-xl p-5 space-y-4 shadow-xl text-xs">
            
            {/* Header del Arma */}
            <div className="border-b border-steel-border pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-safety-orange/15 text-safety-orange border border-safety-orange/30 font-bold uppercase">
                  {selectedWeapon.category}
                </span>
                <span className="text-xs text-steel-muted font-bold">
                  Impactos Registrados: <strong className="text-white">{impactCount}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{selectedWeapon.name}</h3>
              <p className="text-[11px] text-steel-muted mt-1 leading-relaxed">{selectedWeapon.description}</p>
            </div>

            {/* Sliders de Parámetros de Combate */}
            <div className="space-y-3 bg-aerospace-900/70 p-3.5 rounded-lg border border-steel-border/50">
              {selectedWeapon.defaultRpm > 0 && (
                <div>
                  <label className="text-steel-muted block mb-1 flex justify-between">
                    <span>Velocidad de Giro (RPM):</span>
                    <span className="text-safety-orange font-bold">{rpm.toLocaleString()} RPM</span>
                  </label>
                  <input
                    type="range"
                    min="6000"
                    max="26000"
                    step="500"
                    value={rpm}
                    onChange={(e) => setRpm(Number(e.target.value))}
                    className="w-full accent-safety-orange cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="text-steel-muted block mb-1 flex justify-between">
                  <span>Masa del Conjunto de Choque (g):</span>
                  <span className="text-white font-bold">{weaponMass} g</span>
                </label>
                <input
                  type="range"
                  min="80"
                  max="350"
                  step="10"
                  value={weaponMass}
                  onChange={(e) => setWeaponMass(Number(e.target.value))}
                  className="w-full accent-safety-orange cursor-pointer"
                />
              </div>

              <div>
                <label className="text-steel-muted block mb-1">Blindaje del Robot Objetivo (Dummy):</label>
                <select
                  value={dummyArmor}
                  onChange={(e) => setDummyArmor(e.target.value)}
                  className="w-full bg-aerospace-800 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange text-xs"
                >
                  <option value="alu6061">Aluminio 6061-T6 (3mm) — Blindaje Estándar</option>
                  <option value="carbon4mm">Fibra de Carbono Tejida (4mm) — Alta Rigidez</option>
                  <option value="titanium3mm">Titanio Grado 5 (3mm) — Blindaje Antibalas</option>
                </select>
              </div>
            </div>

            {/* Telemetría Cinemática de Impacto en Vivo */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-aerospace-900 p-2.5 rounded border border-steel-border">
                <span className="text-[10px] text-steel-muted block">Energía Cinética (Ek)</span>
                <span className="text-lg font-bold text-white">{kineticJoules.toFixed(1)} Joules</span>
              </div>
              <div className="bg-aerospace-900 p-2.5 rounded border border-steel-border">
                <span className="text-[10px] text-steel-muted block">Velocidad de Punta</span>
                <span className={`text-lg font-bold ${tipSpeed_kmh <= selectedWeapon.tipSpeedLimit_kmh ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {Math.round(tipSpeed_kmh)} km/h
                </span>
                <span className="text-[9px] text-steel-muted block">
                  (Límite SPARC: {selectedWeapon.tipSpeedLimit_kmh} km/h)
                </span>
              </div>
            </div>

            {/* Evaluación Táctica de Daño */}
            <div className="bg-aerospace-900/60 p-3 rounded border border-steel-border text-[11px] text-steel-light space-y-1">
              <span className="text-safety-orange font-bold uppercase block text-[10px]">
                Predicción de Daño en la Arena:
              </span>
              <p className="leading-relaxed">
                {kineticJoules > 200
                  ? '💥 Impacto Catastrófico: Capaz de romper soldaduras internas, expulsar la batería del oponente o arrojarlo fuera del ring.'
                  : kineticJoules > 90
                  ? '⚡ Daño Crítico Estructural: Abolladura severa de paneles, daño permanente en rodamientos de ruedas rivales.'
                  : '🔧 Daño de Desgaste: Fuerza suficiente para voltear al rival o dañar tornillería superficial.'}
              </p>
            </div>

            {/* CTA para llevar a fabricar en Custom Lab */}
            <div className="pt-2 border-t border-steel-border space-y-2">
              <button
                onClick={() => {
                  if (onOpenCustomLab) {
                    onOpenCustomLab();
                  }
                }}
                className="w-full py-2.5 px-4 rounded bg-safety-orange hover:bg-safety-orangeHover text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Maquinar esta Arma y Chasis en Custom Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
