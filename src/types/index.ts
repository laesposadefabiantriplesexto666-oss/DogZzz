export type DogBedSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;

export type DogBedType =
  | 'Camas tipo dona'
  | 'Camas ortopédicas'
  | 'Camas tipo sofá'
  | 'Camas tipo cueva'
  | 'Camas acolchadas'
  | 'Camas elevadas'
  | 'Colchonetas'
  | 'Camas impermeables'
  | string;

export interface ProductVariant {
  id: string;
  sku: string;
  size: DogBedSize;
  color: string;
  dimensions: string; // Ej. '60 x 50 x 18 cm'
  costPrice: number;
  salePrice: number;
  stock: number;
  minStockAlert: number;
  recommendedBreed?: string; // Ej. 'Chihuahua, Pomerania'
}

export interface Product {
  id: string;
  sku: string; // SKU base o del modelo principal
  name: string; // Nombre comercial, ej. 'Cama Dona Felpa Relajante Cloud'
  category: DogBedType;
  bedType: DogBedType;
  size: DogBedSize; // Talla predeterminada o base
  recommendedBreed?: string; // Talla o raza recomendada
  outerMaterial: string; // Material exterior (ej. 'Felpa anti-estrés', 'Oxford impermeable')
  fillingMaterial: string; // Material de relleno (ej. 'Memory Foam ortopédico', 'Fibra siliconada')
  color: string;
  dimensions: string;
  specialFeatures: string; // Ej. 'Funda lavable con cierre, base antideslizante'
  description: string;
  costPrice: number;
  salePrice: number;
  stock: number; // Stock agregado del modelo o de la variante principal
  minStockAlert: number;
  warehouseLocation: string;
  photoUrl: string;
  isActive: boolean;
  isFeatured?: boolean; // Para "Productos destacados" en el dashboard
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 
  | 'IN_PURCHASE'      // Entrada de mercancía a almacén
  | 'IN_ADJUST'        // Ajuste positivo
  | 'OUT_SALE'         // Venta confirmada
  | 'OUT_ADJUST'       // Ajuste negativo / merma / daño
  | 'RETURN_CANCEL';   // Devolución por cancelación

export interface InventoryMovement {
  id: string;
  productId: string;
  variantId?: string;
  productSku: string;
  productName: string;
  variantInfo?: string; // Ej. 'Talla M · Café Chocolate'
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  orderFolio?: string;
  registeredBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  petName?: string; // Nombre de la mascota (opcional y amigable para DogZzz)
  petBreed?: string; // Raza o peso de la mascota (opcional)
  deliveryAddress: string;
  addressReferences: string;
  notes?: string;
  createdAt: string;
}

export interface SaleCartItem {
  product: Product;
  variantId?: string;
  variantSku: string;
  size: string;
  color: string;
  dimensions?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export type PaymentMethod = 
  | 'Efectivo'
  | 'Tarjeta de Débito/Crédito'
  | 'Transferencia Bancaria'
  | 'Pago Mixto'
  | 'Crédito / A plazos';

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  registeredBy: string;
}

export type DeliveryStatus = 
  | 'SIN_PROGRAMAR'
  | 'PROGRAMADA'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADA'
  | 'NO_ENTREGADA'
  | 'REPROGRAMADA'
  | 'CANCELADA';

export interface DeliveryDetails {
  required: boolean;
  status: DeliveryStatus;
  scheduledDate?: string;     // YYYY-MM-DD
  timeSlot?: string;          // '10:00 - 14:00' | '14:00 - 18:00' | 'Todo el día'
  recipientName: string;
  recipientPhone: string;
  address: string;
  references: string;
  deliveryFee: number;
  assignedDriver?: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  failureReason?: string;
}

export type OrderStatus = 
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'LISTO_RECOGER'
  | 'EN_CAMINO'
  | 'COMPLETADO'
  | 'CANCELADO';

export interface OrderEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  user: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  productSku: string;
  productName: string;
  size: string;
  color: string;
  dimensions?: string;
  material?: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  folio: string;               // e.g. VTA-2026-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  petName?: string;
  customerPetName?: string;   // Nombre de la mascota para el comprobante y despacho
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  amountPaid: number;
  balancePending: number;
  paymentMethod: PaymentMethod;
  payments: PaymentRecord[];
  orderStatus: OrderStatus;
  delivery: DeliveryDetails;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderEvent[];
}

export type UserRole = 'ADMIN' | 'EMPLEADO';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface BusinessSettings {
  businessName: string; // 'DogZzz'
  slogan: string;       // 'El descanso que mueve sus colitas'
  logoUrl?: string;
  phone: string;
  address: string;
  city: string;
  operatingHours: string;
  currency: string;
  defaultDeliveryFee: number;
  defaultMinStock: number;
  categories: string[];
  sizes: string[];
  materials: string[];
  styles?: string[];
  colors: string[];
  paymentMethods: string[];
  isDemoMode: boolean;
}

