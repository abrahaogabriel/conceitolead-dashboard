import React, { useState, useEffect } from 'react';
import { useGoals } from '../hooks/useGoals';
import styles from './SalesGoals.module.css';
import { Target, Trophy, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

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

    // Estado para data estável, evitando loop infinito no useEffect
    const [selectedMonth] = useState(new Date());

    const { metrics, calendar, loading } = useGoals(selectedMonth, selectedSalespersonId || undefined);

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchSalespeople();
        }
    }, [profile]);

    const fetchSalespeople = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'sales')
            .order('full_name');

        if (data) setSalespeople(data as Profile[]);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Carregando metas...</p>
            </div>
        );
    }

    // Gerar Tiers dinamicamente baseado na meta
    // Regra estimada do print: T1=70%, T2=100%, T3=150%, T4=200%
    const tiers = [
        { level: 'T1 (70%)', required: metrics.target * 0.7, commission: metrics.target * 0.7 * 0.007, id: 'T1' },
        { level: 'T2 (100%)', required: metrics.target * 1.0, commission: metrics.target * 1.0 * 0.008, id: 'T2' },
        { level: 'T3 (150%)', required: metrics.target * 1.5, commission: metrics.target * 1.5 * 0.011, id: 'T3' },
        { level: 'T4 (200%)', required: metrics.target * 2.0, commission: metrics.target * 2.0 * 0.024, id: 'T4' },
    ];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className={styles.title}>
                        {profile?.role === 'admin'
                            ? (selectedSalespersonId ? `Metas: ${salespeople.find(s => s.id === selectedSalespersonId)?.full_name}` : 'Metas: Visão Geral')
                            : 'Minhas Metas'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acompanhe seu desempenho mensal e atingimento de níveis.</p>
                </div>

                {profile?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            value={selectedSalespersonId}
                            onChange={(e) => setSelectedSalespersonId(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.875rem'
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

            {/* Tiers / Níveis */}
            <div className={styles.tierSection}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Progresso de Níveis</h3>
                <table className={styles.tierTable}>
                    <thead>
                        <tr>
                            <th>Nível</th>
                            <th>Faturamento Necessário</th>
                            <th>Comissão Estimada</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map((tier) => {
                            const isActive = metrics.currentTier === tier.id;
                            const isPassed = metrics.achieved >= tier.required;

                            return (
                                <tr key={tier.id} className={isActive ? styles.activeRow : ''} style={{ opacity: isPassed || isActive ? 1 : 0.6 }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {tier.level}
                                            {isActive && <span style={{ fontSize: '0.7rem', background: 'white', color: 'var(--primary-main)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ATUAL</span>}
                                        </div>
                                    </td>
                                    <td>{formatCurrency(tier.required)}</td>
                                    <td>{formatCurrency(tier.commission)}</td>
                                    <td>
                                        {isPassed ? (
                                            <span style={{ color: isActive ? 'white' : 'var(--status-success)', fontWeight: 700 }}>Conquistado</span>
                                        ) : (
                                            <span style={{ fontSize: '0.875rem' }}>Em andamento</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

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

                    {/* Padding para começar no dia da semana correto */}
                    {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className={styles.dayCell} style={{ background: '#f9fafb' }} />
                    ))}

                    {calendar.map((day) => (
                        <div
                            key={day.day}
                            className={`${styles.dayCell} ${day.isToday ? styles.todayCell : ''}`}
                            style={{ background: day.isWeekend ? '#fafafa' : 'white' }}
                        >
                            <span className={styles.dayNumber}>{day.day}</span>
                            <div style={{ marginTop: 'auto' }}>
                                {day.isWeekend ? (
                                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>-</span>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-secondary)' }}>
                                            {day.isPast ? 'Realizado' : 'Meta'}
                                        </span>
                                        <span className={`${styles.dayValue} ${day.isPast ? styles.pastValue : styles.futureValue}`}>
                                            {formatCurrency(day.value)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Utm Info Footer */}
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                *Valores estimados baseados no Nível Atual ({metrics.currentTier})
            </div>
        </div>
    );
};
