import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, PaymentMethod } from '../types';
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Printer,
  DollarSign,
  Ban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Plus,
  Dog,
  Heart,
  Layers
} from 'lucide-react';

interface OrdersHistoryViewProps {
  onPrintOrder: (order: Order) => void;
  selectedOrderFromOtherView?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const OrdersHistoryView: React.FC<OrdersHistoryViewProps> = ({
  onPrintOrder,
  selectedOrderFromOtherView,
  onClearSelectedOrder
}) => {
  const {
    orders,
    addPaymentToOrder,
    updateOrderStatus,
    cancelOrder,
    isAdmin,
    settings,
    currentUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  // Detail Modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(
    selectedOrderFromOtherView || null
  );

  // Sync if selected from other view
  React.useEffect(() => {
    if (selectedOrderFromOtherView) {
      setDetailOrder(selectedOrderFromOtherView);
    }
  }, [selectedOrderFromOtherView]);

  // Payment Abono Modal
  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [abonoAmount, setAbonoAmount] = useState<number | ''>('');
  const [abonoMethod, setAbonoMethod] = useState<PaymentMethod>('Efectivo');
  const [abonoNotes, setAbonoNotes] = useState('');

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      ord.folio.toLowerCase().includes(s) ||
      ord.customerName.toLowerCase().includes(s) ||
      (ord.customerPetName && ord.customerPetName.toLowerCase().includes(s)) ||
      ord.customerPhone.includes(s) ||
      ord.items.some((i) => i.productName.toLowerCase().includes(s));

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && ord.orderStatus !== statusFilter) return false;

    if (paymentFilter === 'PAID' && ord.balancePending > 0) return false;
    if (paymentFilter === 'PENDING' && ord.balancePending === 0) return false;

