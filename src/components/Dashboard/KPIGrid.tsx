import React from 'react';
import { ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { KPICard } from './KPICard';

interface DashboardMetrics {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
    averageTicket: number;
}

interface DashboardTrends {
    salesTrend: string;
    revenueTrend: string;
    commissionTrend: string;
    ticketTrend: string;
}

interface KPIGridProps {
    metrics: DashboardMetrics;
    trends: DashboardTrends;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ metrics, trends }) => {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Primary Card - Dark Green - Unique Style */}
            <div style={{
                backgroundColor: 'var(--primary-main)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 500, color: 'white' }}>Vendas Totais</h3>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                        <ArrowUpRight size={20} color="white" />
                    </div>
                </div>
                <div>
                    <p style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{metrics.totalSales}</p>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{trends.salesTrend}</span>
                        vs mês passado
                    </div>
                </div>
            </div>

            {/* Secondary Cards */}
            <KPICard
                title="Faturamento"
                value={formatCurrency(metrics.totalRevenue)}
                trend={trends.revenueTrend}
                icon={<CheckCircle2 size={24} />}
            />
            <KPICard
                title="Comissão Estimada"
                value={formatCurrency(metrics.totalCommission)}
                trend={trends.commissionTrend}
                icon={<Clock size={24} />}
            />
            <KPICard
                title="Ticket Médio"
                value={formatCurrency(metrics.averageTicket)}
                trend={trends.ticketTrend}
                icon={<ArrowUpRight size={24} />}
            />
        </div>
    );
};
