import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Button from '../components/Button';
import Input from '../components/Input';
import { Order } from '../types';

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [tenor, setTenor] = useState(3); // Default tenor for BNPL

  const installmentOptions = [
    { months: 3, label: '3 Bulan' },
    { months: 6, label: '6 Bulan' },
    { months: 12, label: '12 Bulan' },
  ];
  const monthlyPayment = totalPrice > 0 ? totalPrice / tenor : 0;


  if (!isAuthenticated) {
    return (
      <div className="text-center bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Anda Perlu Masuk</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-4">Silakan masuk ke akun Anda untuk melanjutkan proses checkout dan melihat pesanan Anda.</p>
        <Link to="/login?redirect=/checkout">
          <Button className="mt-6 !font-bold !py-3">Masuk untuk Checkout</Button>
        </Link>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="text-center bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Keranjang Belanja Kosong</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-4">Tidak ada barang di keranjang Anda untuk checkout.</p>
        <Link to="/products">
          <Button className="mt-6 !font-bold !py-3">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan checkout dan kembali ke keranjang?')) {
      navigate('/cart');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.phone) {
        alert("Harap isi semua informasi pengiriman.");
        return;
    }

    const newOrder: Order = {
      id: new Date().getTime().toString(),
      // FIX: Added missing customerName property.
      customerName: user?.email ?? shippingInfo.name,
      items: cartItems,
      total: totalPrice,
      date: new Date().toISOString(),
      status: 'dikemas',
      shippingAddress: shippingInfo
    };
    
    const existingOrders: Order[] = JSON.parse(localStorage.getItem('kodik-orders') || '[]');
    localStorage.setItem('kodik-orders', JSON.stringify([...existingOrders, newOrder]));

    showNotification('Pesanan Diterima!', 'Terima kasih! Pesanan Anda sedang kami proses.');
    clearCart();
    setTimeout(() => {
        navigate('/profile');
    }, 3000);
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold mb-6 dark:text-neutral-100">Checkout</h1>
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          <div className="w-full lg:w-2/3 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b dark:border-neutral-700 pb-2 dark:text-neutral-100">Alamat Pengiriman</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Nama Penerima</label>
                <Input type="text" id="name" name="name" value={shippingInfo.name} onChange={handleInputChange} required className="mt-1" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Alamat Lengkap</label>
                <Input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleInputChange} required className="mt-1" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Nomor Telepon</label>
                <Input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required className="mt-1" />
              </div>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4 border-b dark:border-neutral-700 pb-2 dark:text-neutral-100">Metode Pembayaran</h2>
            <div className="space-y-3">
              {/* COD Option */}
              <label htmlFor="cod" className="flex items-center border dark:border-neutral-600 p-4 rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary dark:has-[:checked]:bg-primary/20 dark:has-[:checked]:border-primary transition-all cursor-pointer">
                <input 
                  type="radio" 
                  id="cod" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary dark:bg-neutral-700 dark:border-neutral-500"
                />
                <span className="ml-3 font-medium text-neutral-700 dark:text-neutral-200">Cash on Delivery (COD)</span>
              </label>

              {/* BNPL Option Container */}
              <div className={`border rounded-lg transition-all ${paymentMethod === 'bnpl' ? 'bg-primary/10 border-primary dark:bg-primary/20' : 'border-neutral-300 dark:border-neutral-600'}`}>
                <label htmlFor="bnpl" className="flex items-center p-4 cursor-pointer">
                  <input 
                    type="radio" 
                    id="bnpl" 
                    name="payment" 
                    value="bnpl" 
                    checked={paymentMethod === 'bnpl'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary dark:bg-neutral-700 dark:border-neutral-500"
                  />
                  <span className="ml-3 font-medium text-neutral-700 dark:text-neutral-200">Bayar Nanti (Cicilan)</span>
                </label>
                
                {paymentMethod === 'bnpl' && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="pl-8 pt-4 space-y-3 border-t border-neutral-200 dark:border-neutral-700 border-dashed">
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Pilih Tenor Cicilan</h4>
                      <div className="flex flex-wrap gap-2">
                        {installmentOptions.map(option => (
                          <button
                            key={option.months}
                            type="button"
                            onClick={() => setTenor(option.months)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                              tenor === option.months
                                ? 'bg-primary text-white shadow'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 p-3 bg-white dark:bg-neutral-700/50 rounded-lg text-center border dark:border-neutral-600">
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">Anda akan membayar (0% Bunga)</p>
                        <p className="text-lg font-bold text-primary">{formatRupiah(monthlyPayment)} / bulan</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
               
              <label htmlFor="transfer" className="flex items-center border dark:border-neutral-700 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 cursor-not-allowed">
                <input type="radio" id="transfer" name="payment" value="transfer" disabled className="h-4 w-4"/>
                <span className="ml-3 font-medium">Bank Transfer (Segera Hadir)</span>
              </label>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
             <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border dark:border-neutral-700 sticky top-24">
              <h2 className="text-xl font-bold mb-4 border-b dark:border-neutral-700 pb-2 dark:text-neutral-100">Ringkasan Pesanan</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cartItems.map(item => {
                  const itemPrice = item.product.discount
                    ? item.product.price * (1 - item.product.discount / 100)
                    : item.product.price;
                  return (
                    <div key={item.product.id} className="flex justify-between items-start text-sm">
                      <span className="flex-1 text-neutral-600 dark:text-neutral-300">{item.product.name} <span className="font-semibold">x{item.quantity}</span></span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-100">{formatRupiah(itemPrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t dark:border-neutral-700 my-4"></div>
              <div className="flex justify-between font-bold text-lg text-neutral-800 dark:text-neutral-100">
                <span>Total</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="w-full !font-bold !py-3"
                >
                    Batal
                </Button>
                <Button type="submit" className="w-full !font-bold !py-3">
                    Bayar Sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CheckoutPage;