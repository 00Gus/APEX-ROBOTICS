# ⚡ APEX MECHATRONICS — Plataforma de Robótica de Competición & Prototipado

> Ingeniería Mecatrónica de Precisión Milimétrica para Robótica de Competición (Mini-Sumo, Mega-Sumo, Combate 1lb/3lb, Velocistas y Micromouse).

[![Deploy to GitHub Pages](https://github.com/00Gus/APEX-ROBOTICS/actions/workflows/deploy.yml/badge.svg)](https://github.com/00Gus/APEX-ROBOTICS/actions/workflows/deploy.yml)
[![Precios en MXN](https://img.shields.io/badge/Moneda-MXN%20(%24)-brightgreen)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Three.js%20%7C%20TailwindCSS%20%7C%20SQLite-blue)](#)

---

## 🚀 Características Principales

1. **Catálogo Oficial en Pesos Mexicanos (MXN)**:
   - Robots Ready-to-Fight (100% armados y testeados) y Kits Modulares DIY.
   - Categorías: *Mini-Sumo 500g*, *Mega-Sumo 3kg*, *Combate 1lb Antweight*, *Combate 3lb Beetleweight*, *Seguidor de Línea Velocista* y *Micromouse*.
2. **Visor 3D Interactivo y Despiece Técnico por Capas**:
   - Modelado 3D realista con Three.js (renderizado de aleaciones metálicas, chasis Hardox 450, fibra de carbono y titanio grado 5).
   - Control de explosión de ensamblaje (0% a 100%) con cálculo dinámico de masa para báscula reglamentaria.
3. **Simulador de Combate y Balística de Impacto**:
   - Arena virtual interactiva con cinemática física real (RPM, masa de impacto, cálculo de energía cinética $E_k = \frac{1}{2} I \omega^2$ y velocidad de punta de arma).
   - Simulación de choque contra diferentes blindajes de prueba (Dummy B).
4. **Custom Lab & Tracker de Prototipado**:
   - Envío y cotización de proyectos personalizados (maquinado CNC, corte por agua/láser, ensamble a medida).
   - Sistema de seguimiento con código de rastreo técnico (ej: `#LAB-8042`).
5. **Comprobador de Homologación Técnica**:
   - Validador de cumplimiento con reglamentos internacionales: *All Japan Robot-Sumo*, *SPARC Combat Robotics* y *RoboGames*.
6. **Panel Administrativo & Taller**:
   - Gestión integral de órdenes, inventario y actualización de telemetría de proyectos en manufactura.
7. **Arquitectura Híbrida (Local Fullstack & GitHub Pages Estático)**:
   - En local: Backend Node/Express + SQLite ligero.
   - En GitHub Pages: Carga autónoma con dataset inicial y persistencia reactiva en `localStorage`.

---

## 🛠️ Tecnologías Empleadas

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons.
- **Gráficos 3D**: Three.js (WebGL, sombras PBR, materiales metálicos reflectantes).
- **Backend Local**: Node.js, Express, SQLite3 / Better-SQLite3, Multer.
- **CI/CD**: GitHub Actions con despliegue automático a GitHub Pages.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- npm o pnpm

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/00Gus/APEX-ROBOTICS.git
   cd APEX-ROBOTICS
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **(Opcional) Poblar la base de datos SQLite**:
   ```bash
   npm run seed
   ```

4. **Iniciar en modo desarrollo**:
   ```bash
   # Inicia servidor backend (puerto 3001) y frontend Vite (puerto 5173) concurrentemente:
   npm run dev
   ```

5. **Construir para producción**:
   ```bash
   npm run build
   ```

---

## 🌐 Opciones de Despliegue en GitHub Pages

Tienes disponibles **dos métodos** para desplegar la plataforma:

### Opción 1: GitHub Actions (Recomendado y Automatizado)
1. En GitHub, ve a **Settings** > **Pages**.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Cada vez que hagas `git push` a `main`, GitHub compilará y publicará la web automáticamente.

### Opción 2: Deploy from a branch (Rama `gh-pages`)
Si prefieres el método clásico de rama:
1. En GitHub, ve a **Settings** > **Pages**.
2. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
3. En **Branch**, selecciona la rama **`gh-pages`** y la carpeta **`/(root)`**, luego haz clic en **Save**.

En ambos casos tu página estará en vivo en:
👉 **[https://00gus.github.io/APEX-ROBOTICS/](https://00gus.github.io/APEX-ROBOTICS/)**

---

© 2026 APEX Mechatronics. Todos los derechos reservados.
