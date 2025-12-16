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

    // Ajusta steps dinamicamente: se maxValue < 5, usa o próprio valor como steps para evitar decimais/repetições
    const steps = maxValue < 5 ? Math.max(maxValue, 1) : 5;
    const yAxisLabels = Array.from({ length: steps + 1 }, (_, i) => {
        const value = (maxValue / steps) * i;
        // Garante que não apareçam casas decimais se não necessário
        return Number.isInteger(value) ? value : Math.round(value * 10) / 10;
    }).map(v => Math.floor(v)).reverse(); // Força inteiros para vendas

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>Evolução de Vendas</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{getPeriodLabel()}</p>
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

            {/* Container do Gráfico com Eixo Y */}
            <div style={{ display: 'flex', height: '250px', gap: '1rem', marginTop: '1rem' }}>

                {/* Eixo Y */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {yAxisLabels.map((label, index) => (
                        <span key={index}>{label}</span>
                    ))}
                </div>

                {/* Área de Plotagem */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', paddingBottom: '2rem' }}>

                    {/* Linhas de Grade de Fundo */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                        {yAxisLabels.map((_, index) => (
                            <div key={index} style={{ width: '100%', height: '1px', backgroundColor: index === steps ? 'transparent' : '#f1f5f9' }} />
                        ))}
                    </div>

                    {/* Linha de Média */}
                    {avgValue > 0 && (
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: `calc(2rem + ${(avgValue / maxValue) * 100 * (250 - 32) / 250}px)`, // Ajuste aproximado
                            height: '1px',
                            borderTop: '2px dashed var(--status-warning)',
                            zIndex: 1,
                            opacity: 0.7
                        }} title={`Média: ${Math.round(avgValue)}`} />
                    )}

                    {/* Barras */}
                    <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', zIndex: 2 }}>
                        {chartData.map((item, index) => {
                            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                            return (
                                <div key={index} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', maxWidth: '60px' }}>

                                    {/* A Barra */}
                                    <div style={{
                                        width: '60%',
                                        height: `${percentage}%`,
                                        minHeight: item.value > 0 ? '4px' : '0',
                                        background: 'var(--primary-main)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.5s ease',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                        title={`${item.label}: ${item.value} vendas`}
                                    >
                                        {/* Tooltip on Hover (simples) */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-25px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#1e293b',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            whiteSpace: 'nowrap',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            pointerEvents: 'none'
                                        }} className="chart-tooltip">
                                            {item.value}
                                        </div>
                                    </div>

                                    {/* Label X */}
                                    <span style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        fontSize: '0.7rem',
                                        color: 'var(--text-secondary)',
                                        marginTop: '0.5rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>
                {`
                .chart-tooltip { opacity: 0; }
                div:hover > .chart-tooltip { opacity: 1; }
                `}
            </style>

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
