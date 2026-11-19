import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { formatPriceMXN } from '../data/initialData';
import { submitOrderRequest } from '../services/apiClient';

export default function B2BQuoteModal({ isOpen, onClose, cart }) {
  const [institutionName, setInstitutionName] = useState('Facultad de Ingeniería / Club de Robótica');
  const [responsibleName, setResponsibleName] = useState('Dr. / Ing. Responsable de Laboratorio');
  const [email, setEmail] = useState('contacto@universidad.edu');
  const [quoteFolio, setQuoteFolio] = useState(`COT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 6890.00;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleSaveAndPrint = async () => {
    try {
      await submitOrderRequest({
        client_name: responsibleName,
        client_email: email,
        institution: institutionName,
        total_amount: total,
        items: cart.length > 0 ? cart : [{ name: 'Kit Robótica Prototipo Base', price: subtotal, quantity: 1 }],
        is_b2b_quote: true,
      });
      setIsSaved(true);
      window.print();
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-slate-900 rounded-xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl font-mono text-xs space-y-6 print:p-0 print:shadow-none print:max-w-none">
        
        {/* Barra superior de acciones (Se oculta al imprimir) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <FileText className="w-5 h-5 text-safety-orange" />
            <span>GENERADOR DE COTIZACIÓN FORMAL INSTITUCIONAL (PDF/PRINT)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndPrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-safety-orange" />
              <span>Guardar e Imprimir / Guardar como PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Encabezado Formal de Cotización */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider text-slate-900">APEX ROBOTICS</span>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold">
                LAB MECATRÓNICO
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Apex Mechatronics Engineering S.A.P.I. de C.V.</p>
            <p className="text-[11px] text-slate-600">Área de Prototipado, Maquinado CNC y Kits de Competición</p>
            <p className="text-[11px] text-slate-600">RFC: AME261119-9X1 | Soporte B2B: lab@apexrobotics.io</p>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-slate-900 block">COTIZACIÓN INSTITUCIONAL</span>
            <span className="text-base font-bold text-safety-orange block">{quoteFolio}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Fecha de Emisión: 19/Noviembre/2026</span>
            <span className="text-[11px] text-slate-500 block">Vigencia: 30 Días Naturales</span>
          </div>
        </div>

        {/* Datos de la Institución Solicitante (Editables en pantalla) */}
        <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              INSTITUCIÓN / ESCUELA / CLUB:
            </span>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 print:border-none print:p-0"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
              DOCENTE / INVESTIGADOR / CAPITÁN RESPONSABLE:
            </span>
            <input
              type="text"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-slate-900 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Tabla de Artículos Cotizados */}
        <div>
          <table className="w-full text-left border border-slate-200 divide-y divide-slate-200">
            <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700">
              <tr>
                <th className="py-2.5 px-3">Partida / Descripción del Sistema Mecatrónico</th>
                <th className="py-2.5 px-3 text-center">Cant.</th>
                <th className="py-2.5 px-3 text-right">P. Unitario</th>
                <th className="py-2.5 px-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {cart.length > 0 ? (
                cart.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3">
                      <span className="font-bold block">{item.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.category ? `Categoría: ${item.category}` : 'Componentes de alta precisión'} • Tolerancia CNC garantizada ±0.03mm
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{formatPriceMXN(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{formatPriceMXN(item.price * item.quantity)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-2.5 px-3">
                    <span className="font-bold block">Kit Completo Mini-Sumo 500g Katana MK-IV + Electrónica STM32</span>
                    <span className="text-[10px] text-slate-500">Incluye chasis mecanizado en Duraluminio 7075-T6, pala templada Hardox y sensores ToF</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">1</td>
                  <td className="py-2.5 px-3 text-right">{formatPriceMXN(subtotal)}</td>
                  <td className="py-2.5 px-3 text-right font-bold">{formatPriceMXN(subtotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen de Importes */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 border border-slate-200 p-3 rounded bg-slate-50">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatPriceMXN(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>I.V.A. (16%):</span>
              <span className="font-bold">{formatPriceMXN(iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-1">
              <span>TOTAL NETO:</span>
              <span className="text-safety-orange">{formatPriceMXN(total)}</span>
            </div>
          </div>
        </div>

        {/* Términos y Condiciones Formales */}
        <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 space-y-1 leading-relaxed">
          <span className="font-bold text-slate-800 block uppercase">CONDICIONES GENERALES Y FORMAS DE PAGO:</span>
          <p>1. Se expide factura fiscal oficial mexicana (CFDI 4.0 con uso de CFDI según requerimiento institucional: G03 / P01).</p>
          <p>2. Aceptamos pagos mediante Orden de Compra Institucional, Transferencia Electrónica Interbancaria (SPEI), o Tarjeta Corporativa.</p>
          <p>3. Tiempo de entrega estimado: 3 a 5 días hábiles para kits en stock; 7 a 10 días para piezas con mecanizado especial en centro de torneado y fresado CNC.</p>
          <p>4. Todos los productos cuentan con garantía de cumplimiento de báscula en torneos oficiales y 6 meses contra defectos de manufactura.</p>
        </div>

      </div>
    </div>
  );
}
