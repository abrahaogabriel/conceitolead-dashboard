import React, { useState, useEffect } from 'react';
import { useGoals } from '../hooks/useGoals';
import styles from './SalesGoals.module.css';
import { Target, Trophy, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';
import { DailySalesChart } from '../components/Dashboard/DailySalesChart';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const SalesGoals: React.FC = () => {
    const { profile } = useAuth();
    const [salespeople, setSalespeople] = useState<Profile[]>([]);
    const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');

    // Estado para data estável, com navegação
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const { metrics, calendar, loading, sales } = useGoals(selectedMonth, selectedSalespersonId || undefined);

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchSalespeople();
        }
    }, [profile]);

    const fetchSalespeople = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'sales')
                .order('full_name');

            if (data) setSalespeople(data as Profile[]);
        } catch (error) {
            console.error("Erro ao buscar vendedores", error);
        }
    };

    const handlePrevMonth = () => {
        setSelectedMonth(prev => {
            const d = new Date(prev);
            d.setMonth(prev.getMonth() - 1);
            return d;
        });
    };

    const handleNextMonth = () => {
        setSelectedMonth(prev => {
            const d = new Date(prev);
            d.setMonth(prev.getMonth() + 1);
            return d;
        });
    };

    const monthLabel = selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const formattedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
                <p>Carregando metas...</p>
            </div>
        );
    }

    // Gerar Tiers dinamicamente baseado na meta
    // nivel 1 - 0,9%; nivel 2 - 1%; nivel 3 - 1,2%; nivel 4 1,5%.
    const tiers = [
        { level: 'T1 (70%)', required: metrics.target * 0.7, commission: metrics.target * 0.7 * 0.009, id: 'T1', rate: '0.9%' },
        { level: 'T2 (100%)', required: metrics.target * 1.0, commission: metrics.target * 1.0 * 0.010, id: 'T2', rate: '1.0%' },
        { level: 'T3 (150%)', required: metrics.target * 1.5, commission: metrics.target * 1.5 * 0.012, id: 'T3', rate: '1.2%' },
        { level: 'T4 (200%)', required: metrics.target * 2.0, commission: metrics.target * 2.0 * 0.015, id: 'T4', rate: '1.5%' },
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className={styles.container}>
            {/* Header com Navegação e Filtros */}
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <h1 className={styles.title}>
                        {profile?.role === 'admin'
                            ? (selectedSalespersonId ? `Metas: ${salespeople.find(s => s.id === selectedSalespersonId)?.full_name}` : 'Metas: Visão Geral')
                            : 'Minhas Metas'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acompanhe seu desempenho mensal e atingimento de níveis.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Navegador de Mês */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                        <button onClick={handlePrevMonth} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 'bold' }}>&lt;</button>
                        <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '140px', textAlign: 'center', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{monthLabel}</span>
                        <button onClick={handleNextMonth} style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 'bold' }}>&gt;</button>
                    </div>

                    {profile?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <select
                                value={selectedSalespersonId}
                                onChange={(e) => setSelectedSalespersonId(e.target.value)}
                                style={{
                                    padding: '0.6rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Visão Geral (Todos)</option>
                                <optgroup label="Vendedores">
                                    {salespeople.map(person => (
                                        <option key={person.id} value={person.id}>
                                            {person.full_name || person.email}
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Top KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}>
                            <Target size={24} color="var(--primary-main)" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Meta de Vendas</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(metrics.target)}</h3>
                        </div>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '8px' }}>
                            <Trophy size={24} color="#10b981" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Vendas Trackeadas</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(metrics.achieved)}</h3>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(metrics.percentage, 100)}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{metrics.percentage.toFixed(1)}%</p>
                </div>

                <div className={styles.kpiCard}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', background: '#fff7ed', borderRadius: '8px' }}>
                            <TrendingUp size={24} color="#f97316" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Gap (Restante)</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>
                                {formatCurrency(Math.max(0, metrics.target - metrics.achieved))}
                            </h3>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Necessário: <strong>{formatCurrency(metrics.dailyRequired)}</strong> / dia útil
                    </p>
                </div>
            </div>

            {/* Gráfico de Evolução Diária */}
            <DailySalesChart sales={sales} />

            {/* Calendário */}
            <div className={styles.tierSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <CalendarIcon size={20} color="var(--primary-main)" />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Ritmo Diário (Pacing)</h3>
                </div>

                <div className={styles.calendarGrid}>
                    {weekDays.map(d => (
                        <div key={d} className={styles.headerCell}>{d}</div>
                    ))}

                    {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.dayCell} style={{ background: '#f9fafb' }} />
                    ))}

                    {calendar.map((day) => {
                        // Lógica de Cor: 
                        // Se for fim de semana: cinza.
                        // Se passado e tiver targetValue: 
                        //    Bateu meta (>= target): Verde
                        //    Não bateu (< target): Vermelho
                        // Se futuro: padrão (azul ou cinza escuro)
                        let valueColor = 'var(--text-secondary)';

                        if (day.isPast && !day.isWeekend && day.targetValue) {
                            valueColor = day.value >= day.targetValue ? '#10b981' : '#ef4444';
                        } else if (!day.isPast && !day.isWeekend) {
                            valueColor = 'var(--primary-main)'; // Projected values in blueish
                        }

                        return (
                            <div
                                key={day.day}
                                className={`${styles.dayCell} ${day.isToday ? styles.todayCell : ''}`}
                                style={{ background: day.isWeekend ? '#fafafa' : 'white', position: 'relative' }}
                            >
                                <span className={styles.dayNumber}>{day.day}</span>
                                <div style={{ marginTop: 'auto' }}>
                                    {day.isWeekend ? (
                                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>-</span>
                                    ) : (
                                        <>
                                            {/* Exibe "Meta: R$ XXX" se for dia passado e útil */}
                                            {day.isPast && day.targetValue ? (
                                                <span style={{ fontSize: '0.6rem', display: 'block', color: '#94a3b8', marginBottom: '2px', fontWeight: 500 }}>
                                                    Meta: {new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(day.targetValue)}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                                    {day.isPast ? 'Realizado' : 'Meta'}
                                                </span>
                                            )}

                                            <span
                                                className={styles.dayValue}
                                                style={{
                                                    color: valueColor,
                                                    fontWeight: (day.isPast && !day.isWeekend) ? 700 : 500
                                                }}
                                            >
                                                {formatCurrency(day.value)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tiers / Níveis */}
            <div className={styles.tierSection}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Progresso de Níveis</h3>
                <table className={styles.tierTable}>
                    <thead>
                        <tr>
                            <th>Nível / Taxa</th>
                            <th>Faturamento Necessário</th>
                            <th>Comissão Estimada</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map((tier, index) => {
                            const isActive = metrics.currentTier === tier.id;
                            const isPassed = metrics.achieved >= tier.required;
                            const isNext = !isPassed && (index === 0 || metrics.achieved >= tiers[index - 1].required);

                            return (
                                <tr key={tier.id} className={isActive ? styles.activeRow : ''}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{tier.level}</span>
                                            <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--primary-main)' : 'var(--text-secondary)', fontWeight: 500 }}>
                                                ({tier.rate})
                                            </span>
                                            {isActive && <span style={{ fontSize: '0.7rem', background: 'var(--primary-main)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>ATUAL</span>}
                                        </div>
                                    </td>
                                    <td>{formatCurrency(tier.required)}</td>
                                    <td>{formatCurrency(tier.commission)}</td>
                                    <td>
                                        {isPassed ? (
                                            <span style={{ color: 'var(--status-success)', fontWeight: 700 }}>
                                                Conquistado
                                            </span>
                                        ) : isNext ? (
                                            <span style={{ color: 'var(--primary-main)', fontWeight: 600 }}>Em andamento</span>
                                        ) : (
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', opacity: 0.6 }}>Aguardando</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Utm Info Footer */}
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                *Valores estimados baseados no Nível Atual ({metrics.currentTier})
            </div>
        </div>
    );
};
