// types.ts (Improved for Backend Architecture)

export type UserRole = 'pembeli' | 'penjual' | 'admin';
// FIX: Updated ProductStatus to match values used in dummyData and components.
export type ProductStatus = 'aktif' | 'habis stok' | 'nonaktif' | 'draft' | 'archived';
// FIX: Updated OrderStatus to match values used in dummyData and components.
export type OrderStatus = 'menunggu pembayaran' | 'dikemas' | 'dikirim' | 'selesai' | 'dibatalkan';
export type ProductType = 'Produk Fisik' | 'Produk Digital' | 'Jasa';

// --- Core Entities ---

export interface User {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string; // ISO 8601
  coins?: number; // Added for live stream gifts feature
}

export interface Seller {
  id: number;
  // FIX: Removed userId and createdAt which were missing from dummy data and not used.
  // userId: number; // Link to User
  name: string;
  description: string;
  rating: number;
  phone?: string;
  email?: string;
  imageUrl?: string;
  // createdAt: string;
}

export interface Category {
  id: string; // e.g., 'kuliner'
  name: string;
  parentId?: string | null; // For nested categories
}

// FIX: Reverted Product to a flat structure to match the existing application logic, merging variant and image info back in.
export interface Product {
  id: number;
  sellerId: number;
  // categoryId: string;
  category: string; // Using string name as expected by components
  name:string;
  description: string;
  status: ProductStatus;
  type: ProductType;
  // From variants/images
  price: number;
  stock: number;
  discount?: number;
  imageUrls: string[];
  // createdAt: string;
  // updatedAt: string;
}

// NOTE: ProductVariant and ProductImage have been removed as the app uses a flat Product structure.

// --- Transactional Entities ---

export interface CartItem {
  productId: number;
  quantity: number;
  // For display, we'll join this data
  product: Product;
  // In a real variant system, this would be variant details
  imageUrls: string[];
  price: number;
  discount?: number;
}


// FIX: Reverted Order to match the structure used in dummy data and components.
export interface Order {
  id: string;
  // userId: number;
  // orderCode: string; // e.g., KODIK-7892A
  customerName: string; // Used in dummyData and components
  items: { product: Product, quantity: number }[]; // Inlined from dummyData structure
  total: number; // Used instead of grandTotal
  // grandTotal: number;
  // shippingCost: number;
  date: string; // ISO 8601
  status: OrderStatus;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
}

// NOTE: OrderItem has been removed as the app uses a denormalized items array in Order.


// --- Content & Engagement Entities ---

export interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishDate: string; // ISO 8601
  imageUrl: string;
}

// FIX: Added userEmail to match dummy data and component usage.
export interface Review {
  id: number;
  productId: number;
  userId: number; // Kept as it is used when creating new reviews.
  userName: string; // Denormalized for easy display
  userEmail: string; // Present in dummy data and used when creating new reviews.
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO 8601
}

export interface Post {
  id: number;
  sellerId: number;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  timestamp: string; // ISO 8601
  likes: number;
  comments: Comment[];
}

// FIX: Added userEmail and removed userId to match dummy data and component usage.
export interface Comment {
  id: number;
  parentId?: number | null;
  // userId: number;
  userName: string;
  userEmail: string; // Present in dummy data and used when creating new comments.
  text: string;
}

export interface LiveSession {
  id: number;
  sellerId: number;
  title: string;
  status: 'live' | 'replay';
  thumbnailUrl: string;
  productIds: number[];
  likes?: number;
  viewers?: number;
}


// --- Seller Specific & Other ---

export interface ChatMessage {
  sender: 'penjual' | 'pembeli';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: number;
  customerId: number;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Promotion {
  id: number;
  sellerId: number;
  type: 'Voucher' | 'Diskon Produk';
  code?: string;
  title: string;
  discountValue: number;
  discountType: 'persen' | 'nominal';
  minPurchase: number;
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Kadaluarsa' | 'Akan Datang';
}

export interface Influencer {
  id: number;
  name: string;
  category: string;
  followers: {
    instagram: number;
    tiktok: number;
  };
  bio: string;
  profileImageUrl?: string;
}

export interface VirtualGift {
  id: number;
  name: string;
  icon: string;
  price: number; // in coins
}

export interface LiveChatMessage {
  id: number;
  userName: string;
  text: string;
  isGift?: boolean;
  giftIcon?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'Penjualan' | 'Pencairan Dana' | 'Refund';
  description: string;
  amount: number; // positive for income, negative for outcome
  status: 'Selesai' | 'Tertunda';
}