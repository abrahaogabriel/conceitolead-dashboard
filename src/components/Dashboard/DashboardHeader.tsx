import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
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

    // Quick filter presets
    const setQuickFilter = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setFilters({
            ...filters,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
    };

    const isActiveQuickFilter = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        return filters.startDate === start.toISOString().split('T')[0] &&
            filters.endDate === end.toISOString().split('T')[0];
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Acompanhe suas vendas, metas e performance em tempo real.</p>
                </div>
            </div>

            {profile?.role === 'admin' && (
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    padding: '1.25rem',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    {/* Quick Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '0.5rem' }}>
                            PERÍODO:
                        </span>
                        {[7, 30, 90].map(days => (
                            <button
                                key={days}
                                onClick={() => setQuickFilter(days)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${isActiveQuickFilter(days) ? 'var(--primary-main)' : 'var(--border-color)'}`,
                                    backgroundColor: isActiveQuickFilter(days) ? 'var(--primary-light)' : 'white',
                                    color: isActiveQuickFilter(days) ? 'var(--primary-main)' : 'var(--text-secondary)',
                                    fontSize: '0.813rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {days === 7 ? '7 dias' : days === 30 ? '30 dias' : '90 dias'}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)' }} />

                    {/* Custom Date Range */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar size={18} color="var(--text-secondary)" />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>até</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            style={{
                                padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-color)' }} />

                    {/* Client Filter */}
                    <div style={{ position: 'relative', minWidth: '200px' }}>
                        <select
                            value={filters.clientId}
                            onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.625rem 2.5rem 0.625rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'white',
                                color: filters.clientId ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: filters.clientId ? 500 : 400,
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none'
                            }}
                        >
                            <option value="">Todos os Clientes</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none',
                                color: 'var(--text-secondary)'
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
