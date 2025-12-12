import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
    trend: string;
    icon: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon }) => (
    <div style={{
        backgroundColor: 'var(--background-paper)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</h3>
            <div style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%' }}>
                {icon}
            </div>
        </div>
        <div>
            <p style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{value}</p>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{
                    backgroundColor: '#dcfce7', // Success light green
                    color: '#166534', // Success dark green
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginRight: '6px',
                    fontWeight: 600
                }}>{trend}</span>
                <span style={{ color: 'var(--text-secondary)' }}>vs mês passado</span>
            </div>
        </div>
    </div>
);
