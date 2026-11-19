import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Wrench, Award, ShoppingBag, FileText, Activity, Menu, X, CheckCircle2, ChevronRight, Search, Swords } from 'lucide-react';
import { fetchLabStats } from '../services/apiClient';

export default function Header({ activeTab, setActiveTab, cart, setIsCartOpen, setIsQuoteOpen, setIsTrackerOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    lab_status: 'OPERACIONAL',
    tolerance: '±0.03mm',
    active_projects: 2,
    catalog_models: 7,
    orders_processed: 48
  });

  useEffect(() => {
    fetchLabStats().then(data => {
      if (data) setStats(data);
    });
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'catalog', label: 'Robots & Kits', icon: Cpu },
    { id: 'custom-lab', label: 'Custom Lab (Tu Proyecto)', icon: Wrench, highlight: true },
    { id: 'exploded-view', label: 'Despiece 3D', icon: Activity },
    { id: 'combat-sim', label: 'Simulador Combate', icon: Swords, highlight: true },
    { id: 'compliance', label: 'Homologación', icon: Shield },
    { id: 'kinematics', label: 'Cinemática', icon: Activity },
    { id: 'hall-of-fame', label: 'Salón de la Fama', icon: Award },
    { id: 'admin', label: 'Admin Taller', icon: FileText, admin: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-aerospace-900 border-b border-steel-border shadow-md">
      {/* Ticker técnico superior */}
      <div className="bg-aerospace-800 border-b border-steel-border/50 text-[11px] font-mono py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar whitespace-nowrap gap-4 sm:gap-6 text-steel-muted">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ESTADO LAB: {stats.lab_status}
            </span>
            <span className="text-steel-border">|</span>
            <span>TOLERANCIA CNC: <span className="text-steel-light font-semibold">{stats.tolerance}</span></span>
            <span className="text-steel-border hidden xs:inline">|</span>
            <span className="hidden xs:inline">COLA: <span className="text-safety-orange font-semibold">{stats.active_projects} ACTIVOS</span></span>
          </div>

          <div className="flex items-center gap-3 text-xs flex-shrink-0">
            <button 
              onClick={() => setIsTrackerOpen(true)}
              className="hover:text-safety-orange transition-colors flex items-center gap-1 text-[11px] text-steel-light"
            >
              <Search className="w-3 h-3 text-safety-orange" />
              <span>Rastrear #LAB</span>
            </button>
            <span className="text-steel-border hidden md:inline">|</span>
            <span className="text-steel-light hidden md:inline">HOMOLOGADO: ALL JAPAN / SPARC</span>
          </div>
        </div>
      </div>

      {/* Barra principal de navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Técnico */}
          <div 
            onClick={() => setActiveTab('hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-aerospace-800 border border-steel-border flex items-center justify-center text-safety-orange font-mono font-bold text-base sm:text-lg group-hover:border-safety-orange transition-colors shadow-sm">
              <span className="relative">
                ▲
                <span className="absolute -bottom-1 -right-1 text-[8px] text-cobalt-400">X</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold tracking-wider text-steel-light text-base sm:text-lg">APEX</span>
                <span className="text-[9px] sm:text-[10px] bg-safety-orange/15 text-safety-orange px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border border-safety-orange/30">
                  MECHATRONICS
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-mono text-steel-muted tracking-tight hidden xs:block">ROBÓTICA DE COMPETICIÓN & PROTOTIPADO</p>
            </div>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-mono rounded transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-aerospace-800 text-safety-orange border border-safety-orange/50 shadow-sm'
                      : item.highlight
                      ? 'text-safety-orange bg-aerospace-800 hover:bg-aerospace-700 border border-safety-orange/20'
                      : item.admin
                      ? 'text-steel-muted hover:text-steel-light hover:bg-aerospace-800'
                      : 'text-steel-light hover:text-white hover:bg-aerospace-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-safety-orange' : item.highlight ? 'text-safety-orange' : 'text-steel-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Acciones de Cabecera (Cotización B2B + Carrito) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsQuoteOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded bg-aerospace-800 border border-steel-border hover:border-steel-500 text-steel-light hover:text-white transition-all shadow-sm"
              title="Generar cotización formal para universidades o patrocinadores"
            >
              <FileText className="w-3.5 h-3.5 text-steel-muted" />
              <span>Cotización B2B</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded bg-aerospace-800 border border-steel-border hover:border-safety-orange text-steel-light hover:text-white transition-all flex items-center gap-2 shadow-sm"
              title="Ver componentes en orden"
            >
              <ShoppingBag className="w-4 h-4 text-safety-orange" />
              {totalCartItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-safety-orange text-white text-[11px] font-mono font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded bg-aerospace-800 border border-steel-border text-steel-light hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Mobile Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-aerospace-900 border-b border-steel-border px-4 pt-2 pb-5 space-y-1 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded text-xs font-mono flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-aerospace-800 text-safety-orange font-bold border-l-2 border-safety-orange'
                    : 'text-steel-light hover:bg-aerospace-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-safety-orange' : 'text-steel-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-steel-border flex flex-col gap-2">
            <button
              onClick={() => {
                setIsQuoteOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-mono rounded bg-aerospace-800 text-steel-light border border-steel-border hover:bg-aerospace-700"
            >
              Generar Cotización Formal B2B
            </button>
            <button
              onClick={() => {
                setIsTrackerOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-center py-2.5 text-xs font-mono rounded bg-safety-orange text-white font-semibold shadow"
            >
              Rastrear Proyecto #LAB
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
