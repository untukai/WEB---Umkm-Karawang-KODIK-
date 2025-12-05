
import React, { useState } from 'react';
import { FinancialTransaction } from '../../types';
import Button from '../../components/Button';
import { GiftIcon, XIcon } from '../../components/Icons';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';

// Use Transaction data from AuthContext for consistency
const SellerFinancePage: React.FC = () => {
  const { showNotification } = useNotification();
  const { user, transactions, withdrawWallet } = useAuth(); // Assuming Seller uses same AuthContext for wallet
  
  // Filter for 'Penarikan' or specific Seller transactions if needed. 
  // For demo, we show all current user transactions.
  const myTransactions = transactions;

  // Seller wallet is same as user wallet for this demo structure
  const mainBalance = user?.walletBalance || 0;
  const [giftRevenue, setGiftRevenue] = useState(250000); 
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const formatRupiah = (number: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  const handleWithdrawGiftRevenue = () => {
    if (giftRevenue <= 0) { showNotification('Gagal', 'Belum ada pendapatan dari gift.', 'error'); return; }
    // Logic to move gift revenue to main wallet would be an API call
    showNotification('Berhasil', 'Pendapatan gift dipindahkan ke saldo utama (Simulasi).', 'success');
    setGiftRevenue(0);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Keuangan Toko</h1>
        <p className="text-neutral-600 mt-1">Kelola saldo penjualan dan pencairan dana.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold">Saldo Toko</h3>
          <p className="text-3xl font-bold text-primary my-2">{formatRupiah(mainBalance)}</p>
          <div className="space-y-2 mt-4">
              <Button onClick={() => setIsWithdrawModalOpen(true)} className="w-full">Cairkan Dana</Button>
              <p className="text-xs text-center text-neutral-500">Biaya admin Rp 5.000 per penarikan</p>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg shadow-md border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
             <GiftIcon className="w-6 h-6 text-purple-600" />
             <h3 className="text-lg font-bold">Pendapatan Gift Live</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 my-2">{formatRupiah(giftRevenue)}</p>
          <Button onClick={handleWithdrawGiftRevenue} variant="secondary" className="w-full mt-4">Tarik ke Saldo</Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Riwayat Transaksi</h3>
         <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
              <tr>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Deskripsi</th>
                <th className="px-6 py-3 text-right">Jumlah</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {myTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td className="px-6 py-4">{new Date(trx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">{trx.type}</td>
                  <td className="px-6 py-4">{trx.description}</td>
                  <td className={`px-6 py-4 text-right font-bold ${trx.isCredit ? 'text-green-600' : 'text-red-500'}`}>
                    {trx.isCredit ? '+' : '-'}{formatRupiah(trx.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">{trx.status}</span>
                  </td>
                </tr>
              ))}
              {myTransactions.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-neutral-500">Belum ada transaksi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusing the Logic for Withdraw Modal (Simplification: using local state here but logic connects to AuthContext) */}
      {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsWithdrawModalOpen(false)}>
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4">Cairkan Dana</h3>
                  <p className="mb-4 text-sm">Saldo akan dikirim ke rekening terdaftar. Biaya admin Rp 5.000.</p>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const amt = parseInt((e.target as any).amount.value);
                      if (amt > 0) {
                          if(withdrawWallet(amt, "Bank Terdaftar", "123xxxxx")) {
                              showNotification("Berhasil", "Penarikan diajukan", "success");
                              setIsWithdrawModalOpen(false);
                          } else {
                              showNotification("Gagal", "Saldo tidak cukup", "error");
                          }
                      }
                  }}>
                      <input name="amount" type="number" placeholder="Nominal Penarikan" className="w-full border p-2 rounded mb-4 dark:bg-neutral-700" autoFocus />
                      <Button type="submit" className="w-full">Konfirmasi</Button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default SellerFinancePage;
