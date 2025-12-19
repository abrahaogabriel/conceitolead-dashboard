import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { ProtectedRoleRoute } from './components/Layout/ProtectedRoleRoute';
import { Users } from './pages/Users';
import { Clients } from './pages/Clients';
import { SalesGoals } from './pages/SalesGoals';
import { Governance } from './pages/Governance';
import { ProtectedStandaloneRoute } from './components/Layout/ProtectedStandaloneRoute';
import { TvDashboard } from './pages/TvDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* TV Dashboard - Standalone (No Sidebar, Dark Theme) */}
        <Route element={<ProtectedStandaloneRoute />}>
          <Route path="/tv-dashboard" element={<TvDashboard />} />
        </Route>

        {/* Protected Routes - Accessible by all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/goals" element={<SalesGoals />} />
          <Route path="/settings" element={<div>Configurações</div>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoleRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<Users />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/governance" element={<Governance />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
