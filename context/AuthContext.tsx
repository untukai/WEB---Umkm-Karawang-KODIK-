import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'pembeli' | 'penjual') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  // FIX: Added spendCoins functionality for live stream gifts.
  spendCoins: (amount: number) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would be an API call. For now, we simulate it.
const fetchUserProfileByToken = async (token: string): Promise<User | null> => {
    const storedUser = localStorage.getItem('kodik-user-profile');
    if (storedUser) {
        // In a real app, you'd verify the token on the server and get the user profile.
        // Here, we just check if a profile exists for the logged-in email.
        const profile = JSON.parse(storedUser);
        if (`dummy-token-for-${profile.email}` === token) {
            return profile;
        }
    }
    return null;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kodik-accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kodik-accessToken');
    localStorage.removeItem('kodik-user-profile');
  }, []);

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      if (token) {
        try {
          const userProfile = await fetchUserProfileByToken(token);
          if (userProfile) {
            setUser(userProfile);
          } else {
            // Token is invalid or expired
            logout();
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyTokenAndFetchUser();
  }, [token, logout]);

  // FIX: Added spendCoins function implementation.
  const spendCoins = (amount: number): boolean => {
    if (user && user.coins && user.coins >= amount) {
        const updatedUser = { ...user, coins: user.coins - amount };
        setUser(updatedUser);
        // Persist updated user profile to localStorage
        localStorage.setItem('kodik-user-profile', JSON.stringify(updatedUser));
        return true;
    }
    return false;
  };

  const login = async (email: string, password: string, role: 'pembeli' | 'penjual') => {
    // Simulate API call to get a token
    console.log(`Simulating login for ${email} with password ${password}`);
    
    // In a real app, the server would return a token and user profile upon successful login.
    // For now, we create a dummy token and user profile.
    const dummyToken = `dummy-token-for-${email}`;
    const newUserProfile: User = { 
      id: 1, // Dummy ID
      email, 
      role: role as any, // Cast for simplicity as UserRole is broader
      createdAt: new Date().toISOString(),
      // FIX: Added dummy coins for new user login.
      coins: 1000,
    }; 

    // Store the token and profile separately, mimicking a real auth flow.
    localStorage.setItem('kodik-accessToken', dummyToken);
    localStorage.setItem('kodik-user-profile', JSON.stringify(newUserProfile));
    
    // Update state to trigger re-renders
    setToken(dummyToken);
    setUser(newUserProfile);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading, spendCoins }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};