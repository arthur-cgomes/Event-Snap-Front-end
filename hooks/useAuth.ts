
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useAuth = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  const { user, loading, login, logout } = context;
  return { user, loading, login, logout };
};
