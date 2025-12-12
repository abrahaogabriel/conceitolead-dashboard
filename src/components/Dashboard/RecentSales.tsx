import React from 'react';
import { Card } from '../UI/Card';
import type { Sale } from '../../types';

interface RecentSalesProps {
    sales: Sale[];
}

export const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem' }}>Últimas Vendas</h3>
                <button style={{
                    fontSize: '0.875rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    border: '1px solid var(--border-color)'
                }}>+ Nova</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sales.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhuma venda recente.</p>
                ) : (
                    sales.slice(0, 4).map((sale) => (
                        <div key={sale.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--background-default)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 600, color: 'var(--primary-main)'
                            }}>
                                {sale.product_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sale.product_name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {new Date(sale.sale_date).toLocaleDateString()} • {sale.status}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
