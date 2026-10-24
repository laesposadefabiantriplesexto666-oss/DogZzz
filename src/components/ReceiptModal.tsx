import React from 'react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';
import { Printer, X, CheckCircle, Dog } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-[#EADFD5] overflow-hidden my-6">
        {/* Header Actions - hidden on print */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-[#EADFD5] bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#4A6B53]" />
            <span className="font-semibold text-[#382417]">Comprobante de Venta #{order.folio} · DogZzz</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C25E42] hover:bg-[#B04D32] rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#7A6150] hover:text-[#382417] rounded-lg hover:bg-[#F2ECE4] transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 text-[#2C1810] bg-white font-sans text-xs">
          {/* Business Header with DogZzz Mascot */}
          <div className="text-center pb-5 border-b border-[#EADFD5]">
            <div className="flex items-center justify-center gap-3 mb-1.5">
              <img
                src={settings.logoUrl || '/src/assets/images/dogzzz_brand_logo_1792871852948.jpg'}
                alt="DogZzz Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-[#D9CABE]"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-[#382417]">
                  {settings.businessName}
                </h1>
                <p className="text-[11px] text-[#4A6B53] font-semibold tracking-wide">
                  🐾 "{settings.slogan}"
                </p>
              </div>
            </div>
            <p className="text-[#7A6150] text-[11px] mt-1">{settings.address} · {settings.city}</p>
            <p className="text-[#7A6150] text-[11px]">Tel: {settings.phone} · Horario: {settings.operatingHours}</p>
            <div className="mt-2.5 inline-block px-3 py-0.5 bg-[#FAF7F2] text-[#382417] text-[10px] font-bold rounded border border-[#EADFD5]">
              COMPROBANTE DE COMPRA Y CONTROL DE GARANTÍA DOGZZZ
            </div>
          </div>

          {/* Folio & Customer Info */}
          <div className="grid grid-cols-2 gap-6 py-4 border-b border-[#EADFD5] text-[11px]">
            <div>
              <p className="text-[#8C7565] font-semibold">FOLIO DE VENTA:</p>
              <p className="text-sm font-bold text-[#382417] font-mono">{order.folio}</p>
              <p className="text-[#8C7565] mt-2 font-semibold">FECHA Y HORA:</p>
              <p className="text-[#382417]">{formattedDate}</p>
              <p className="text-[#8C7565] mt-2 font-semibold">ATENDIÓ:</p>
              <p className="text-[#382417]">{order.createdBy}</p>
            </div>
            <div>
              <p className="text-[#8C7565] font-semibold">DATOS DEL CLIENTE Y MASCOTA:</p>
              <p className="font-bold text-[#382417] text-xs">{order.customerName}</p>
              {order.petName && (
                <p className="text-[#4A6B53] font-semibold mt-0.5">🐶 Mascota: {order.petName}</p>
              )}
              <p className="text-[#7A6150]">Tel: {order.customerPhone}</p>
              {order.customerAddress && (
                <p className="text-[#7A6150] mt-1 leading-snug">{order.customerAddress}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4 border-b border-[#EADFD5]">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#D9CABE] text-[#5C3D2E] uppercase font-semibold">
                  <th className="py-2">Cama para Perro / Modelo</th>
                  <th className="py-2 text-center">Talla</th>
                  <th className="py-2 text-center">Color</th>
                  <th className="py-2 text-center">Cant.</th>
                  <th className="py-2 text-right">P. Unitario</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 pr-2">
                      <p className="font-bold text-[#382417]">{item.productName}</p>
                      <p className="text-[#8C7565] text-[10px] font-mono">
                        SKU: {item.productSku} {item.dimensions ? `· ${item.dimensions}` : ''}
                      </p>
                    </td>
                    <td className="py-2.5 text-center font-bold text-[#382417]">{item.size}</td>
                    <td className="py-2.5 text-center text-[#7A6150]">{item.color}</td>
                    <td className="py-2.5 text-center font-bold text-[#382417]">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-[#382417]">
                      ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold tabular-nums text-[#382417]">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="py-4 border-b border-[#EADFD5] flex justify-end">
            <div className="w-64 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#7A6150]">
                <span>Subtotal de Camas:</span>
                <span className="font-mono tabular-nums">${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#4A6B53]">
                  <span>Descuento aplicado:</span>
                  <span className="font-mono tabular-nums">-${order.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-[#7A6150]">
                  <span>Flete / Envío canino:</span>
                  <span className="font-mono tabular-nums">${order.deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-[#382417] pt-2 border-t border-[#EADFD5]">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono tabular-nums">${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between text-[#382417] pt-1">
                <span>Importe Pagado ({order.paymentMethod}):</span>
                <span className="font-mono font-bold tabular-nums text-[#4A6B53]">
                  ${order.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`flex justify-between pt-1 font-bold ${order.balancePending > 0 ? 'text-[#C25E42]' : 'text-[#382417]'}`}>
                <span>Saldo Pendiente:</span>
                <span className="font-mono tabular-nums">
                  ${order.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="py-4 border-b border-[#EADFD5] text-[11px]">
            <h4 className="font-bold text-[#382417] mb-1">INFORMACIÓN DE ENTREGA / DESPACHO</h4>
            {order.delivery.required ? (
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EADFD5] space-y-1 text-[#7A6150]">
                <p>
                  <strong className="text-[#382417]">Modalidad:</strong> Entrega a domicilio programada
                </p>
                <p>
                  <strong className="text-[#382417]">Fecha Programada:</strong> {order.delivery.scheduledDate || 'Por coordinar con el cliente'} · Horario: {order.delivery.timeSlot || 'Por definir'}
                </p>
                <p>
                  <strong className="text-[#382417]">Dirección:</strong> {order.delivery.address}
                </p>
                {order.delivery.references && (
                  <p>
                    <strong className="text-[#382417]">Referencias:</strong> {order.delivery.references}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EADFD5] text-[#7A6150]">
                <p><strong className="text-[#382417]">Modalidad:</strong> Retiro directo por el cliente en piso de tienda DogZzz.</p>
              </div>
            )}
          </div>

          {/* Terms & Fiscal Disclaimer */}
          <div className="pt-4 text-[10px] text-[#8C7565] text-center leading-relaxed space-y-1">
            <p>
              * Cuidado de la cama: Recomendamos lavar la funda con agua fría y secar a la sombra. Todas nuestras camas ortopédicas y con Memory Foam cuentan con 6 meses de garantía contra deformación permanente de espuma.
            </p>
            <p className="font-semibold text-[#5C3D2E]">
              NOTA IMPORTANTE: Este documento es un comprobante interno de venta y control de garantía de DogZzz. No constituye una factura fiscal electrónica (CFDI).
            </p>
            <p className="pt-1 text-[#4A6B53] font-bold">¡Gracias por elegir DogZzz para el descanso de tu consentido!</p>
          </div>
        </div>

        {/* Modal Footer - hidden on print */}
        <div className="no-print flex items-center justify-end gap-3 px-6 py-4 bg-[#FAF7F2] border-t border-[#EADFD5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#5C3D2E] bg-white border border-[#D9CABE] rounded-lg hover:bg-[#F2ECE4] transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#C25E42] hover:bg-[#B04D32] rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>
        </div>
      </div>
    </div>
  );
};
