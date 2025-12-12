import React from 'react';
import { Card } from '../UI/Card';
import { Users } from 'lucide-react';

interface ClientSalesData {
    name: string;
    value: number;
    color: string;
}

interface ClientSalesChartProps {
    data: ClientSalesData[];
}

export const ClientSalesChart: React.FC<ClientSalesChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const totalSales = data.reduce((acc, d) => acc + d.value, 0);

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Top Clientes</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Por volume de vendas</p>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <Users size={20} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                        Nenhuma venda registrada
                    </p>
                ) : (
                    data.map((client, index) => {
                        const percentage = (client.value / maxValue) * 100;
                        const sharePercentage = totalSales > 0 ? Math.round((client.value / totalSales) * 100) : 0;

                        return (
                            <div key={index}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: client.color,
                                            flexShrink: 0
                                        }} />
                                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{client.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)' }}>
                                        {client.value} vendas
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        backgroundColor: client.color,
                                        borderRadius: '4px',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.25rem',
                                    textAlign: 'right'
                                }}>
                                    {sharePercentage}% do total
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {totalSales > 0 && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total de vendas:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)' }}>
                        {totalSales}
                    </span>
                </div>
            )}
        </Card>
    );
};
