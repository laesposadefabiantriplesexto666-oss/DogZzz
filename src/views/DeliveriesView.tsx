import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, DeliveryStatus, DeliveryDetails } from '../types';
import {
  Truck,
  Calendar,
  List,
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CalendarDays,
  User,
  X,
  FileCheck,
  Send,
  Dog,
  Heart
} from 'lucide-react';

interface DeliveriesViewProps {
  onSelectOrder: (order: Order) => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({ onSelectOrder }) => {
  const { orders, updateDeliveryStatus, currentUser } = useApp();

  const todayStr = '2026-10-24'; // System date

  // View mode
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [reschedulingOrder, setReschedulingOrder] = useState<Order | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('10:00 - 14:00');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [deliveringOrder, setDeliveringOrder] = useState<Order | null>(null);
  const [deliveryProofNotes, setDeliveryProofNotes] = useState('');

  const [failedOrder, setFailedOrder] = useState<Order | null>(null);
  const [failureReason, setFailureReason] = useState('');

  // Only orders requiring delivery
  const deliveryOrders = orders.filter((o) => o.delivery.required);

  const filteredDeliveries = deliveryOrders.filter((ord) => {
    const d = ord.delivery;
    const s = searchTerm.toLowerCase();

    const matchesSearch =
      ord.folio.toLowerCase().includes(s) ||
      ord.customerName.toLowerCase().includes(s) ||
      (ord.customerPetName && ord.customerPetName.toLowerCase().includes(s)) ||
      d.address.toLowerCase().includes(s) ||
      ord.customerPhone.includes(s);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') {
      return ['PROGRAMADA', 'EN_PREPARACION', 'EN_CAMINO', 'REPROGRAMADA', 'SIN_PROGRAMAR'].includes(d.status);
    }
    if (statusFilter === 'TODAY') {
      return d.scheduledDate === todayStr && d.status !== 'CANCELADA';
    }
    if (statusFilter === 'DELAYED') {
      return d.scheduledDate && d.scheduledDate < todayStr && !['ENTREGADA', 'CANCELADA'].includes(d.status);
    }
    if (statusFilter === 'COMPLETED') {
      return d.status === 'ENTREGADA';
    }
    if (statusFilter !== 'ALL') {
      return d.status === statusFilter;
    }

    return true;
  }).sort((a, b) => {
    const dateA = a.delivery.scheduledDate || '9999-99-99';
    const dateB = b.delivery.scheduledDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  // Calendar groupings (group by scheduledDate)
  const calendarDays: Record<string, Order[]> = {};
  deliveryOrders.forEach((o) => {
    if (o.delivery.scheduledDate) {
      if (!calendarDays[o.delivery.scheduledDate]) {
        calendarDays[o.delivery.scheduledDate] = [];
      }
      calendarDays[o.delivery.scheduledDate].push(o);
    }
  });

  const sortedDates = Object.keys(calendarDays).sort();

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingOrder || !newScheduleDate) return;

    updateDeliveryStatus(
      reschedulingOrder.id,
      {
        status: 'REPROGRAMADA',
        scheduledDate: newScheduleDate,
        timeSlot: newTimeSlot,
        failureReason: rescheduleReason.trim() || undefined
      },
      `Entrega de cama reprogramada para el ${newScheduleDate} (${newTimeSlot}). Motivo: ${rescheduleReason}`
    );

    setReschedulingOrder(null);
    setRescheduleReason('');
  };

