import React, { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { TrendingUp, Calendar } from 'lucide-react';

interface DataPoint {
    label: string;
    value: number;
    date: Date;
}

interface SalesEvolutionChartProps {
    sales: any[]; // Recebe as vendas brutas
}

type Period = 'day' | 'week' | 'month' | 'quarter';

export const SalesEvolutionChart: React.FC<SalesEvolutionChartProps> = ({ sales }) => {
    const [period, setPeriod] = useState<Period>('month');

    const chartData = useMemo(() => {
        const now = new Date();
        const data: DataPoint[] = [];

        if (period === 'day') {
            // Últimos 7 dias
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dayKey = date.toISOString().split('T')[0];

                const count = sales.filter(sale => {
                    const saleDate = new Date(sale.sale_date).toISOString().split('T')[0];
                    return saleDate === dayKey;
                }).length;

                data.push({
                    label: date.getDate().toString(),
                    value: count,
                    date: new Date(date)
                });
            }
        } else if (period === 'week') {
            // Últimas 8 semanas
            for (let i = 7; i >= 0; i--) {
                const weekEnd = new Date(now);
                weekEnd.setDate(weekEnd.getDate() - (i * 7));
                const weekStart = new Date(weekEnd);
                weekStart.setDate(weekStart.getDate() - 6);

                const count = sales.filter(sale => {
                    const saleDate = new Date(sale.sale_date);
                    return saleDate >= weekStart && saleDate <= weekEnd;
                }).length;

                data.push({
                    label: `S${8 - i}`,
                    value: count,
                    date: weekEnd
                });
            }
        } else if (period === 'month') {
            // Últimos 6 meses
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                const count = sales.filter(sale => {
                    const saleMonth = new Date(sale.sale_date).toISOString().slice(0, 7);
                    return saleMonth === monthKey;
                }).length;

                data.push({
                    label: monthNames[date.getMonth()],
                    value: count,
                    date: new Date(date)
                });
            }
        } else if (period === 'quarter') {
            // Últimos 4 trimestres
            for (let i = 3; i >= 0; i--) {
                const quarterEnd = new Date(now);
                quarterEnd.setMonth(quarterEnd.getMonth() - (i * 3));
                const quarterStart = new Date(quarterEnd);
                quarterStart.setMonth(quarterStart.getMonth() - 2);
                quarterStart.setDate(1);

                const count = sales.filter(sale => {
                    const saleDate = new Date(sale.sale_date);
                    return saleDate >= quarterStart && saleDate <= quarterEnd;
                }).length;

                const quarterNum = Math.floor((quarterEnd.getMonth() + 3) / 3);
                data.push({
                    label: `Q${quarterNum}`,
                    value: count,
                    date: quarterEnd
                });
            }
        }

        return data;
    }, [sales, period]);

    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const avgValue = chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length;

    const getPeriodLabel = () => {
        switch (period) {
            case 'day': return 'Últimos 7 dias';
            case 'week': return 'Últimas 8 semanas';
            case 'month': return 'Últimos 6 meses';
            case 'quarter': return 'Últimos 4 trimestres';
        }
    };

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Evolução de Vendas</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getPeriodLabel()}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setPeriod('day')}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: period === 'day' ? 'var(--primary-light)' : 'white',
                            color: period === 'day' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Dia
                    </button>
                    <button
                        onClick={() => setPeriod('week')}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: period === 'week' ? 'var(--primary-light)' : 'white',
                            color: period === 'week' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: period === 'month' ? 'var(--primary-light)' : 'white',
                            color: period === 'month' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => setPeriod('quarter')}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: period === 'quarter' ? 'var(--primary-light)' : 'white',
                            color: period === 'quarter' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Trimestre
                    </button>
                </div>
            </div>

            {/* Gráfico de Barras */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: period === 'day' ? '0.5rem' : '0.75rem', height: '220px', padding: '1rem 0', position: 'relative' }}>
                {/* Linha de média */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: `${(avgValue / maxValue) * 100}%`,
                    height: '1px',
                    borderTop: '2px dashed #cbd5e1',
                    zIndex: 1
                }} />

                {chartData.map((item, index) => {
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    const isHighest = item.value === maxValue && maxValue > 0;
                    const isAboveAvg = item.value > avgValue;

                    return (
                        <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
                            <div style={{
                                width: '100%',
                                height: `${Math.max(percentage, 3)}%`,
                                background: isHighest
                                    ? 'linear-gradient(180deg, var(--primary-light), var(--primary-main))'
                                    : isAboveAvg
                                        ? 'linear-gradient(180deg, var(--secondary-light), var(--secondary-main))'
                                        : 'linear-gradient(180deg, #cbd5e1, #94a3b8)',
                                borderRadius: '6px 6px 0 0',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: isHighest ? '0 4px 12px rgba(18, 182, 138, 0.3)' : 'none'
                            }}
                                title={`${item.value} ${item.value === 1 ? 'venda' : 'vendas'}`}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1.05)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scaleY(1)';
                                    e.currentTarget.style.filter = 'brightness(1)';
                                }}
                            >
                                {item.value > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-22px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        color: isHighest ? 'var(--primary-main)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap',
                                        background: 'white',
                                        padding: '2px 4px',
                                        borderRadius: '4px'
                                    }}>
                                        {item.value}
                                    </span>
                                )}
                            </div>
                            <span style={{
                                fontSize: '0.7rem',
                                color: isHighest ? 'var(--primary-main)' : 'var(--text-secondary)',
                                fontWeight: isHighest ? 600 : 400,
                                textAlign: 'center'
                            }}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Estatísticas */}
            <div style={{
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem'
            }}>
                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #bbf7d0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <TrendingUp size={14} color="var(--primary-main)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Média</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-main)' }}>
                        {Math.round(avgValue)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                        vendas
                    </span>
                </div>

                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #fde68a'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Calendar size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pico</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b' }}>
                        {maxValue}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>
                        vendas
                    </span>
                </div>
            </div>
        </Card>
    );
};
