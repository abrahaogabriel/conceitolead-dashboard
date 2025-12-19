import React from 'react';
import { Card } from '../UI/Card';
import type { Sale } from '../../types';
import { useNavigate } from 'react-router-dom';

interface RecentSalesProps {
    sales: Sale[];
}

export const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
    const navigate = useNavigate();

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.125rem' }}>Últimas Vendas</h3>
                <button
                    onClick={() => navigate('/sales')}
                    style={{
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        color: 'var(--primary-main)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Ver todas &rarr;
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sales.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhuma venda recente.</p>
                ) : (
                    sales.slice(0, 6).map((sale) => (
                        <div key={sale.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{sale.buyer_name || 'Comprador'}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(sale.sale_date).toLocaleDateString()} at {new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                    {sale.product_name}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