  const handleMarkDelivered = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringOrder) return;

    updateDeliveryStatus(
      deliveringOrder.id,
      {
        status: 'ENTREGADA',
        deliveredAt: new Date().toISOString(),
        deliveryNotes: deliveryProofNotes.trim() || 'Cama canina entregada y recibida conforme por el dueño'
      },
      `Entrega completada exitosamente. ${deliveryProofNotes}`
    );

    setDeliveringOrder(null);
    setDeliveryProofNotes('');
  };

  const handleMarkFailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failedOrder || !failureReason.trim()) return;

    updateDeliveryStatus(
      failedOrder.id,
      {
        status: 'NO_ENTREGADA',
        failureReason: failureReason.trim()
      },
      `Intento de entrega fallido: ${failureReason}`
    );

    setFailedOrder(null);
    setFailureReason('');
  };

  return (
    <div className="space-y-5 text-[#2C1810]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-[#2C1810] tracking-tight">
              Logística y Entregas a Domicilio DogZzz
            </h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#4A6B53] font-semibold border border-[#E8DFD5]">
              {deliveryOrders.length} envíos
            </span>
          </div>
          <p className="text-xs text-[#6B5A4E] mt-1">
            Gestión de rutas de despacho de camas caninas, fechas programadas, notas sobre mascotas y confirmación de entrega.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista de Envíos</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'calendar' ? 'bg-white shadow-xs text-[#2C1810]' : 'text-[#8C7A6B] hover:text-[#2C1810]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda por Día</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por folio, cliente, perrito o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#4A6B53]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-[#4A6B53] text-white border-[#4A6B53]'
                  : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E8DFD5] hover:bg-[#F0EAE1]'
              }`}
            >
              Pendientes Activas
            </button>
            <button
              onClick={() => setStatusFilter('TODAY')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                statusFilter === 'TODAY'
                  ? 'bg-[#2C1810] text-white border-[#2C1810]'
                  : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E8DFD5] hover:bg-[#F0EAE1]'
              }`}
            >
              Para Hoy
            </button>
            <button
              onClick={() => setStatusFilter('DELAYED')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                statusFilter === 'DELAYED'
                  ? 'bg-[#C25E42] text-white border-[#C25E42]'
                  : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E8DFD5] hover:bg-[#F0EAE1]'
              }`}
            >
              Atrasadas
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-[#4A6B53] text-white border-[#4A6B53]'
                  : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E8DFD5] hover:bg-[#F0EAE1]'
              }`}
            >
              Entregadas
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-stone-700 text-white border-stone-700'
                  : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E8DFD5] hover:bg-[#F0EAE1]'
              }`}
            >
              Todas
            </button>
          </div>
        </div>
      </div>

      {/* Main Delivery Views */}
      {viewMode === 'list' ? (
        filteredDeliveries.length === 0 ? (
          <div className="bg-[#FFFDF9] p-12 rounded-2xl border border-[#E8DFD5] text-center text-[#8C7A6B] space-y-2">
            <Truck className="w-10 h-10 mx-auto text-[#8C7A6B]/50" />
            <p className="text-sm font-bold text-[#2C1810]">No hay entregas con este criterio</p>
            <p className="text-xs text-[#6B5A4E]">Prueba modificando los filtros de fecha o estado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeliveries.map((ord) => {
              const d = ord.delivery;
              const isToday = d.scheduledDate === todayStr && d.status !== 'ENTREGADA';
              const isDelayed = d.scheduledDate && d.scheduledDate < todayStr && !['ENTREGADA', 'CANCELADA'].includes(d.status);

              let statusBadge: { label: string; color: string } = { label: d.status, color: 'bg-stone-100 text-stone-800' };
              if (d.status === 'PROGRAMADA') statusBadge = { label: 'Programada', color: 'bg-blue-100 text-blue-900' };
              if (d.status === 'EN_CAMINO') statusBadge = { label: 'En Camioneta DogZzz', color: 'bg-amber-100 text-amber-900 font-bold' };
              if (d.status === 'ENTREGADA') statusBadge = { label: 'Entregada Conforme', color: 'bg-[#4A6B53]/15 text-[#4A6B53] font-bold' };
              if (d.status === 'REPROGRAMADA') statusBadge = { label: 'Reprogramada', color: 'bg-purple-100 text-purple-900' };
              if (d.status === 'NO_ENTREGADA') statusBadge = { label: 'No Entregada / Intento Fallido', color: 'bg-rose-100 text-rose-900 font-bold' };

              return (
                <div
                  key={ord.id}
                  className={`bg-[#FFFDF9] rounded-2xl border p-4.5 shadow-xs transition-all ${
                    isDelayed
                      ? 'border-red-300 ring-2 ring-red-100'
                      : isToday
                      ? 'border-[#4A6B53]/60 ring-2 ring-[#4A6B53]/15'
                      : 'border-[#E8DFD5] hover:border-[#4A6B53]/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#2C1810]">{ord.folio}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {isDelayed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C25E42] text-white">
                            ¡ATRASADA!
                          </span>
                        )}
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A6B53] text-white">
                            ENTREGA HOY
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#4A3B32]">
                        <div>
                          <p className="font-bold text-[#2C1810] text-sm">{ord.customerName}</p>
                          {ord.customerPetName && (
                            <p className="text-[#4A6B53] font-semibold flex items-center gap-1 mt-0.5">
                              <Dog className="w-3.5 h-3.5" />
                              Perrito: {ord.customerPetName}
                            </p>
                          )}
                          <p className="text-[#6B5A4E] font-mono mt-0.5">Tel: {ord.customerPhone}</p>
                          <div className="flex items-start gap-1.5 mt-1 text-[#6B5A4E]">
                            <MapPin className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0 mt-0.5" />
                            <p className="line-clamp-2">{d.address}</p>
                          </div>
                          {d.references && (
                            <p className="text-[11px] text-[#8C7A6B] mt-0.5 pl-5">
                              Ref: {d.references}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[#2C1810]">
                            <Calendar className="w-3.5 h-3.5 text-[#8C7A6B]" />
                            <span className="font-semibold">Fecha:</span>{' '}
                            <span>{d.scheduledDate || 'Sin fecha asignada'}</span>
                            {d.timeSlot && <span className="text-[#6B5A4E] font-mono">({d.timeSlot})</span>}
                          </div>

                          <div className="flex items-center gap-1.5 text-[#2C1810]">
                            <Dog className="w-3.5 h-3.5 text-[#4A6B53]" />
                            <span className="font-semibold">Camas:</span>{' '}
                            <span className="truncate">
                              {ord.items.map((i) => `${i.quantity}x ${i.productName} (${i.size || 'M'})`).join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[#2C1810]">
                            <User className="w-3.5 h-3.5 text-[#8C7A6B]" />
                            <span className="font-semibold">Repartidor:</span>{' '}
                            <span>{d.assignedDriver || 'Repartidor DogZzz en turno'}</span>
                          </div>

                          {ord.balancePending > 0 && (
                            <div className="p-1.5 bg-[#C25E42]/10 rounded-lg border border-[#C25E42]/20 text-[#C25E42] font-semibold inline-block text-[11px]">
                              Cobrar saldo al entregar: ${ord.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </div>
                          )}

                          {d.failureReason && (
                            <p className="text-red-700 text-[11px] font-medium">
                              Nota de incidencia: {d.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Operational Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8DFD5]">
                      {d.status !== 'ENTREGADA' && d.status !== 'CANCELADA' && (
                        <>
                          {d.status !== 'EN_CAMINO' && (
                            <button
                              onClick={() => updateDeliveryStatus(ord.id, { status: 'EN_CAMINO' }, 'Camioneta DogZzz en ruta hacia el domicilio')}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2C1810] text-white hover:bg-[#1A0E0A] transition-colors shadow-xs"
                            >
                              Marcar En Camino
                            </button>
                          )}

                          <button
                            onClick={() => setDeliveringOrder(ord)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#4A6B53] text-white hover:bg-[#3D5944] transition-colors shadow-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Marcar Entregada
                          </button>

                          <button
                            onClick={() => {
                              setReschedulingOrder(ord);
                              setNewScheduleDate(d.scheduledDate || todayStr);
                              setNewTimeSlot(d.timeSlot || '10:00 - 14:00');
                            }}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] text-[#4A3B32] hover:bg-[#F0EAE1] border border-[#E8DFD5] transition-colors"
                          >
                            Reprogramar Fecha
                          </button>

                          <button
                            onClick={() => setFailedOrder(ord)}
                            className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Registrar intento fallido
                          </button>
                        </>
                      )}

                      {d.status === 'ENTREGADA' && (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs text-[#4A6B53] font-bold">
                            <CheckCircle2 className="w-4 h-4 text-[#4A6B53]" />
                            Entregada Satisfactoriamente
                          </span>
                          {d.deliveredAt && (
                            <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                              {new Date(d.deliveredAt).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => onSelectOrder(ord)}
                        className="text-xs text-[#4A6B53] font-medium hover:underline mt-1"
                      >
                        Ver expediente de pedido →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* CALENDAR / AGENDA VIEW */
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] text-xs text-[#4A3B32] flex items-center justify-between">
            <span className="font-medium">
              Agenda de entregas de camas caninas organizadas por día.
            </span>
            <span className="font-bold text-[#4A6B53]">{sortedDates.length} fecha(s) programada(s)</span>
          </div>

          <div className="space-y-5">
            {sortedDates.map((dateKey) => {
              const dayDeliveries = calendarDays[dateKey];
              const isToday = dateKey === todayStr;
              const isPast = dateKey < todayStr;

              return (
                <div key={dateKey} className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-[#4A6B53]" />
                      <h3 className="text-sm font-bold text-[#2C1810]">
                        {new Date(dateKey + 'T12:00:00Z').toLocaleDateString('es-MX', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      {isToday && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A6B53] text-white">
                          HOY
                        </span>
                      )}
                      {isPast && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                          FECHA PASADA
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#4A6B53]">
                      {dayDeliveries.length} entrega(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayDeliveries.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl border border-[#E8DFD5] bg-[#FAF7F2]/60 hover:bg-white hover:border-[#4A6B53]/50 text-xs space-y-2 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[#2C1810]">{ord.folio}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-[#E8DFD5] text-[#4A3B32]">
                            {ord.delivery.status}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-[#2C1810]">{ord.customerName}</p>
                          {ord.customerPetName && (
                            <p className="text-[11px] text-[#4A6B53] font-semibold flex items-center gap-1 mt-0.5">
                              <Dog className="w-3 h-3" />
                              {ord.customerPetName}
                            </p>
                          )}
                          <p className="text-[11px] text-[#6B5A4E] font-mono">{ord.customerPhone}</p>
                        </div>
                        <p className="text-[#6B5A4E] line-clamp-1">{ord.delivery.address}</p>
                        <p className="text-[11px] text-[#8C7A6B]">
                          Horario: <strong>{ord.delivery.timeSlot || 'Por definir'}</strong>
                        </p>
                        <button
                          onClick={() => onSelectOrder(ord)}
                          className="w-full text-center py-1.5 bg-white border border-[#E8DFD5] rounded-xl text-[#4A3B32] font-semibold hover:bg-[#FAF7F2] mt-1"
                        >
                          Gestionar Entrega
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Reprogramar Entrega */}
      {reschedulingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-md w-full border border-[#E8DFD5] p-6 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
              <h3 className="font-bold text-sm text-[#2C1810]">Reprogramar Entrega a Domicilio</h3>
              <button onClick={() => setReschedulingOrder(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-[#4A3B32] mb-1">
                  Pedido: <strong>{reschedulingOrder.folio}</strong> · {reschedulingOrder.customerName}
                </p>
                <p className="text-[#8C7A6B] text-[11px]">
                  Fecha anterior: {reschedulingOrder.delivery.scheduledDate || 'Sin fecha previa'}
                </p>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Nueva Fecha Programada *</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Nuevo Horario o Turno</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white"
                >
                  <option value="10:00 - 14:00">10:00 - 14:00 (Matutino)</option>
                  <option value="14:00 - 18:00">14:00 - 18:00 (Vespertino)</option>
                  <option value="Todo el día">Horario Abierto / Por coordinar</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Motivo de la Reprogramación</label>
                <textarea
                  placeholder="Ej. Solicitado por el cliente por horario de trabajo, o ajuste de ruta..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingOrder(null)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944]"
                >
                  Guardar Nueva Fecha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Marcar como Entregada */}
      {deliveringOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-md w-full border border-[#E8DFD5] p-6 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
              <h3 className="font-bold text-sm text-[#2C1810]">Confirmar Entrega de Cama Canina</h3>
              <button onClick={() => setDeliveringOrder(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkDelivered} className="space-y-4 text-xs">
              <div className="p-3 bg-[#4A6B53]/10 rounded-xl border border-[#4A6B53]/25 text-[#2C1810]">
                <p className="font-semibold text-sm">Pedido {deliveringOrder.folio}</p>
                <p className="text-[11px] mt-0.5 text-[#4A3B32]">
                  Cliente: {deliveringOrder.customerName} {deliveringOrder.customerPetName && `(Perrito: ${deliveringOrder.customerPetName})`}
                </p>
                <p className="text-[11px] mt-0.5 text-[#6B5A4E]">
                  Se registrará la fecha y hora actual como momento exacto de recepción conforme.
                </p>
              </div>

              {deliveringOrder.balancePending > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <p className="font-bold">¡Recordatorio de Cobro de Saldo!</p>
                  <p className="text-[11px] mt-0.5">
                    Este pedido tiene un saldo pendiente de ${deliveringOrder.balancePending.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">
                  Notas de Entrega / Nombre de quien recibió
                </label>
                <textarea
                  placeholder="Ej. Recibido por la dueña. El perrito Rocky probó la cama y quedó perfecta."
                  value={deliveryProofNotes}
                  onChange={(e) => setDeliveryProofNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveringOrder(null)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944]"
                >
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Intento Fallido */}
      {failedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-md w-full border border-red-200 p-6 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-3 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Registrar Intento de Entrega Fallido</h3>
              </div>
              <button onClick={() => setFailedOrder(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkFailed} className="space-y-4 text-xs">
              <p className="text-[#6B5A4E]">
                Indica el motivo por el cual no se pudo entregar la cama canina del pedido <strong>{failedOrder.folio}</strong>:
              </p>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Motivo del Fallo *</label>
                <textarea
                  placeholder="Ej. No se encontró al dueño en el domicilio tras 20 min de espera..."
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl text-xs bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFailedOrder(null)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700"
                >
                  Registrar Fallo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
