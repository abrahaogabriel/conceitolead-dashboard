import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';

interface ProtectedRoleRouteProps {
    allowedRoles: ('admin' | 'sales' | 'client')[];
}

export const ProtectedRoleRoute: React.FC<ProtectedRoleRouteProps> = ({ allowedRoles }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (!profile || !allowedRoles.includes(profile.role)) {
        return <Navigate to="/" replace />;
    }

    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};
