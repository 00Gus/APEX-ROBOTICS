import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, SlidersHorizontal, ArrowUpRight, Check, ShoppingBag, Eye, X, Filter } from 'lucide-react';
import { fetchProductsList } from '../services/apiClient';
import { formatPriceMXN } from '../data/initialData';

export default function Catalog({ onAddToCart, onOpenExplodedView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedLevel]);

  const fetchProducts = () => {
    setLoading(true);
    fetchProductsList(selectedCategory, selectedLevel)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching catalog:', err);
        setLoading(false);
      });
  };

  const categories = [
    { id: 'all', label: 'Todas las Categorías' },
    { id: 'sumo', label: 'Robot Sumo (Mini / Mega)' },
    { id: 'combate', label: 'Combate (1lb / 3lb)' },
    { id: 'seguidor', label: 'Seguidores de Línea' },
    { id: 'laberinto', label: 'Micromouse Laberinto' },
  ];

  const levels = [
    { id: 'all', label: 'Todos los Niveles' },
    { id: 'ready', label: 'Ready-to-Fight (100% Armado)' },
    { id: 'kit', label: 'Kits Modulares DIY' },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header del Catálogo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-steel-border gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cobalt-500/10 border border-cobalt-500/30 text-cobalt-400 text-xs font-mono font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            CATÁLOGO HOMOLOGADO DE COMPETICIÓN
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            ROBOTS LISTOS Y KITS MODULARES
          </h2>
          <p className="text-sm font-mono text-steel-muted mt-1">
            Cada chasis y kit incluye especificaciones oficiales y tolerancias verificadas en banco de dinamómetro.
          </p>
        </div>

        {/* Contador de Stock */}
        <div className="text-right font-mono text-xs text-steel-muted">
          <span>Modelos en Catálogo: <strong className="text-white">{products.length}</strong></span>
          <span className="block text-[10px] text-emerald-400">● 100% DISPONIBLES EN LABORATORIO</span>
        </div>
      </div>

      {/* Barra de Filtros Técnicos */}
      <div className="bg-aerospace-800 border border-steel-border rounded-lg p-3 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Categorías (Scroll horizontal en móvil para fácil toque) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-mono text-steel-muted mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3 h-3" /> CATEGORÍA:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-mono px-3 py-1.5 rounded transition-all border flex-shrink-0 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-safety-orange text-white border-safety-orange font-bold shadow-sm'
                  : 'bg-aerospace-900 text-steel-light border-steel-border hover:border-steel-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Nivel de Entrega */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-mono text-steel-muted mr-1 flex-shrink-0">FORMATO:</span>
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`text-xs font-mono px-2.5 py-1.5 rounded transition-all border flex-shrink-0 whitespace-nowrap ${
                selectedLevel === lvl.id
                  ? 'bg-aerospace-700 text-safety-orange border-safety-orange font-bold'
                  : 'bg-aerospace-900 text-steel-muted border-steel-border hover:text-white'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-24 text-center font-mono text-steel-muted">
          <div className="w-8 h-8 border-2 border-safety-orange border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>CARGANDO SISTEMAS MECATRÓNICOS DESDE BASE DE DATOS...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-aerospace-800 rounded-lg border border-steel-border">
          <p className="text-steel-muted font-mono text-sm">No se encontraron modelos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-aerospace-800 border border-steel-border rounded-xl p-5 hover:border-steel-500 transition-all flex flex-col justify-between group shadow-md"
            >
              {/* Parte Superior: Badges y Título */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-aerospace-900 text-steel-muted border border-steel-border">
                    {p.level === 'ready' ? 'READY-TO-FIGHT' : p.level === 'kit' ? 'DIY MODULAR KIT' : 'RAW CORE'}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    HOMOLOGADO
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-safety-orange transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs font-mono text-steel-muted mt-1 line-clamp-2">
                  {p.description}
                </p>

                {/* Especificaciones en Ficha Técnica */}
                <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                  <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                    <span className="text-steel-muted text-[10px] block">Masa Total</span>
                    <span className="text-white font-semibold">{p.weight_g} g</span>
                  </div>
                  <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                    <span className="text-steel-muted text-[10px] block">Dimensiones</span>
                    <span className="text-white font-semibold">{p.dimensions}</span>
                  </div>
                  <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                    <span className="text-steel-muted text-[10px] block">Velocidad / Par</span>
                    <span className="text-white font-semibold">{p.max_speed_ms} m/s ({p.torque_nm} Nm)</span>
                  </div>
                  <div className="bg-aerospace-900 p-2 rounded border border-steel-border/50">
                    <span className="text-steel-muted text-[10px] block">Material Chasis</span>
                    <span className="text-white font-semibold truncate block" title={p.chassis_material}>
                      {p.chassis_material.split(' ')[0]} {p.chassis_material.split(' ')[1] || ''}
                    </span>
                  </div>
                </div>

                {/* Reglamento Satisfecho */}
                <div className="text-[11px] font-mono text-steel-muted bg-aerospace-900 p-2 rounded border border-steel-border/40 mb-4">
                  <span className="text-steel-light font-medium block text-[10px]">REGLAMENTO OFICIAL:</span>
                  <span className="truncate block">{p.ruleset_compliance}</span>
                </div>
              </div>

              {/* Parte Inferior: Precio y Acciones */}
              <div className="pt-3 border-t border-steel-border">
                <div className="flex items-baseline justify-between mb-3 font-mono">
                  <span className="text-xs text-steel-muted">PRECIO TALLER:</span>
                  <span className="text-lg sm:text-xl font-extrabold text-white">{formatPriceMXN(p.price)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModalProduct(p)}
                    className="py-2.5 px-3 rounded bg-aerospace-900 hover:bg-aerospace-700 text-steel-light hover:text-white border border-steel-border text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-steel-muted" />
                    <span>Ficha y Despiece</span>
                  </button>

                  <button
                    onClick={() => onAddToCart({ ...p, quantity: 1 })}
                    className="py-2.5 px-3 rounded bg-safety-orange hover:bg-safety-orangeHover text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal de Ficha Técnica Detallada */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-aerospace-900 border border-steel-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-steel-border pb-3">
              <div>
                <span className="text-xs font-mono text-safety-orange uppercase tracking-wider block">
                  FICHA TÉCNICA DE LABORATORIO // HOMOLOGACIÓN
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  {activeModalProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="p-1 rounded bg-aerospace-800 text-steel-muted hover:text-white hover:bg-titanium-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-steel-light leading-relaxed">
              {activeModalProduct.description}
            </p>

            {/* Parámetros Mecatrónicos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-aerospace-800 p-2.5 rounded border border-steel-border">
                <span className="text-steel-muted text-[10px] block">Masa de Báscula</span>
                <span className="text-white font-bold text-sm">{activeModalProduct.weight_g} g</span>
              </div>
              <div className="bg-aerospace-800 p-2.5 rounded border border-steel-border">
                <span className="text-steel-muted text-[10px] block">Caja de Dimensiones</span>
                <span className="text-white font-bold text-sm">{activeModalProduct.dimensions}</span>
              </div>
              <div className="bg-aerospace-800 p-2.5 rounded border border-steel-border">
                <span className="text-steel-muted text-[10px] block">Velocidad Máxima</span>
                <span className="text-safety-orange font-bold text-sm">{activeModalProduct.max_speed_ms} m/s</span>
              </div>
              <div className="bg-aerospace-800 p-2.5 rounded border border-steel-border">
                <span className="text-steel-muted text-[10px] block">Torque de Empuje</span>
                <span className="text-white font-bold text-sm">{activeModalProduct.torque_nm} Nm</span>
              </div>
              <div className="bg-aerospace-800 p-2.5 rounded border border-steel-border sm:col-span-2">
                <span className="text-steel-muted text-[10px] block">Motores y Reducción</span>
                <span className="text-steel-light font-semibold">{activeModalProduct.motor_type}</span>
              </div>
            </div>

            {/* Desglose de Componentes Incluidos */}
            <div>
              <h4 className="text-xs font-mono text-steel-muted uppercase tracking-wider mb-2">
                DESGLOSE DE SUBSISTEMAS INCLUIDOS EN EL PAQUETE:
              </h4>
              <div className="bg-aerospace-800 rounded border border-steel-border overflow-hidden">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-aerospace-900 border-b border-steel-border text-steel-muted text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Subsistema</th>
                      <th className="py-2 px-3">Tipo</th>
                      <th className="py-2 px-3 text-right">Peso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-border/50 text-steel-light">
                    {activeModalProduct.components && activeModalProduct.components.map((c, i) => (
                      <tr key={i} className="hover:bg-aerospace-900/40">
                        <td className="py-2 px-3">{c.name}</td>
                        <td className="py-2 px-3 text-steel-muted">{c.type}</td>
                        <td className="py-2 px-3 text-right font-bold text-white">{c.weight_g} g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-steel-border flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-steel-muted block">Precio Final:</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {formatPriceMXN(activeModalProduct.price)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cat = activeModalProduct.category;
                    setActiveModalProduct(null);
                    onOpenExplodedView(cat);
                  }}
                  className="py-2 px-4 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light hover:text-white border border-steel-border text-xs font-mono transition-all"
                >
                  Abrir Despiece 3D
                </button>
                <button
                  onClick={() => {
                    onAddToCart({ ...activeModalProduct, quantity: 1 });
                    setActiveModalProduct(null);
                  }}
                  className="py-2 px-4 rounded bg-safety-orange hover:bg-safety-orangeHover text-white text-xs font-mono font-bold transition-all shadow-md"
                >
                  Añadir al Carrito
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
