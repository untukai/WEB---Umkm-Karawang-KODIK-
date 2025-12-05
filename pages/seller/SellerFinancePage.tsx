
import React from 'react';
import { financialTransactions } from '../../data/dummyData';
import { FinancialTransaction } from '../../types';
import Button from '../../components/Button';
import { CurrencyDollarIcon } from '../../components/Icons';

const SellerFinancePage: React.FC = () => {
    
  const currentBalance = financialTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };
  
  const getStatusChipClass = (status: FinancialTransaction['status']) => {
    return status === 'Selesai' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
  };

  const getAmountClass = (amount: number) => {
      return amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Keuangan</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-1">Lacak saldo, transaksi, dan kelola pencairan dana Anda.</p>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Saldo Toko</h3>
          <p className="text-3xl font-bold text-primary my-2">{formatRupiah(currentBalance)}</p>
          <Button className="w-full mt-3">Cairkan Dana</Button>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Pencairan Berikutnya</h3>
           <p className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 my-2">Rabu, 7 Agustus 2024</p>
           <p className="text-sm text-neutral-500 dark:text-neutral-400">Pencairan dana dilakukan secara otomatis setiap hari Rabu.</p>
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-4">Riwayat Transaksi</h3>
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Deskripsi</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Jumlah</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {financialTransactions.map((trx) => (
                <tr key={trx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{formatDate(trx.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-100">{trx.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-200">{trx.description}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getAmountClass(trx.amount)}`}>
                    {trx.amount > 0 ? '+' : ''}{formatRupiah(trx.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChipClass(trx.status)}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerFinancePage;
