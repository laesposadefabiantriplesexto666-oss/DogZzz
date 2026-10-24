import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, Order } from '../types';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  Clock,
  Edit2,
  X,
  FileText,
  Dog,
  Heart
} from 'lucide-react';

interface CustomersViewProps {
  onOpenNewCustomerModal: () => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenNewCustomerModal,
  onSelectOrder
}) => {
  const { customers, orders, updateCustomer } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customers[0]?.id || null
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Search filter
  const filteredCustomers = customers.filter((cust) => {
    const s = searchTerm.toLowerCase();
    return (
      cust.fullName.toLowerCase().includes(s) ||
      (cust.petName && cust.petName.toLowerCase().includes(s)) ||
      (cust.petBreed && cust.petBreed.toLowerCase().includes(s)) ||
      cust.phone.includes(s) ||
      (cust.email && cust.email.toLowerCase().includes(s)) ||
      cust.deliveryAddress.toLowerCase().includes(s)
    );
  });

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || null;

  // Active customer's orders
  const customerOrders = activeCustomer
    ? orders.filter((o) => o.customerId === activeCustomer.id)
    : [];

  const totalSpent = customerOrders
    .filter((o) => o.orderStatus !== 'CANCELADO')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOutstandingBalance = customerOrders
    .filter((o) => o.orderStatus !== 'CANCELADO')
    .reduce((sum, o) => sum + o.balancePending, 0);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer(editingCustomer.id, editingCustomer);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-[#2C1810] tracking-tight">Directorio de Dueños y Mascotas</h1>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#4A6B53] font-semibold border border-[#E8DFD5]">
              {customers.length} registrados
            </span>
          </div>
          <p className="text-xs text-[#6B5A4E] mt-1">
            Consulta los datos del dueño, el nombre y raza de su perrito, referencias de entrega y saldos.
          </p>
        </div>

        <button
          onClick={onOpenNewCustomerModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#4A6B53] hover:bg-[#3D5944] rounded-xl shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Dueño y Mascota</span>
        </button>
      </div>

      {/* 2-Column Customer Directory & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left List Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] shadow-xs p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por dueño, perrito, raza o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DFD5] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#4A6B53]"
            />
          </div>

          {/* Customers list */}
          <div className="divide-y divide-[#E8DFD5]/60 max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C7A6B]">
                No se encontraron clientes con esos datos.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = activeCustomer?.id === cust.id;
                const custOrdersCount = orders.filter((o) => o.customerId === cust.id).length;
                const custBalance = orders
                  .filter((o) => o.customerId === cust.id && o.orderStatus !== 'CANCELADO')
                  .reduce((sum, o) => sum + o.balancePending, 0);

                return (
                  <button
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start justify-between gap-2 my-1 ${
                      isSelected
                        ? 'bg-[#4A6B53]/10 border-l-4 border-[#4A6B53]'
                        : 'hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#2C1810] text-xs truncate leading-snug">
                        {cust.fullName}
                      </p>

                      {cust.petName && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#4A6B53] font-semibold">
                          <Dog className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {cust.petName} {cust.petBreed && `(${cust.petBreed})`}
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] font-mono text-[#6B5A4E] mt-0.5">
                        {cust.phone}
                      </p>
                      <p className="text-[11px] text-[#8C7A6B] truncate mt-0.5">
                        {cust.deliveryAddress || 'Sin dirección registrada'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#4A3B32] border border-[#E8DFD5]">
                        {custOrdersCount} compras
                      </span>
                      {custBalance > 0 && (
                        <p className="text-[10px] font-mono font-bold text-[#C25E42] mt-1">
                          Saldo: ${custBalance.toLocaleString('es-MX')}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeCustomer ? (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] shadow-xs p-6 space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#E8DFD5] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#2C1810]">{activeCustomer.fullName}</h2>
                  {activeCustomer.petName && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A6B53]/15 text-[#4A6B53]">
                        <Dog className="w-3.5 h-3.5" />
                        Perrito: {activeCustomer.petName}
                      </span>
                      {activeCustomer.petBreed && (
                        <span className="text-xs text-[#6B5A4E]">
                          • Raza: {activeCustomer.petBreed}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-[#8C7A6B] mt-1">
                    Cliente registrado el {new Date(activeCustomer.createdAt).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setEditingCustomer(activeCustomer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#4A3B32] bg-[#FAF7F2] hover:bg-[#F0EAE1] rounded-xl border border-[#E8DFD5] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Datos</span>
                </button>
              </div>

              {/* Financial Quick Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                  <span className="text-[11px] text-[#6B5A4E] font-medium">Compras Totales</span>
                  <p className="text-base font-bold text-[#2C1810] font-mono mt-0.5">
                    ${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                  <span className="text-[11px] text-[#6B5A4E] font-medium">Saldo Pendiente</span>
                  <p className={`text-base font-bold font-mono mt-0.5 ${totalOutstandingBalance > 0 ? 'text-[#C25E42]' : 'text-[#4A6B53]'}`}>
                    ${totalOutstandingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-[#6B5A4E] font-medium">Camas Compradas</span>
                  <p className="text-base font-bold text-[#2C1810] font-mono mt-0.5">
                    {customerOrders.length} pedido(s)
                  </p>
                </div>
              </div>

              {/* Contact & Delivery Details */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-[#2C1810] uppercase tracking-wider text-[11px]">
                  Información de Entrega y Mascota
                </h3>

                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2.5">
                  <div className="flex items-start gap-2.5 text-[#4A3B32]">
                    <Phone className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#2C1810]">Teléfono / WhatsApp:</span>{' '}
                      <span className="font-mono">{activeCustomer.phone}</span>
                    </div>
                  </div>

                  {activeCustomer.email && (
                    <div className="flex items-start gap-2.5 text-[#4A3B32]">
                      <Mail className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2C1810]">Correo Electrónico:</span>{' '}
                        <span>{activeCustomer.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 text-[#4A3B32]">
                    <MapPin className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#2C1810]">Dirección de Entrega:</span>{' '}
                      <span>{activeCustomer.deliveryAddress || 'No especificada'}</span>
                    </div>
                  </div>

                  {activeCustomer.addressReferences && (
                    <div className="flex items-start gap-2.5 text-[#4A3B32] pt-1 border-t border-[#E8DFD5]">
                      <FileText className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#2C1810]">Referencias del Domicilio:</span>{' '}
                        <p className="text-[#6B5A4E] mt-0.5 leading-relaxed">{activeCustomer.addressReferences}</p>
                      </div>
                    </div>
                  )}

                  {activeCustomer.notes && (
                    <div className="text-[#6B5A4E] text-[11px] pt-1">
                      <strong>Notas internas:</strong> {activeCustomer.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#2C1810] uppercase tracking-wider text-[11px]">
                  Historial de Pedidos de Camas ({customerOrders.length})
                </h3>

                {customerOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8C7A6B] bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                    Este cliente aún no tiene pedidos de camas registrados.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] hover:border-[#4A6B53]/50 flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#2C1810]">{ord.folio}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E8DFD5] font-semibold text-[#4A3B32]">
                              {ord.orderStatus}
                            </span>
                            {ord.customerPetName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A6B53]/15 text-[#4A6B53] font-semibold flex items-center gap-1">
                                <Dog className="w-3 h-3" />
                                {ord.customerPetName}
                              </span>
                            )}
                          </div>
                          <p className="text-[#6B5A4E] text-[11px] mt-1 truncate">
                            {ord.items.map((i) => `${i.quantity}x ${i.productName} (${i.size || 'Estándar'})`).join(', ')}
                          </p>
                          <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                            {new Date(ord.createdAt).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-[#2C1810]">
                            ${ord.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                          {ord.balancePending > 0 ? (
                            <p className="text-[10px] text-[#C25E42] font-bold">
                              Saldo: ${ord.balancePending.toLocaleString('es-MX')}
                            </p>
                          ) : (
                            <p className="text-[10px] text-[#4A6B53] font-semibold">Liquidado</p>
                          )}
                          <button
                            onClick={() => onSelectOrder(ord)}
                            className="text-[11px] text-[#4A6B53] font-semibold hover:underline mt-1 block"
                          >
                            Ver detalle →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E8DFD5] p-12 text-center text-[#8C7A6B]">
              Selecciona un cliente de la lista para ver sus datos y pedidos de camas DogZzz.
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-xl max-w-lg w-full border border-[#E8DFD5] p-6 space-y-4 text-[#2C1810]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
              <div className="flex items-center gap-2">
                <Dog className="w-5 h-5 text-[#4A6B53]" />
                <h3 className="font-bold text-[#2C1810] text-sm">Editar Datos de Dueño y Mascota</h3>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Nombre Completo del Dueño *</label>
                <input
                  type="text"
                  value={editingCustomer.fullName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                  required
                />
              </div>

              {/* Pet Info */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5]">
                <div>
                  <label className="block text-[#4A3B32] font-semibold mb-1">Nombre del Perrito</label>
                  <input
                    type="text"
                    value={editingCustomer.petName || ''}
                    placeholder="Ej. Rocky"
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, petName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-semibold mb-1">Raza o Tipo</label>
                  <input
                    type="text"
                    value={editingCustomer.petBreed || ''}
                    placeholder="Ej. Golden Retriever"
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, petBreed: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  value={editingCustomer.deliveryAddress}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Referencias de Domicilio</label>
                <textarea
                  value={editingCustomer.addressReferences}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, addressReferences: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Notas</label>
                <input
                  type="text"
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944]"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
