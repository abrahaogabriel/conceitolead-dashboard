import React from 'react';
import { Card } from '../UI/Card';
import { TrendingUp } from 'lucide-react';

interface MonthData {
    month: string;
    value: number;
}

interface SalesEvolutionChartProps {
    data: MonthData[];
}

export const SalesEvolutionChart: React.FC<SalesEvolutionChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Evolução Mensal</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Últimos 6 meses</p>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-main), var(--secondary-main))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    <TrendingUp size={20} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '200px', padding: '1rem 0' }}>
                {data.map((item, index) => {
                    const percentage = (item.value / maxValue) * 100;
                    const isHighest = item.value === maxValue;

                    return (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: `${Math.max(percentage, 5)}%`,
                                background: isHighest
                                    ? 'linear-gradient(180deg, var(--primary-main), var(--secondary-main))'
                                    : 'linear-gradient(180deg, #e2e8f0, #cbd5e1)',
                                borderRadius: '8px 8px 0 0',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                                title={`${item.value} vendas`}
                            >
                                {isHighest && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-24px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: 'var(--primary-main)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.value}
                                    </span>
                                )}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                fontWeight: isHighest ? 600 : 400
                            }}>
                                {item.month}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Média mensal:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-main)' }}>
                    {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)} vendas
                </span>
            </div>
        </Card>
    );
};
