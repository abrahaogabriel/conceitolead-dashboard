import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
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

interface DailySalesChartProps {
    sales: any[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    }).format(value);
};

export const DailySalesChart: React.FC<DailySalesChartProps> = ({ sales }) => {

    const chartData = useMemo(() => {
        const now = new Date();
        const data: DataPoint[] = [];

        // Últimos 30 dias
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split('T')[0];

            // Soma o amount (faturamento) do dia
            const dailyTotal = sales
                .filter(sale => {
                    const saleDate = new Date(sale.sale_date).toISOString().split('T')[0];
                    return saleDate === dayKey;
                })
                .reduce((acc, curr) => acc + Number(curr.amount), 0);

            data.push({
                label: date.getDate().toString(), // Dia do mês
                value: dailyTotal,
                date: new Date(date)
            });
        }
        return data;
    }, [sales]);

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    outline: 'none',
                    zIndex: 100
                }}>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600
                    }}>
                        Dia {label}
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--primary-main)',
                        margin: 0
                    }}>
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} color="var(--primary-main)" />
                        Evolução de Faturamento (30 dias)
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Faturamento diário nos últimos 30 dias</p>
                </div>

                <div style={{
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACUMULADO 30D</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-main)' }}>
                        {formatCurrency(chartData.reduce((a, b) => a + b.value, 0))}
                    </span>
                </div>
            </div>

            {/* Gráfico Grande */}
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value === maxValue && maxValue > 0 ? 'var(--primary-main)' : '#94a3b8'}
                                    fillOpacity={entry.value === maxValue ? 1 : 0.7}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
