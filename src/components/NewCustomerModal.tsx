import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { X, UserPlus, Phone, MapPin, Dog, Heart } from 'lucide-react';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: (customer: Customer) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated
}) => {
  const { addCustomer, customers } = useApp();

  const [fullName, setFullName] = useState('');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressReferences, setAddressReferences] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Real-time duplicate phone check
  const cleanPhone = phone.replace(/\D/g, '');
  const duplicateCustomer = cleanPhone.length >= 7
    ? customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      alert('Por favor ingresa al menos el nombre completo del dueño y su teléfono.');
      return;
    }

    const res = addCustomer({
      fullName: fullName.trim(),
      petName: petName.trim() || undefined,
      petBreed: petBreed.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      deliveryAddress: deliveryAddress.trim(),
      addressReferences: addressReferences.trim(),
      notes: notes.trim() || undefined
    });

    if (res.success && res.customer) {
      if (onCustomerCreated) {
        onCustomerCreated(res.customer);
      }
      onClose();
      // Reset
      setFullName('');
      setPetName('');
      setPetBreed('');
      setPhone('');
      setEmail('');
      setDeliveryAddress('');
      setAddressReferences('');
      setNotes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-lg w-full border border-[#E8DFD5] p-6 space-y-4 my-6 text-[#2C1810]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Registrar Dueño y Mascota</h3>
              <p className="text-xs text-[#6B5A4E]">Ficha de cliente con datos de su perrito para compras y entregas.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {duplicateCustomer && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <p className="font-semibold text-xs">Aviso de cliente existente con este número:</p>
              <p className="text-[11px] mt-0.5">
                Ya está registrado: <strong>{duplicateCustomer.fullName}</strong> {duplicateCustomer.petName && `(Dueño de ${duplicateCustomer.petName})`}.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">Nombre Completo del Cliente / Dueño *</label>
            <input
              type="text"
              placeholder="Ej. Sofia Martínez Herrera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6B53]/40 text-xs"
              required
            />
          </div>

          {/* Pet Information */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] space-y-2">
            <div className="flex items-center gap-1.5 text-[#4A6B53] font-bold text-xs">
              <Dog className="w-4 h-4" />
              <span>Datos del Perrito o Mascota</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Nombre del Perrito</label>
                <div className="relative">
                  <Heart className="w-3.5 h-3.5 absolute left-3 top-3 text-red-400" />
                  <input
                    type="text"
                    placeholder="Ej. Milo, Rocky, Canela"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E8DFD5] rounded-lg bg-white text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">Raza o Tipo de Perro</label>
                <input
                  type="text"
                  placeholder="Ej. Golden Retriever / Mestizo mediano"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Teléfono Móvil o WhatsApp *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Ej. 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E8DFD5] rounded-xl bg-white text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Correo Electrónico (Opcional)</label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">
              Dirección de Entrega a Domicilio
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Calle, número exterior/interior, colonia, código postal"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E8DFD5] rounded-xl bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">
              Referencias para Localizar el Domicilio
            </label>
            <textarea
              placeholder="Ej. Casa verde con reja blanca. El perrito ladra al timbre pero es muy dócil."
              value={addressReferences}
              onChange={(e) => setAddressReferences(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white text-xs"
            />
          </div>

          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">Notas Internas</label>
            <input
              type="text"
              placeholder="Ej. Prefiere contacto por WhatsApp, tamaño de su sala..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8DFD5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E8DFD5] rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944] shadow-sm flex items-center gap-1.5"
            >
              <Dog className="w-4 h-4" />
              Guardar Cliente y Perrito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
