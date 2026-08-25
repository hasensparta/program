import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JarsList from './pages/JarsList';
import JarDetail from './pages/JarDetail';
import CreateJar from './pages/CreateJar';
import Transactions from './pages/Transactions';
import Statistics from './pages/Statistics';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';

export default function App() {
  const isLoading = useStore(state => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐖</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">جاري تحميل حصالة...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="jars" element={<JarsList />} />
        <Route path="jars/new" element={<CreateJar />} />
        <Route path="jars/:jarId" element={<JarDetail />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}