import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }: any) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" />;

  return children;
};