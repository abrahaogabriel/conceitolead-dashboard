import React, { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { TrendingUp, Calendar, Maximize2, Minimize2 } from 'lucide-react';
import { DailySalesChart } from './DailySalesChart';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

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
    const [isExpanded, setIsExpanded] = useState(false);

    // Lógica de processamento de dados mantida
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
                    label: date.getDate().toString(), // Dia do mês
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

    // Estilo personalizado para o Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    outline: 'none'
                }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600
                    }}>
                        {label}
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--primary-main)',
                        margin: 0
                    }}>
                        {payload[0].value} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>vendas</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isExpanded) {
        return (
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setIsExpanded(false)}
                    style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '1rem',
                        zIndex: 10,
                        background: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    <Minimize2 size={18} color="var(--text-secondary)" />
                </button>
                <DailySalesChart sales={sales} />
            </div>
        );
    }

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Evolução de Vendas</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getPeriodLabel()}</p>
                        <button
                            onClick={() => setIsExpanded(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--text-secondary)'
                            }}
                            title="Expandir para ver Faturamento Diário"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(['day', 'week', 'month', 'quarter'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                background: period === p ? 'var(--primary-light)' : 'white',
                                color: period === p ? 'white' : 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {p === 'day' ? 'Dia' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Trimestre'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Container Responsivo do Recharts */}
            <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 10,
                            left: -20, // Ajuste para aproximar o eixo Y
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            allowDecimals={false} // Evita decimais (0.5 vendas)
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                        {/* <ReferenceLine y={avgValue} stroke="#f59e0b" strokeDasharray="3 3" /> */}
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value === maxValue && maxValue > 0 ? 'var(--primary-main)' : '#cbd5e1'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
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
