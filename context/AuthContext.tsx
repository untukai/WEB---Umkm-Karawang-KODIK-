
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, FinancialTransaction } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'pembeli' | 'penjual') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  transactions: FinancialTransaction[];
  // Wallet functions
  topUpWallet: (amount: number, method: string) => void;
  withdrawWallet: (amount: number, bankName: string, accountNumber: string) => boolean;
  // Coin functions
  spendCoins: (amount: number) => boolean;
  buyCoinsWithWallet: (coinAmount: number) => boolean;
  exchangeCoinsToWallet: (coinAmount: number) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get transactions from storage
const getStoredTransactions = (): FinancialTransaction[] => {
    const stored = localStorage.getItem('kodik-transactions');
    return stored ? JSON.parse(stored) : [];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kodik-accessToken'));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setTransactions([]);
    localStorage.removeItem('kodik-accessToken');
    localStorage.removeItem('kodik-user-profile');
  }, []);

  const updateUserProfile = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('kodik-user-profile', JSON.stringify(updatedUser));
  };

  const addTransaction = (trx: FinancialTransaction) => {
      const newTrxList = [trx, ...transactions];
      setTransactions(newTrxList);
      localStorage.setItem('kodik-transactions', JSON.stringify(newTrxList));
  };

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      if (token) {
        const storedUser = localStorage.getItem('kodik-user-profile');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setTransactions(getStoredTransactions());
        } else {
            logout();
        }
      }
      setIsLoading(false);
    };
    verifyTokenAndFetchUser();
  }, [token, logout]);

  // --- 1. Top Up Saldo ---
  const topUpWallet = (amount: number, method: string) => {
    if (user) {
        const adminFee = 1000; 
        // Note: Dalam sistem nyata, user bayar (amount + adminFee), saldo nambah (amount).
        // Di sini kita simulasikan user sudah bayar totalnya.
        
        const updatedUser = { 
            ...user, 
            walletBalance: user.walletBalance + amount 
        };
        updateUserProfile(updatedUser);

        addTransaction({
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Top Up',
            description: `Top Up Saldo via ${method}`,
            amount: amount,
            fee: adminFee,
            method: method,
            status: 'Selesai',
            isCredit: true
        });
    }
  };

  // --- 2. Penarikan Saldo ---
  const withdrawWallet = (amount: number, bankName: string, accountNumber: string): boolean => {
    const adminFee = 5000;
    const totalDeduction = amount + adminFee;

    if (user && user.walletBalance >= totalDeduction) {
        const updatedUser = { 
            ...user, 
            walletBalance: user.walletBalance - totalDeduction 
        };
        updateUserProfile(updatedUser);

        addTransaction({
            id: `WD-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Penarikan Saldo',
            description: `Penarikan ke ${bankName} (${accountNumber})`,
            amount: amount,
            fee: adminFee,
            method: bankName,
            status: 'Selesai',
            isCredit: false
        });
        return true;
    }
    return false;
  };

  // --- 3. Beli Koin (Saldo -> Coin) ---
  // Rate: 1 Coin = 1.000 IDR
  const buyCoinsWithWallet = (coinAmount: number): boolean => {
      const cost = coinAmount * 1000;
      if (user && user.walletBalance >= cost) {
          const updatedUser = {
              ...user,
              walletBalance: user.walletBalance - cost,
              coins: user.coins + coinAmount
          };
          updateUserProfile(updatedUser);

          addTransaction({
            id: `COIN-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Beli Koin',
            description: `Pembelian ${coinAmount} Koin`,
            amount: cost,
            status: 'Selesai',
            isCredit: false
        });
          return true;
      }
      return false;
  };

  // --- 4. Tukar Koin (Coin -> Saldo) ---
  // Rate: 1 Coin = 1.000 IDR
  const exchangeCoinsToWallet = (coinAmount: number): boolean => {
      if (user && user.coins >= coinAmount) {
          const value = coinAmount * 1000;
          const updatedUser = {
              ...user,
              coins: user.coins - coinAmount,
              walletBalance: user.walletBalance + value
          };
          updateUserProfile(updatedUser);

          addTransaction({
            id: `EXC-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'Tukar Koin',
            description: `Tukar ${coinAmount} Koin ke Saldo`,
            amount: value,
            status: 'Selesai',
            isCredit: true
        });
          return true;
      }
      return false;
  }

  // --- Spend Coins (Gift) ---
  const spendCoins = (amount: number): boolean => {
    if (user && user.coins >= amount) {
        const updatedUser = { ...user, coins: user.coins - amount };
        updateUserProfile(updatedUser);
        // Usually gifting doesn't create a financial transaction record for the spender in main history, 
        // or it's a separate "Usage" history. For simplicity we skip main history or add minimal.
        return true;
    }
    return false;
  };

  const login = async (email: string, password: string, role: 'pembeli' | 'penjual') => {
    // Simulate Login
    const dummyToken = `dummy-token-for-${email}`;
    const newUserProfile: User = { 
      id: Math.floor(Math.random() * 1000), 
      email, 
      role, 
      createdAt: new Date().toISOString(),
      walletBalance: 0, 
      coins: 0,
    }; 

    localStorage.setItem('kodik-accessToken', dummyToken);
    updateUserProfile(newUserProfile);
    setTransactions([]); // Reset for new user
    setToken(dummyToken);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        login, 
        logout, 
        isAuthenticated: !!token, 
        isLoading, 
        transactions,
        topUpWallet, 
        withdrawWallet,
        spendCoins, 
        buyCoinsWithWallet,
        exchangeCoinsToWallet
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
