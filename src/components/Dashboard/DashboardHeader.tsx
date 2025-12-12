import React from 'react';
import { Filter } from 'lucide-react';
import type { Client } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardHeaderProps {
    filters: {
        startDate: string;
        endDate: string;
        clientId: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        startDate: string;
        endDate: string;
        clientId: string;
    }>>;
    clients: Client[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filters, setFilters, clients }) => {
    const { profile } = useAuth();

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Acompanhe suas vendas, metas e performance.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Filters */}
                {profile?.role === 'admin' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                            <Filter size={16} color="var(--text-secondary)" style={{ marginLeft: '0.5rem' }} />
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                style={{ border: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                            />
                            <span style={{ color: 'var(--text-secondary)' }}>até</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                style={{ border: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>

                        <select
                            value={filters.clientId}
                            onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'white',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="">Todos os Clientes</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </>
                )}

                <button style={{
                    backgroundColor: 'var(--primary-main)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 500,
                    boxShadow: 'var(--shadow-lg)',
                    border: 'none',
                    cursor: 'pointer'
                }}>
                    + Nova Venda
                </button>
            </div>
        </div>
    );
};
