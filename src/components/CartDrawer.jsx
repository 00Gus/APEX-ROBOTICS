import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatPriceMXN } from '../data/initialData';
import { submitOrderRequest } from '../services/apiClient';

export default function CartDrawer({ isOpen, onClose, cart, onRemoveItem, onUpdateQuantity, onOpenQuote }) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    institution: '',
  });

  if (!isOpen) return null;

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalWeight = cart.reduce((acc, item) => acc + ((item.weight_g || 0) * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);

    try {
      const data = await submitOrderRequest({
        client_name: checkoutForm.name,
        client_email: checkoutForm.email,
        institution: checkoutForm.institution,
        total_amount: totalAmount,
        items: cart,
        is_b2b_quote: false,
      });
      if (data && data.success) {
        setOrderComplete(data.order_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 flex justify-end">
      <div className="w-full max-w-md bg-aerospace-900 border-l border-steel-border h-full flex flex-col justify-between p-4 sm:p-6 shadow-2xl font-mono">
        
        {/* Cabecera */}
        <div className="border-b border-steel-border pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-safety-orange" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Componentes & Kits ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-aerospace-800 text-steel-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Lista de Productos */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {orderComplete ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">¡ORDEN RECIBIDA!</h4>
              <p className="text-xs text-steel-muted">Tu orden fue guardada en el sistema local con el folio:</p>
              <div className="bg-aerospace-800 border border-steel-border p-3 rounded font-bold text-safety-orange text-lg">
                {orderComplete}
              </div>
              <p className="text-xs text-steel-muted">
                El equipo de laboratorio comenzará la preparación y empaquetado seguro para torneos.
              </p>
              <button
                onClick={() => {
                  setOrderComplete(null);
                  onClose();
                }}
                className="mt-4 px-4 py-2 rounded bg-titanium-700 text-white text-xs"
              >
                Cerrar Panel
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 text-steel-muted text-xs">
              Tu carrito está vacío. Agrega kits o personaliza tu setup en el Despiece 3D.
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="bg-aerospace-800 p-3 rounded-lg border border-steel-border flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <span className="font-semibold text-white block">{item.name}</span>
                  <div className="flex items-center gap-3 text-steel-muted text-[11px]">
                    <span className="text-steel-light font-semibold">{formatPriceMXN(item.price)}</span>
                    {item.weight_g && <span>• {item.weight_g} g</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-steel-border rounded bg-aerospace-900">
                    <button
                      onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                      className="px-2 py-0.5 text-steel-muted hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-2 text-white font-bold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="px-2 py-0.5 text-steel-muted hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1 text-steel-muted hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Totales y Checkout */}
        {!orderComplete && cart.length > 0 && (
          <div className="border-t border-steel-border pt-4 space-y-4">
            <div className="bg-aerospace-800 p-3 rounded border border-steel-border text-xs space-y-1">
              <div className="flex justify-between text-steel-muted">
                <span>Masa Total de Ensamble:</span>
                <span className="text-white font-bold">{totalWeight} g</span>
              </div>
              <div className="flex justify-between text-steel-muted">
                <span>Subtotal Mecatrónica:</span>
                <span className="text-white font-bold">{formatPriceMXN(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-steel-border/50 text-white font-extrabold">
                <span>TOTAL:</span>
                <span className="text-safety-orange">{formatPriceMXN(totalAmount)}</span>
              </div>
            </div>

            {/* Formulario Rápido de Datos para Orden */}
            <form onSubmit={handleCheckout} className="space-y-2 text-xs">
              <input
                type="text"
                required
                placeholder="Nombre completo o Equipo"
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                className="w-full bg-aerospace-800 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
              />
              <input
                type="email"
                required
                placeholder="Correo electrónico oficial"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                className="w-full bg-aerospace-800 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
              />
              <input
                type="text"
                placeholder="Universidad / Club / Empresa (Opcional)"
                value={checkoutForm.institution}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, institution: e.target.value })}
                className="w-full bg-aerospace-800 border border-steel-border rounded p-2 text-white focus:outline-none focus:border-safety-orange"
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuote();
                  }}
                  className="py-2.5 px-3 rounded bg-titanium-800 hover:bg-titanium-700 text-steel-light border border-steel-border flex items-center justify-center gap-1.5 transition-all text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5 text-cobalt-400" />
                  <span>Cotización B2B</span>
                </button>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="py-2.5 px-3 rounded bg-safety-orange hover:bg-safety-orangeHover text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-md text-[11px]"
                >
                  <span>{isCheckingOut ? 'Procesando...' : 'Confirmar Orden'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