    return true;
  });

  const handleAbonoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailOrder) return;
    const amountNum = typeof abonoAmount === 'number' ? abonoAmount : parseFloat(abonoAmount) || 0;
    if (amountNum <= 0) return;

    const res = addPaymentToOrder(detailOrder.id, amountNum, abonoMethod, abonoNotes);
    if (res.success) {
      setShowAbonoModal(false);
      setAbonoAmount('');
      setAbonoNotes('');
      // Refresh detailOrder
      const refreshed = orders.find((o) => o.id === detailOrder.id);
      if (refreshed) setDetailOrder(refreshed);
    }
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailOrder) return;
    if (!cancelReason.trim()) {
      alert('Por favor indica el motivo de la cancelación para la bitácora.');
      return;
    }

    const res = cancelOrder(detailOrder.id, cancelReason);
    if (res.success) {
      setShowCancelModal(false);
      setCancelReason('');
      const refreshed = orders.find((o) => o.id === detailOrder.id);
      if (refreshed) setDetailOrder(refreshed);
    }
  };

  const handleCloseDetail = () => {
    setDetailOrder(null);
    if (onClearSelectedOrder) onClearSelectedOrder();
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-[#2C1810] tracking-tight">Historial de Ventas y Pedidos</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#4A6B53] font-semibold border border-[#E8DFD5]">
              {orders.length} pedidos totales
            </span>
          </div>
          <p className="text-xs text-[#6B5A4E] mt-1">
            Consulta detalles de compras de camas para perros, pagos recibidos, saldo pendiente y estado logístico.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#4A6B53]/10 text-[#4A6B53] font-semibold border border-[#4A6B53]/20 flex items-center gap-1.5">
            <Dog className="w-3.5 h-3.5" />
            {orders.filter((o) => o.orderStatus !== 'CANCELADO').length} Activos
          </span>
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2] text-[#C25E42] font-semibold border border-[#E8DFD5]">
            {orders.filter((o) => o.balancePending > 0 && o.orderStatus !== 'CANCELADO').length} Con Saldo
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por folio (VTA-...), cliente, perrito o cama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#4A6B53]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs text-[#2C1810]"
            >
              <option value="ALL">Todos los Estados de Pedido</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="LISTO_RECOGER">Listo para Retirar</option>
              <option value="EN_CAMINO">En Camino / En Reparto</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs text-[#2C1810]"
            >
              <option value="ALL">Todo Estado de Cobro</option>
              <option value="PAID">Totalmente Liquidados</option>
              <option value="PENDING">Con Saldo Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#FFFDF9] p-12 rounded-2xl border border-[#E8DFD5] text-center text-[#8C7A6B] space-y-2">
          <ClipboardList className="w-10 h-10 mx-auto text-[#8C7A6B]/50" />
          <p className="text-sm font-bold text-[#2C1810]">No se encontraron pedidos de camas</p>
          <p className="text-xs text-[#6B5A4E]">Prueba modificando tus términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DFD5] text-[#4A3B32] uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Folio y Fecha</th>
                  <th className="py-3 px-4">Cliente / Mascota</th>
                  <th className="py-3 px-4">Camas Vendidas</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Saldo Pend.</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Entrega</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD5]/70">
                {filteredOrders.map((ord) => {
                  let statusBadge: { label: string; color: string } = { label: ord.orderStatus, color: 'bg-stone-100 text-stone-800' };
                  if (ord.orderStatus === 'COMPLETADO') statusBadge = { label: 'Completado', color: 'bg-[#4A6B53]/15 text-[#4A6B53] font-bold' };
                  if (ord.orderStatus === 'CONFIRMADO') statusBadge = { label: 'Confirmado', color: 'bg-blue-100 text-blue-900 font-bold' };
                  if (ord.orderStatus === 'CANCELADO') statusBadge = { label: 'Cancelado', color: 'bg-red-100 text-red-900 font-bold' };
                  if (ord.orderStatus === 'LISTO_RECOGER') statusBadge = { label: 'Listo Tienda', color: 'bg-amber-100 text-amber-900 font-bold' };
                  if (ord.orderStatus === 'EN_CAMINO') statusBadge = { label: 'En Camino', color: 'bg-indigo-100 text-indigo-900 font-bold' };

                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#2C1810] text-xs block">
                          {ord.folio}
                        </span>
                        <span className="text-[10px] text-[#8C7A6B]">
                          {new Date(ord.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#2C1810]">{ord.customerName}</p>
                        {ord.customerPetName ? (
                          <div className="flex items-center gap-1 text-[11px] text-[#4A6B53] font-semibold">
                            <Dog className="w-3 h-3" />
                            <span>Para: {ord.customerPetName}</span>
                          </div>
                        ) : (
                          <p className="text-[10px] font-mono text-[#8C7A6B]">{ord.customerPhone}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#4A3B32] max-w-xs truncate">
                        {ord.items.map((i) => `${i.quantity}x ${i.productName} (${i.size || 'M'})`).join(', ')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2C1810] tabular-nums">
                        ${ord.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {ord.balancePending > 0 ? (
                          <span className="text-[#C25E42] font-bold">
                            ${ord.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-[#4A6B53] font-semibold">Liquidado</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {ord.delivery.required ? (
                          <span className="text-[11px] text-[#4A3B32] font-medium flex items-center justify-center gap-1">
                            <Truck className="w-3 h-3 text-[#4A6B53]" />
                            {ord.delivery.status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8C7A6B]">Retiro Mostrador</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintOrder(ord)}
                            className="p-1.5 text-[#6B5A4E] hover:text-[#2C1810] hover:bg-[#F0EAE1] rounded-lg transition-colors"
                            title="Reimprimir Comprobante DogZzz"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDetailOrder(ord)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#4A6B53] bg-[#4A6B53]/10 hover:bg-[#4A6B53]/20 rounded-xl border border-[#4A6B53]/25 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Ficha</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#E8DFD5] p-6 space-y-5 my-6 text-[#2C1810] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD5]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-[#2C1810]">
                    Pedido {detailOrder.folio}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A6B53]/15 text-[#4A6B53]">
                    {detailOrder.orderStatus}
                  </span>
                  {detailOrder.customerPetName && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C25E42]/15 text-[#C25E42] flex items-center gap-1">
                      <Dog className="w-3 h-3" />
                      Mascota: {detailOrder.customerPetName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Emitido el {new Date(detailOrder.createdAt).toLocaleString('es-MX')} · Registrado por {detailOrder.createdBy}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPrintOrder(detailOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A3B32] bg-[#FAF7F2] hover:bg-[#F0EAE1] rounded-xl border border-[#E8DFD5]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Comprobante</span>
                </button>
                <button onClick={handleCloseDetail} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
              {/* Customer & General Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                <div>
                  <h4 className="font-bold text-[#4A3B32] uppercase text-[11px] mb-1.5">CLIENTE Y PERRITO</h4>
                  <p className="font-bold text-[#2C1810] text-sm">{detailOrder.customerName}</p>
                  {detailOrder.customerPetName && (
                    <p className="text-[#4A6B53] font-semibold flex items-center gap-1 mt-0.5">
                      <Heart className="w-3 h-3 text-[#C25E42]" />
                      Perrito: {detailOrder.customerPetName}
                    </p>
                  )}
                  <p className="text-[#6B5A4E] font-mono mt-0.5">Tel: {detailOrder.customerPhone}</p>
                  <p className="text-[#6B5A4E] mt-1">{detailOrder.customerAddress || 'Sin dirección registrada'}</p>
                </div>

                <div>
                  <h4 className="font-bold text-[#4A3B32] uppercase text-[11px] mb-1.5">MODALIDAD DE ENTREGA</h4>
                  {detailOrder.delivery.required ? (
                    <div className="space-y-0.5 text-[#4A3B32]">
                      <p>
                        <strong>Estado:</strong>{' '}
                        <span className="font-semibold text-[#4A6B53]">{detailOrder.delivery.status}</span>
                      </p>
                      <p>
                        <strong>Fecha programada:</strong> {detailOrder.delivery.scheduledDate || 'Por acordar'} ({detailOrder.delivery.timeSlot || 'Horario abierto'})
                      </p>
                      <p>
                        <strong>Dirección:</strong> {detailOrder.delivery.address}
                      </p>
                      {detailOrder.delivery.deliveryNotes && (
                        <p className="text-[#6B5A4E] italic">
                          <strong>Referencias:</strong> {detailOrder.delivery.deliveryNotes}
                        </p>
                      )}
                      {detailOrder.delivery.deliveredAt && (
                        <p className="text-[#4A6B53] font-medium pt-1">
                          <strong>Entregado el:</strong> {new Date(detailOrder.delivery.deliveredAt).toLocaleString('es-MX')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#6B5A4E]">Retiro directo en piso de tienda por el cliente.</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-[#2C1810] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-[#4A6B53]" />
                  Camas para Perros del Pedido
                </h4>
                <div className="border border-[#E8DFD5] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[#4A3B32] border-b border-[#E8DFD5] font-bold">
                      <tr>
                        <th className="p-2.5">Modelo y Variante</th>
                        <th className="p-2.5 text-center">Talla</th>
                        <th className="p-2.5 text-center">Color</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Precio Unit.</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD5]/60 bg-white">
                      {detailOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5">
                            <p className="font-bold text-[#2C1810]">{item.productName}</p>
                            <span className="text-[10px] text-[#8C7A6B] font-mono">
                              {item.productSku} · {item.material}
                            </span>
                            {item.dimensions && (
                              <span className="block text-[10px] text-[#4A6B53]">
                                Medidas: {item.dimensions}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-bold text-[#4A6B53]">{item.size || 'Estándar'}</td>
                          <td className="p-2.5 text-center text-[#6B5A4E]">{item.color || 'Estándar'}</td>
                          <td className="p-2.5 text-center font-bold text-[#2C1810]">{item.quantity}</td>
                          <td className="p-2.5 text-right font-mono text-[#4A3B32]">
                            ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#2C1810]">
                            ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E8DFD5]">
                {/* Payments Log */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#2C1810] uppercase tracking-wider text-[11px]">
                      Historial de Pagos y Abonos
                    </h4>
                    {detailOrder.balancePending > 0 && detailOrder.orderStatus !== 'CANCELADO' && (
                      <button
                        onClick={() => {
                          setAbonoAmount(detailOrder.balancePending);
                          setShowAbonoModal(true);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#4A6B53] hover:bg-[#3D5944] px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Registrar Abono</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {detailOrder.payments.map((p) => (
                      <div key={p.id} className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#2C1810] font-mono">
                            ${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </p>
                          <p className="text-[10px] text-[#6B5A4E]">
                            {p.method} · {new Date(p.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {p.notes && <p className="text-[10px] text-[#8C7A6B] italic">{p.notes}</p>}
                        </div>
                        <span className="text-[10px] text-[#8C7A6B] font-medium">{p.registeredBy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
                  <div className="flex justify-between text-[#6B5A4E]">
                    <span>Subtotal Camas:</span>
                    <span className="font-mono tabular-nums">${detailOrder.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {detailOrder.discount > 0 && (
                    <div className="flex justify-between text-[#4A6B53]">
                      <span>Descuento aplicado:</span>
                      <span className="font-mono tabular-nums">-${detailOrder.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {detailOrder.deliveryFee > 0 && (
                    <div className="flex justify-between text-[#6B5A4E]">
                      <span>Envío a domicilio:</span>
                      <span className="font-mono tabular-nums">${detailOrder.deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#2C1810] text-sm pt-2 border-t border-[#E8DFD5]">
                    <span>TOTAL DEL PEDIDO:</span>
                    <span className="font-mono">${detailOrder.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                  <div className="flex justify-between text-[#4A6B53] font-semibold pt-1">
                    <span>Total Pagado:</span>
                    <span className="font-mono">${detailOrder.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1">
                    <span>Saldo Restante:</span>
                    <span className={`font-mono ${detailOrder.balancePending > 0 ? 'text-[#C25E42]' : 'text-[#4A6B53]'}`}>
                      ${detailOrder.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions row: status change or cancel */}
              <div className="pt-3 border-t border-[#E8DFD5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#6B5A4E]">Actualizar Estado:</span>
                  <select
                    value={detailOrder.orderStatus}
                    onChange={(e) => {
                      updateOrderStatus(detailOrder.id, e.target.value as OrderStatus);
                      const refreshed = orders.find((o) => o.id === detailOrder.id);
                      if (refreshed) setDetailOrder({ ...refreshed, orderStatus: e.target.value as OrderStatus });
                    }}
                    className="px-2.5 py-1 bg-white border border-[#E8DFD5] rounded-xl text-xs font-semibold"
                  >
                    <option value="PENDIENTE">PENDIENTE</option>
                    <option value="CONFIRMADO">CONFIRMADO</option>
                    <option value="LISTO_RECOGER">LISTO PARA RETIRAR</option>
                    <option value="EN_CAMINO">EN CAMINO</option>
                    <option value="COMPLETADO">COMPLETADO</option>
                  </select>
                </div>

                {detailOrder.orderStatus !== 'CANCELADO' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl border border-red-200 transition-colors font-medium flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancelar Pedido</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABONO MODAL */}
      {showAbonoModal && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-md w-full border border-[#E8DFD5] p-5 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD5]">
              <h3 className="font-bold text-sm text-[#2C1810]">Registrar Abono a Pedido {detailOrder.folio}</h3>
              <button onClick={() => setShowAbonoModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAbonoSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                <span className="text-[11px] text-[#6B5A4E]">Saldo pendiente actual:</span>
                <p className="text-base font-bold text-[#C25E42] font-mono">
                  ${detailOrder.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Monto a Abonar ($ MXN) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={detailOrder.balancePending}
                  value={abonoAmount}
                  onChange={(e) => setAbonoAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono text-base font-bold bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Forma de Pago *</label>
                <select
                  value={abonoMethod}
                  onChange={(e) => setAbonoMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Transferencia / SPEI">Transferencia / SPEI</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Notas o Referencia</label>
                <input
                  type="text"
                  placeholder="Ej. Liquidación contra entrega de cama"
                  value={abonoNotes}
                  onChange={(e) => setAbonoNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setShowAbonoModal(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944]"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancelModal && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-md w-full border border-red-200 p-5 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-2 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Cancelar Pedido {detailOrder.folio}</h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B5A4E]">
              Al cancelar este pedido, las camas y sus variantes se <strong>reintegrarán automáticamente al inventario disponible</strong> de DogZzz.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Motivo de Cancelación *</label>
                <textarea
                  placeholder="Ej. El cliente requería una talla diferente o canceló por cambio de domicilio..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                >
                  Proceder con Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
