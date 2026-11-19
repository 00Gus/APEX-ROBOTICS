import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Catalog from './components/Catalog.jsx';
import CustomLab from './components/CustomLab.jsx';
import ExplodedViewer from './components/ExplodedViewer.jsx';
import ComplianceChecker from './components/ComplianceChecker.jsx';
import KinematicsCalc from './components/KinematicsCalc.jsx';
import HallOfFame from './components/HallOfFame.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import B2BQuoteModal from './components/B2BQuoteModal.jsx';
import ProjectTrackerModal from './components/ProjectTrackerModal.jsx';
import CombatSimulator from './components/CombatSimulator.jsx';
import { ShieldCheck, Cpu, Wrench, Activity, Award, Mail, ArrowUpRight, Swords } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [cart, setCart] = useState([
    {
      id: 'katana-mk4-mini-sumo',
      name: 'Katana MK-IV Mini-Sumo 500g (Ready-to-Fight)',
      price: 6890.00,
      weight_g: 485,
      quantity: 1,
      category: 'sumo'
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [explodedCategory, setExplodedCategory] = useState('sumo');

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, qty) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = qty;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-aerospace-900 text-steel-light flex flex-col font-sans selection:bg-safety-orange selection:text-white">

      {/* Cabecera Principal y Ticker de Telemetría */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        setIsQuoteOpen={setIsQuoteOpen}
        setIsTrackerOpen={setIsTrackerOpen}
      />

      {/* Contenido Dinámico según la pestaña activa */}
      <main className="flex-1">
        {activeTab === 'hero' && (
          <div>
            <Hero
              onExploreCatalog={() => setActiveTab('catalog')}
              onOpenCustomLab={() => setActiveTab('custom-lab')}
              onOpenExplodedView={(cat) => {
                if (cat) setExplodedCategory(cat);
                setActiveTab('exploded-view');
              }}
            />

            {/* Accesos Directos a las Herramientas Clave */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-steel-border/60">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-mono text-safety-orange uppercase tracking-wider block mb-1">
                  INFRAESTRUCTURA Y SERVICIOS INTEGRALES
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  HERRAMIENTAS PARA EQUIPOS Y ESCUDERÍAS
                </h2>
                <p className="text-xs font-mono text-steel-muted mt-2">
                  No somos una tienda genérica de juguetes: somos tu taller de maquila, telemetría y homologación deportiva.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-mono">
                {/* Tarjeta 1: Custom Lab */}
                <div
                  onClick={() => setActiveTab('custom-lab')}
                  className="bg-aerospace-800 border border-steel-border hover:border-safety-orange rounded-xl p-5 sm:p-6 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded bg-aerospace-900 border border-steel-border flex items-center justify-center text-safety-orange mb-4 group-hover:bg-safety-orange group-hover:text-white transition-colors">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-safety-orange transition-colors">
                    The Custom Lab
                  </h3>
                  <p className="text-xs text-steel-muted mt-2 leading-relaxed">
                    Sube tu modelo 3D o envíanos tu robot físico. Maquinamos piezas en aluminio 7075, titanio o fibra de carbono y lo armamos para ti.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-safety-orange font-bold mt-4">
                    <span>Configurar Trabajo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Tarjeta 2: Despiece 3D */}
                <div
                  onClick={() => setActiveTab('exploded-view')}
                  className="bg-aerospace-800 border border-steel-border hover:border-cobalt-500 rounded-xl p-5 sm:p-6 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded bg-aerospace-900 border border-steel-border flex items-center justify-center text-steel-light mb-4 group-hover:bg-cobalt-500 group-hover:text-white transition-colors">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cobalt-400 transition-colors">
                    Despiece Interactivo 3D
                  </h3>
                  <p className="text-xs text-steel-muted mt-2 leading-relaxed">
                    Explora capa por capa la arquitectura mecánica de Sumo, Combate y Seguidor de Línea con báscula reglamentaria.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-steel-light font-bold mt-4">
                    <span>Abrir Configuración 3D</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Tarjeta 3: Simulador de Combate */}
                <div
                  onClick={() => setActiveTab('combat-sim')}
                  className="bg-aerospace-800 border border-steel-border hover:border-safety-orange rounded-xl p-5 sm:p-6 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded bg-aerospace-900 border border-steel-border flex items-center justify-center text-safety-orange mb-4 group-hover:bg-safety-orange group-hover:text-white transition-colors">
                    <Swords className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-safety-orange transition-colors">
                    Simulador de Combate
                  </h3>
                  <p className="text-xs text-steel-muted mt-2 leading-relaxed">
                    Equipa armas (tambor, barra, hacha o flipper) y simula el impacto cinético real contra otro robot en la arena.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-safety-orange font-bold mt-4">
                    <span>Probar Impacto 3D</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Tarjeta 4: Inspector de Homologación */}
                <div
                  onClick={() => setActiveTab('compliance')}
                  className="bg-aerospace-800 border border-steel-border hover:border-emerald-500 rounded-xl p-5 sm:p-6 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded bg-aerospace-900 border border-steel-border flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Homologación
                  </h3>
                  <p className="text-xs text-steel-muted mt-2 leading-relaxed">
                    Valida en segundos si las dimensiones, peso y voltaje cumplen los reglamentos oficiales de All Japan y SPARC.
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold mt-4">
                    <span>Validar Reglamento</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </section>

            {/* Muestra rápida del Catálogo en la Portada */}
            <Catalog
              onAddToCart={handleAddToCart}
              onOpenExplodedView={() => setActiveTab('exploded-view')}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <Catalog
            onAddToCart={handleAddToCart}
            onOpenExplodedView={(cat) => {
              if (cat) setExplodedCategory(cat);
              setActiveTab('exploded-view');
            }}
          />
        )}

        {activeTab === 'custom-lab' && (
          <CustomLab />
        )}

        {activeTab === 'exploded-view' && (
          <ExplodedViewer category={explodedCategory} onAddToCart={handleAddToCart} />
        )}

        {activeTab === 'combat-sim' && (
          <CombatSimulator onOpenCustomLab={() => setActiveTab('custom-lab')} />
        )}

        {activeTab === 'compliance' && (
          <ComplianceChecker />
        )}

        {activeTab === 'kinematics' && (
          <KinematicsCalc onOpenCustomLab={() => setActiveTab('custom-lab')} />
        )}

        {activeTab === 'hall-of-fame' && (
          <HallOfFame onExploreSetup={() => setActiveTab('catalog')} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Footer Industrial Técnico */}
      <footer className="bg-aerospace-800 border-t border-steel-border text-xs font-mono py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base">APEX ROBOTICS</span>
              <span className="text-[10px] bg-safety-orange/20 text-safety-orange px-1.5 py-0.5 rounded border border-safety-orange/30">
                LAB
              </span>
            </div>
            <p className="text-steel-muted text-[11px] leading-relaxed">
              Ingeniería mecatrónica de competición, mecanizado de precisión CNC (±0.03mm) y ensamble de prototipos para torneos de alto rendimiento.
            </p>
            <div className="pt-2 text-[10px] text-steel-muted">
              Base de Datos Local: <span className="text-emerald-400">SQLite sincronizado</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-[11px]">
              Categorías de Torneo
            </h4>
            <ul className="space-y-1.5 text-steel-muted text-[11px]">
              <li>• Mini-Sumo 500g Autónomo & RC</li>
              <li>• Mega-Sumo 3kg con Downforce Magnético</li>
              <li>• Combate 1lb (Antweight) & 3lb (Beetle)</li>
              <li>• Seguidor de Línea con Turbina EDF</li>
              <li>• Resuelve Laberintos IEEE Micromouse</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3 text-[11px]">
              Servicios de Taller
            </h4>
            <ul className="space-y-1.5 text-steel-muted text-[11px]">
              <li>• Mecanizado CNC en Aluminio 7075-T6</li>
              <li>• Corte en Fibra de Carbono y Hardox 450</li>
              <li>• Impresión 3D técnica en Nylon PA-CF</li>
              <li>• Soldadura y cableado de alta temperatura</li>
              <li>• Banco de Dinamómetro y pruebas de arena</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Atención a Universidades y Clubes
            </h4>
            <p className="text-steel-muted text-[11px] leading-relaxed">
              Expedimos facturación fiscal oficial mexicana (CFDI 4.0) y cotizaciones formales para compras institucionales.
            </p>
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="w-full py-2 px-3 rounded bg-titanium-700 hover:bg-titanium-600 text-steel-light hover:text-white border border-steel-border text-[11px] font-semibold transition-all"
            >
              Generar Cotización Formal B2B
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-steel-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-steel-muted gap-4">
          <span>© 2026 APEX ROBOTICS MECHATRONICS LAB. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <span>Tolerancia de Banco: ±0.03mm</span>
            <span>•</span>
            <span>Reglamentos: All Japan / SPARC / RoboGames</span>
          </div>
        </div>
      </footer>

      {/* Drawer del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onOpenQuote={() => setIsQuoteOpen(true)}
      />

      {/* Modal de Cotización B2B Formal */}
      <B2BQuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        cart={cart}
      />

      {/* Modal de Rastreo Rápido de Proyectos */}
      <ProjectTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

    </div>
  );
}
