import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { useDashboardData } from '../hooks/useDashboardData';
import { ArrowUpRight, Clock, CheckCircle2, MoreHorizontal, Video, Filter } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Client } from '../types';

export const Dashboard: React.FC = () => {
    const { metrics, sales, loading, filters, setFilters } = useDashboardData();
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, name').eq('active', true);
            if (data) setClients(data as Client[]);
        };
        fetchClients();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background-default)' }}>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'var(--font-family)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acompanhe suas vendas, metas e performance.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                        <Filter size={16} color="var(--text-secondary)" style={{ marginLeft: '0.5rem' }} />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            style={{ border: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>até</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            style={{ border: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                        />
                    </div>

                    <select
                        value={filters.clientId}
                        onChange={(e) => setFilters(prev => ({ ...prev, clientId: e.target.value }))}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'white',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="">Todos os Clientes</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>

                    <button style={{
                        backgroundColor: 'var(--primary-main)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 500,
                        boxShadow: 'var(--shadow-lg)',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                        + Nova Venda
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Primary Card - Dark Green */}
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
                        <h3 style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>Vendas Totais</h3>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                            <ArrowUpRight size={20} color="white" />
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{metrics.totalSales}</p>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>+5</span>
                            Novas este mês
                        </div>
                    </div>
                </div>

                {/* Secondary Cards */}
                <KPICard
                    title="Faturamento"
                    value={formatCurrency(metrics.totalRevenue)}
                    trend="+12%"
                    icon={<CheckCircle2 size={24} />}
                />
                <KPICard
                    title="Comissão Estimada"
                    value={formatCurrency(metrics.totalCommission)}
                    trend="+8%"
                    icon={<Clock size={24} />}
                />
                <KPICard
                    title="Ticket Médio"
                    value={formatCurrency(metrics.averageTicket)}
                    trend="Estável"
                    icon={<ArrowUpRight size={24} />}
                />
            </div>

            {/* Middle Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                {/* Analytics / Chart Placeholder */}
                <Card className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Performance de Vendas</h3>
                        <MoreHorizontal size={20} color="var(--text-secondary)" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingTop: '1rem' }}>
                        {[40, 70, 45, 90, 60, 50, 65].map((h, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '24px',
                                    height: `${h}%`,
                                    backgroundColor: i === 3 ? 'var(--primary-main)' : (i % 2 === 0 ? 'var(--text-disabled)' : 'var(--secondary-light)'),
                                    borderRadius: '20px',
                                    opacity: i === 3 ? 1 : 0.5
                                }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Reminders / Next Meeting */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Próxima Reunião</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--primary-main)', fontWeight: 600 }}>Ver todas</p>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Apresentação Comercial</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cliente: Grupo Modelo</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Hoje, 14:00 - 15:00</p>
                    </div>
                    <button style={{
                        width: '100%',
                        backgroundColor: 'var(--primary-main)',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Video size={18} />
                        Iniciar Reunião
                    </button>
                </Card>

                {/* Recent Sales List */}
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
                        {sales.slice(0, 4).map((sale) => (
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
                        ))}
                    </div>
                </Card>
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Team Collaboration */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Equipe</h3>
                        <button style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '99px', padding: '0.25rem 0.75rem' }}>
                            + Membro
                        </button>
                    </div>
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Membro da Equipe {i + 1}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendedor</p>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px' }}>Ativo</span>
                        </div>
                    ))}
                </Card>

                {/* Progress Donut */}
                <Card>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Progresso da Meta</h3>
                    <div style={{
                        position: 'relative',
                        width: '200px',
                        height: '100px',
                        overflow: 'hidden',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            width: '200px',
                            height: '200px',
                            background: `conic-gradient(var(--primary-main) 0% 65%, #e2e8f0 65% 100%)`,
                            borderRadius: '50%',
                            transform: 'rotate(-117deg)'
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            width: '160px',
                            height: '160px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingTop: '30px'
                        }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>65%</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendas do Mês</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-main)' }} />
                            <span style={{ fontSize: '0.75rem' }}>Realizado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e2e8f0' }} />
                            <span style={{ fontSize: '0.75rem' }}>Restante</span>
                        </div>
                    </div>
                </Card>

                {/* Dark Card - Time Tracker / Promo */}
                <div style={{
                    background: 'url("https://img.freepik.com/free-vector/gradient-black-backgrounds-with-golden-frames_23-2149150604.jpg?t=st=1708611111~exp=1708614711~hmac=...") center/cover no-repeat',
                    backgroundColor: 'var(--primary-dark)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, var(--primary-dark) 0%, transparent 100%)', zIndex: 1 }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Mobile App</h3>
                        <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Baixe nosso aplicativo para acompanhar suas vendas de qualquer lugar.</p>
                        <button style={{
                            background: 'var(--secondary-main)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 600,
                            width: '100%'
                        }}>
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard: React.FC<{ title: string, value: string, trend: string, icon: React.ReactNode }> = ({ title, value, trend, icon }) => (
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
                    backgroundColor: '#dcfce7',
                    color: '#166534',
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

