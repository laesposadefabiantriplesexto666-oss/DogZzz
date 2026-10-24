import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DogBedSize, DogBedType, ProductVariant } from '../types';
import { X, Sparkles, Dog, Tag, Layers, Plus, Trash2 } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, settings } = useApp();

  const PHOTO_TEMPLATES = [
    { label: 'Cama Dona Calmante Felpa', url: '/src/assets/images/dog_bed_donut_plush_1792871854634.jpg' },
    { label: 'Cama Ortopédica Sofá Memory Foam', url: '/src/assets/images/dog_bed_orthopedic_sofa_1792871855558.jpg' },
    { label: 'Cama Tipo Cueva Térmica', url: '/src/assets/images/dog_bed_cave_burrow_1792871855066.jpg' },
    { label: 'Cama Elevada Transpirable Exterior', url: '/src/assets/images/dog_bed_elevated_outdoor_1792871855586.jpg' }
  ];

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [bedType, setBedType] = useState<DogBedType>('Camas tipo dona');
  const [size, setSize] = useState<DogBedSize>('M');
  const [recommendedBreed, setRecommendedBreed] = useState('Beagle, Cocker, Bulldog Francés (10-18 kg)');
  const [outerMaterial, setOuterMaterial] = useState('Felpa shaggy ultra suave hipoalergénica');
  const [fillingMaterial, setFillingMaterial] = useState('Algodón PP siliconado de alta resiliencia');
  const [color, setColor] = useState('Gris Nube');
  const [dimensions, setDimensions] = useState('70 cm diámetro × 20 cm alto');
  const [specialFeatures, setSpecialFeatures] = useState('Funda desmontable con cremallera oculta, base impermeable y antideslizante.');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(settings.defaultMinStock || 3);
  const [warehouseLocation, setWarehouseLocation] = useState('Estante A-Canino');
  const [photoUrl, setPhotoUrl] = useState(PHOTO_TEMPLATES[0].url);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Variant generator state
  const [createVariants, setCreateVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<Omit<ProductVariant, 'id'>[]>([
    {
      sku: '',
      size: 'S',
      color: 'Gris Nube',
      dimensions: '50 cm diámetro × 18 cm',
      salePrice: 599,
      costPrice: 280,
      stock: 5,
      minStockAlert: 2
    },
    {
      sku: '',
      size: 'M',
      color: 'Gris Nube',
      dimensions: '70 cm diámetro × 20 cm',
      salePrice: 849,
      costPrice: 380,
      stock: 8,
      minStockAlert: 3
    },
    {
      sku: '',
      size: 'L',
      color: 'Gris Nube',
      dimensions: '90 cm diámetro × 22 cm',
      salePrice: 1199,
      costPrice: 520,
      stock: 4,
      minStockAlert: 2
    }
  ]);

  if (!isOpen) return null;

  const handleAddVariantRow = () => {
    setVariantsList([
      ...variantsList,
      {
        sku: `${sku || 'CAM'}-${variantsList.length + 1}`,
        size: 'L',
        color: color || 'Gris Nube',
        dimensions: '80 cm × 60 cm',
        salePrice: typeof salePrice === 'number' ? salePrice : 899,
        costPrice: typeof costPrice === 'number' ? costPrice : 400,
        stock: 5,
        minStockAlert: 2
      }
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: any) => {
    const updated = [...variantsList];
    updated[index] = { ...updated[index], [field]: value };
    setVariantsList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku.trim() || !name.trim()) {
      alert('Ingresa al menos el código SKU y el nombre comercial del modelo.');
      return;
    }

    const costNum = typeof costPrice === 'number' ? costPrice : parseFloat(costPrice) || 0;
    const saleNum = typeof salePrice === 'number' ? salePrice : parseFloat(salePrice) || 0;
    const baseStock = typeof stock === 'number' ? stock : parseInt(stock) || 0;
    const minAlertNum = typeof minStockAlert === 'number' ? minStockAlert : parseInt(minStockAlert) || 2;

    let finalVariants: ProductVariant[] = [];
    let computedStock = baseStock;

    if (createVariants && variantsList.length > 0) {
      finalVariants = variantsList.map((v, i) => ({
        ...v,
        id: `var-${Date.now()}-${i}`,
        sku: v.sku.trim() || `${sku}-${v.size}-${i + 1}`
      }));
      computedStock = finalVariants.reduce((sum, v) => sum + v.stock, 0);
    }

    const res = addProduct({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: bedType,
      bedType,
      size,
      recommendedBreed: recommendedBreed.trim(),
      outerMaterial: outerMaterial.trim(),
      fillingMaterial: fillingMaterial.trim(),
      color: color.trim() || 'Multicolor',
      dimensions: dimensions.trim(),
      specialFeatures: specialFeatures.trim(),
      description: description.trim(),
      costPrice: costNum,
      salePrice: saleNum,
      stock: computedStock,
      minStockAlert: minAlertNum,
      warehouseLocation: warehouseLocation.trim(),
      photoUrl,
      isActive: true,
      isFeatured,
      variants: finalVariants
    });

    if (res.success) {
      onClose();
      // Reset
      setSku('');
      setName('');
      setCostPrice('');
      setSalePrice('');
      setDescription('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#E8DFD5] p-6 space-y-5 my-6 text-[#2C1810]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A6B53]/15 text-[#4A6B53] flex items-center justify-center">
              <Dog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Registrar Cama para Perros</h3>
              <p className="text-xs text-[#6B5A4E]">Agrega un nuevo modelo canino al catálogo de DogZzz con sus tallas y materiales.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Código o SKU Modelo *</label>
              <input
                type="text"
                placeholder="Ej. DZ-DONA-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6B53]/40"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[#4A3B32] font-semibold mb-1">Nombre Comercial de la Cama *</label>
              <input
                type="text"
                placeholder="Ej. Cama Dona Calmante Anti-Estrés Ultra Felpa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#4A6B53]/40 font-medium"
                required
              />
            </div>
          </div>

          {/* Type, Size & Recommended Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Tipo de Cama *</label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value as DogBedType)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white font-medium"
              >
                <option value="Camas tipo dona">Camas tipo dona (Anti-estrés)</option>
                <option value="Camas ortopédicas">Camas ortopédicas (Memory Foam)</option>
                <option value="Camas tipo sofá">Camas tipo sofá con soporte</option>
                <option value="Camas acolchadas">Camas acolchadas tradicionales</option>
                <option value="Camas tipo cueva">Camas tipo cueva / madriguera</option>
                <option value="Camas elevadas">Camas elevadas transpirables</option>
                <option value="Colchonetas">Colchonetas ligeras y de viaje</option>
                <option value="Camas impermeables">Camas impermeables para exterior</option>
              </select>
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Talla Principal *</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as DogBedSize)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white font-bold text-[#4A6B53]"
              >
                <option value="XS">XS (Toy / Mini &lt; 4 kg)</option>
                <option value="S">S (Pequeño 4 - 9 kg)</option>
                <option value="M">M (Mediano 10 - 18 kg)</option>
                <option value="L">L (Grande 19 - 30 kg)</option>
                <option value="XL">XL (Extra Grande 31 - 45 kg)</option>
                <option value="XXL">XXL (Gigante &gt; 45 kg)</option>
                <option value="Especial">Especial a medida</option>
              </select>
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Raza o Peso Recomendado</label>
              <input
                type="text"
                placeholder="Ej. Chihuahua, Poodle toy, Pomerania (< 4 kg)"
                value={recommendedBreed}
                onChange={(e) => setRecommendedBreed(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Materials & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Material Exterior *</label>
              <input
                type="text"
                placeholder="Ej. Felpa shag hipoalergénica / Lino Oxford"
                value={outerMaterial}
                onChange={(e) => setOuterMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Material de Relleno *</label>
              <input
                type="text"
                placeholder="Ej. Algodón PP virgen / Memory foam ortopédico"
                value={fillingMaterial}
                onChange={(e) => setFillingMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Color / Tono</label>
              <input
                type="text"
                placeholder="Ej. Gris Nube / Café Caramelo / Rosa Pastel"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Dimensions & Special Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Dimensiones Físicas</label>
              <input
                type="text"
                placeholder="Ej. 70 cm diámetro × 20 cm altura"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Características Especiales</label>
              <input
                type="text"
                placeholder="Ej. Funda desenfundable con cierre oculto, base impermeable"
                value={specialFeatures}
                onChange={(e) => setSpecialFeatures(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Costo ($ MXN)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg font-mono bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Precio Venta ($ MXN) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg font-mono font-bold text-[#4A6B53] bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">
                {createVariants ? 'Stock Total (sumado)' : 'Existencias Iniciales *'}
              </label>
              <input
                type="number"
                min="0"
                value={createVariants ? variantsList.reduce((s, v) => s + v.stock, 0) : stock}
                disabled={createVariants}
                onChange={(e) => setStock(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg font-mono font-bold bg-white disabled:bg-stone-100"
                required
              />
            </div>
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Alerta Stock Mínimo *</label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-lg font-mono bg-white"
                required
              />
            </div>
          </div>

          {/* Warehouse & Featured Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[#4A3B32] font-semibold mb-1">Ubicación en Almacén</label>
              <input
                type="text"
                placeholder="Ej. Estante A-2, Pasillo Canino"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#4A6B53] focus:ring-[#4A6B53] w-4 h-4"
                />
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Destacar este modelo en el panel de inicio
                </span>
              </label>
            </div>
          </div>

          {/* Variants section toggle */}
          <div className="p-3 bg-[#F0EAE1]/60 rounded-xl border border-[#E8DFD5] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                <input
                  type="checkbox"
                  checked={createVariants}
                  onChange={(e) => setCreateVariants(e.target.checked)}
                  className="rounded text-[#4A6B53] focus:ring-[#4A6B53] w-4 h-4"
                />
                <Layers className="w-4 h-4 text-[#4A6B53]" />
                <span>¿Maneja múltiples variantes de tamaño y color con inventario independiente?</span>
              </label>
              {createVariants && (
                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="px-2.5 py-1 bg-[#4A6B53] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 hover:bg-[#3D5944]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Variante
                </button>
              )}
            </div>

            {createVariants && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] text-[#6B5A4E]">
                  Define el SKU, talla, color, precio y existencias específicas de cada variante:
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {variantsList.map((variant, index) => (
                    <div key={index} className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-lg border border-[#E8DFD5]">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="SKU"
                          value={variant.sku}
                          onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 border border-stone-200 rounded font-mono text-[10px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={variant.size}
                          onChange={(e) => handleUpdateVariant(index, 'size', e.target.value as DogBedSize)}
                          className="w-full px-1.5 py-1 border border-stone-200 rounded font-bold text-[#4A6B53] text-[10px]"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Color"
                          value={variant.color}
                          onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                          className="w-full px-2 py-1 border border-stone-200 rounded text-[10px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Precio"
                          value={variant.salePrice}
                          onChange={(e) => handleUpdateVariant(index, 'salePrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-stone-200 rounded font-mono text-[10px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-stone-200 rounded font-mono font-bold text-[10px]"
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          disabled={variantsList.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo selection with DogZzz images */}
          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">
              Fotografía de la Cama para Perros (Elige una muestra de DogZzz o escribe tu URL)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {PHOTO_TEMPLATES.map((tmpl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhotoUrl(tmpl.url)}
                  className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all ${
                    photoUrl === tmpl.url
                      ? 'border-[#4A6B53] bg-[#4A6B53]/10 ring-2 ring-[#4A6B53]/30'
                      : 'border-[#E8DFD5] hover:border-stone-400 bg-white'
                  }`}
                >
                  <img
                    src={tmpl.url}
                    alt={tmpl.label}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <span className="text-[10px] text-stone-700 text-center font-medium line-clamp-1">
                    {tmpl.label}
                  </span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="O ingresa una URL directa de imagen..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl font-mono text-[11px] bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#4A3B32] font-semibold mb-1">Descripción y Recomendaciones de Cuidado</label>
            <textarea
              placeholder="Indica beneficios para articulaciones, instrucciones de lavado a máquina, tipo de perro recomendado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[#E8DFD5] rounded-xl bg-white"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-[#4A6B53] text-white rounded-xl font-semibold hover:bg-[#3D5944] shadow-sm flex items-center gap-2"
            >
              <Dog className="w-4 h-4" />
              Guardar en Catálogo DogZzz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
