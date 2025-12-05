
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Order } from '../types';
import Button from '../components/Button';
import { BoxIcon, TruckIcon, CheckCircleIcon, ChevronDownIcon } from '../components/Icons';

// Sub-component for displaying the visual order status tracker
const OrderStatusTracker = ({ currentStatus }: { currentStatus: Order['status'] }) => {
  const statuses: { id: Order['status']; name: string; icon: React.ReactNode }[] = [
    { id: 'dikemas', name: 'Dikemas', icon: <BoxIcon className="w-6 h-6" /> },
    { id: 'dikirim', name: 'Dikirim', icon: <TruckIcon className="w-6 h-6" /> },
    { id: 'selesai', name: 'Selesai', icon: <CheckCircleIcon className="w-6 h-6" /> },
  ];
  const currentStatusIndex = statuses.findIndex(s => s.id === currentStatus);

  return (
    <div className="w-full px-2 sm:px-4 py-4">
      <div className="flex items-center">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isLineActive = index < currentStatusIndex;
          const isLast = index === statuses.length - 1;

          return (
            <React.Fragment key={status.id}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                  {status.icon}
                </div>
                <p className={`mt-2 text-xs sm:text-sm font-semibold transition-colors ${isCompleted ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400'}`}>{status.name}</p>
              </div>
              {!isLast && (
                <div className={`flex-grow h-1 mx-2 transition-colors ${isLineActive ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      const storedOrders = JSON.parse(localStorage.getItem('kodik-orders') || '[]');
      // Filter orders by current user, assuming customerName is the email for now
      const userOrders = storedOrders.filter((o: Order) => o.customerName === user?.email);
      setOrders(userOrders.reverse());
    }
  }, [isAuthenticated, navigate, user?.email]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  
  const getStatusChipClass = (status: Order['status']) => {
    switch (status) {
      case 'dikemas': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'dikirim': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
      case 'selesai': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  return (
    <div>
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Profil Saya</h1>
          <Button onClick={handleLogout} variant="outline">Keluar</Button>
        </div>
        <p className="text-lg text-neutral-700 dark:text-neutral-200">Selamat datang, <span className="font-semibold">{user?.email}</span>!</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Riwayat Pesanan</h2>
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="border dark:border-neutral-700 rounded-lg overflow-hidden transition-shadow duration-300">
                <button 
                  onClick={() => toggleOrderDetails(order.id)} 
                  className="w-full text-left bg-neutral-50 dark:bg-neutral-700/50 p-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700 transition-colors"
                  aria-expanded={expandedOrderId === order.id}
                  aria-controls={`order-details-${order.id}`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800 dark:text-neutral-100">Pesanan #{order.id}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                      <div className="text-right sm:text-left">
                         <p className="font-bold text-lg text-primary">{formatRupiah(order.total)}</p>
                      </div>
                       <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(order.status)} capitalize`}>{order.status}</span>
                      <ChevronDownIcon className={`w-6 h-6 text-neutral-500 dark:text-neutral-400 transition-transform flex-shrink-0 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>
                {expandedOrderId === order.id && (
                  <div id={`order-details-${order.id}`} className="p-4 sm:p-6 bg-white dark:bg-neutral-800 border-t dark:border-neutral-700 animate-fade-in">
                    <OrderStatusTracker currentStatus={order.status} />
                    <div className="border-t dark:border-neutral-700 mt-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Kolom 1: Alamat Pengiriman */}
                        <div>
                          <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Alamat Pengiriman</h4>
                          <div className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
                            <p className="font-bold">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.phone}</p>
                          </div>
                        </div>
                        {/* Kolom 2: Barang Pesanan */}
                        <div>
                          <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Barang Pesanan</h4>
                          <ul className="space-y-2">
                            {order.items.map(item => (
                              <li key={item.product.id} className="text-sm text-neutral-600 dark:text-neutral-300 flex justify-between">
                                <span className="pr-2">{item.product.name} <span className="text-neutral-500 dark:text-neutral-400">(x{item.quantity})</span></span>
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap">{formatRupiah(item.product.price * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Anda belum memiliki riwayat pesanan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
