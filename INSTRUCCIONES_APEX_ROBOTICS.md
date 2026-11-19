# 🚀 Apex Robotics Lab — Instrucciones de Uso y Lanzamiento Local

¡Tu plataforma web de robótica de competición y prototipado está 100% construida y configurada con base de datos SQLite ultraligera!

---

## ⚡ Cómo Iniciar la Página Web en tu Laptop

Tienes dos formas muy sencillas de correr la página:

### Opción 1: Modo Completo Servidor + Producción (Recomendado, 1 solo comando)
Abre PowerShell o terminal en esta carpeta y ejecuta:
```bash
npm start
```
* **Abre tu navegador en:** [http://localhost:3001](http://localhost:3001)
* Sirve tanto la interfaz gráfica completa como la API mecatrónica y la base de datos SQLite.

### Opción 2: Modo Desarrollo con Hot-Reload (Vite + Node Server)
Si deseas hacer cambios en el código y verlos al instante:
```bash
npm run dev
```
* **Abre tu navegador en:** [http://localhost:5173](http://localhost:5173) (con proxy automático a la API en el puerto 3001).

---

## 🗄️ Base de Datos Local Ultraligera (SQLite)
* **Archivo de base de datos:** `data/apex_robotics.sqlite`
* **Tamaño en disco:** ~49 Kilobytes (0 desperdicio de almacenamiento en tu laptop).
* **Motor:** Módulo nativo `node:sqlite` sin dependencias pesadas de compilación.
* **Si alguna vez deseas reiniciar los datos de fábrica (robots, reglamentos, campeones):**
  ```bash
  npm run seed
  ```

---

## 🛠️ Funciones Implementadas en la Web

1. **Hero Interactivo & Visor 3D:**
   * Selector dinámico por categorías: Mini-Sumo 500g, Mega-Sumo 3kg, Combate 1lb Antweight, Combate 3lb Beetleweight, Seguidor de Línea Turbo con succión EDF y Micromouse.
   * Visor 3D con Three.js que rota e interactúa con el mouse, además de botón para activar vista de alambre CAD (`CAD WIRE: ON/OFF`).
2. **Catálogo de Competición & Kits:**
   * Fichas técnicas completas con masas reglamentarias, sensores, motores y despiece de componentes por robot.
   * Filtros por categoría y por formato (Ready-to-Fight vs. Kits Modulares DIY).
3. **Despiece Interactivo 3D (Exploded View Configurator):**
   * Control deslizante de nivel de despiece (0% a 100%).
   * Desglose de 7 subsistemas: Pala Hardox, Chasis 7075, ESC dual STM32, Motores Coreless, Llantas Shore 25A, Batería LiPo y Sensores ToF.
   * Báscula en tiempo real con dictamen de homologación (verde si pasa de 500g, rojo si excede el límite oficial).
4. **The Custom Lab (Tu Proyecto a Medida):**
   * El cliente elige si tiene un archivo CAD 3D (.STEP/.STL), un robot físico para afinar o una idea desde cero.
   * Visor 3D interactivo en navegador para piezas y prototipos.
   * Checklist interactivo de servicios (Mecanizado CNC 7075, Corte en Fibra de Carbono/Titanio, Impresión PA-CF, Ensamble, Pruebas en dinamómetro con video).
   * Generación de Folio Oficial único (`#LAB-2026-XXXX`) guardado directamente en SQLite.
   * **Rastreador de Proyectos en Vivo:** Los clientes pueden ingresar su folio y ver en qué fase va su robot en el taller (Revisión CAD -> Aprobado -> Maquila CNC -> Ensamble -> Listo para Envío).
5. **Inspector de Homologación de Reglamentos Oficiales:**
   * Reglas precargadas: *All Japan Robot-Sumo*, *SPARC / RoboGames*, *RoboChallenge Europa* e *IEEE Micromouse*.
   * Validador en vivo con cálculo de margen de tolerancia y recomendaciones de aligeramiento mecánico.
6. **Calculadora de Cinemática & Dinamómetro:**
   * Calcula velocidad lineal ($m/s$ y $km/h$), fuerza de empuje estática de tracción (Newtons y kg-fuerza), tiempo de 0 a 1m y aceleración según coeficiente de fricción de la llanta.
7. **Salón de la Fama (Social Proof Técnico):**
   * Fichas de robots campeones con récords reales de pista y combate.
8. **Cotizador Formal B2B para Universidades:**
   * Generador de cotizaciones formales institucionales en formato PDF/Print con desglose de IVA, RFC, términos comerciales y cuentas bancarias.
9. **Panel de Administración (/admin):**
   * Visualiza y administra los proyectos de clientes en Custom Lab, cambia su estatus de taller y añade notas técnicas en tiempo real sobre la base de datos SQLite.
