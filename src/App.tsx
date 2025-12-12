import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { ProtectedRoleRoute } from './components/Layout/ProtectedRoleRoute';
import { Users } from './pages/Users';
import { Clients } from './pages/Clients';
import { SalesGoals } from './pages/SalesGoals';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Accessible by all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Dashboard />} /> {/* Reuse dashboard for sales for now as View */}
          <Route path="/goals" element={<SalesGoals />} />
          <Route path="/settings" element={<div>Configurações</div>} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoleRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<Users />} />
          <Route path="/clients" element={<Clients />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
