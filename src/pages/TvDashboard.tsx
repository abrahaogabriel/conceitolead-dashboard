import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize, Trophy } from 'lucide-react';
import { supabase } from '../services/supabase';
import styles from './TvDashboard.module.css';
import confetti from 'canvas-confetti';
import logoVertical from '../assets/logo-vertical-branco.png';

interface SalesPersonMetric {
    id: string;
    name: string;
    photo?: string;
    target: number;
    achieved: number;
    percentage: number;
    gap: number;
    projected: number;
    // New fields
    dailyTarget: number;
    todaySales: number;
    dailyPercentage: number;
    isDailyHit: boolean;
}

export const TvDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<SalesPersonMetric[]>([]);
    const [grandTotal, setGrandTotal] = useState({
        target: 0,
        achieved: 0,
        gap: 0,
        percentage: 0
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showNotification, setShowNotification] = useState<{ show: boolean, amount: number, sellerName?: string } | null>(null);

    useEffect(() => {
        fetchTvData();
        toggleFullScreen();

        document.addEventListener('fullscreenchange', () => {
            setIsFullscreen(!!document.fullscreenElement);
        });

        const subscription = supabase
            .channel('tv-dashboard-sales')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sales' },
                async (payload) => {
                    console.log('Nova venda recebida via Realtime!', payload);
                    const newSale = payload.new;

                    let sellerName = 'Alguém';
                    if (newSale.salesperson_id) {
                        const { data } = await supabase.from('profiles').select('full_name').eq('id', newSale.salesperson_id).single();
                        if (data) sellerName = data.full_name || 'Vendedor';
                    }

                    handleNewSale(Number(newSale.amount), sellerName);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };

    }, []);

    const handleNewSale = (amount: number, sellerName: string) => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplay blocked', e));

        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        setShowNotification({ show: true, amount, sellerName });
        fetchTvData();
        setTimeout(() => setShowNotification(null), 5000);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.log("Auto-fullscreen blocked, user interaction needed.", e);
            });
        }
    };

    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const fetchTvData = async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['sales', 'admin'])
                .order('full_name');

            const { data: goals } = await supabase
                .from('sales_goals')
                .select('*')
                .eq('month', month)
                .eq('year', year);

            const { data: sales } = await supabase
                .from('sales')
                .select('*')
                .gte('sale_date', startDate)
                .lte('sale_date', endDate)
                .neq('status', 'cancelled');

            if (!profiles) return;

            // Helper para contar dias úteis restantes (incluindo hoje se for útil)
            const countWorkingDaysLeft = () => {
                let count = 0;
                const daysInMonth = new Date(year, month, 0).getDate();
                const currentDay = today.getDate();

                for (let d = currentDay; d <= daysInMonth; d++) {
                    const dateObj = new Date(year, month - 1, d);
                    const dayOfWeek = dateObj.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0=Dom, 6=Sab
                        count++;
                    }
                }
                return count;
            };

            const workingDaysLeft = countWorkingDaysLeft();

            const processed = profiles.map(p => {
                const userGoal = goals?.find(g => g.salesperson_id === p.id);
                const target = userGoal ? Number(userGoal.target_amount) : 0;

                const userSales = sales?.filter(s => {
                    const idMatch = s.salesperson_id === p.id;
                    const utmMatch = p.utm_code && s.utm_source && (s.utm_source.toLowerCase() === p.utm_code.toLowerCase());
                    return idMatch || utmMatch;
                }) || [];

                const achieved = userSales.reduce((acc, curr) => acc + Number(curr.amount), 0);

                // Today Sales (Local Time Match)
                const todayStr = today.toLocaleDateString('pt-BR');
                const todaySalesVal = userSales
                    .filter(s => new Date(s.sale_date).toLocaleDateString('pt-BR') === todayStr)
                    .reduce((acc, curr) => acc + Number(curr.amount), 0);

                const daysInMonth = new Date(year, month, 0).getDate();
                const currentDay = today.getDate();
                const projected = currentDay > 0 ? (achieved / currentDay) * daysInMonth : achieved;

                // Daily Target Logic (Pacing)
                // Quanto falta (tirando o que já fiz hoje, para calcular a base de "início do dia"?)
                // Não, a lógica do calendário é: (Meta Total - RealizadoAtéOntem) / DiasÚteisRestantes
                const achievedUntilYesterday = achieved - todaySalesVal;
                let baseDailyTarget = 0;

                if (target > 0 && workingDaysLeft > 0) {
                    baseDailyTarget = Math.max(0, target - achievedUntilYesterday) / workingDaysLeft;
                }

                // Incentive Logic
                const isDailyHit = todaySalesVal >= baseDailyTarget && baseDailyTarget > 0;
                // Se bateu a meta, a "Meta Exibida" aumenta 40%
                const displayDailyTarget = isDailyHit ? baseDailyTarget * 1.4 : baseDailyTarget;
                const dailyPercentage = displayDailyTarget > 0 ? (todaySalesVal / displayDailyTarget) * 100 : 0;

                return {
                    id: p.id,
                    name: p.full_name || p.email || 'Vendedor',
                    photo: undefined,
                    target,
                    achieved,
                    percentage: target > 0 ? (achieved / target) * 100 : 0,
                    gap: Math.max(0, target - achieved),
                    projected,
                    // Daily
                    dailyTarget: displayDailyTarget, // Exibe a meta ajustada
                    todaySales: todaySalesVal,
                    dailyPercentage,
                    isDailyHit
                };
            });

            const activeSalespeople = processed.filter(p => p.target > 0 || p.achieved > 0);
            activeSalespeople.sort((a, b) => b.percentage - a.percentage);

            setMetrics(activeSalespeople);

            const totalTarget = activeSalespeople.reduce((acc, curr) => acc + curr.target, 0);
            const totalAchieved = sales?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

            setGrandTotal({
                target: totalTarget,
                achieved: totalAchieved,
                gap: Math.max(0, totalTarget - totalAchieved),
                percentage: totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0
            });

            setLoading(false);

        } catch (error) {
            console.error("Erro ao buscar dados da TV", error);
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

    if (loading) {
        return (
            <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: '#64748b' }}>Carregando dados da TV...</div>
            </div>
        );
    }

    return (
        <div className={styles.container} ref={containerRef}>
            {showNotification && (
                <div className={styles.notificationOverlay}>
                    <div className={styles.notificationCard}>
                        <div className={styles.notificationIcon}>
                            <Trophy size={48} color="white" />
                        </div>
                        <div className={styles.notificationContent}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: 0, textTransform: 'uppercase' }}>Nova Venda!</h2>
                            <p style={{ fontSize: '1.25rem', color: 'white', margin: '0.5rem 0' }}>
                                {showNotification.sellerName} acabou de vender
                            </p>
                            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                                {formatCurrency(showNotification.amount)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <div style={{ display: 'flex', gap: '1rem', justifySelf: 'start' }}>
                    <button onClick={() => navigate('/goals')} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Voltar
                    </button>
                    <button onClick={handleToggleFullscreen} className={styles.backButton} title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}>
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>

                <img src={logoVertical} alt="Conceito Lead" className={styles.logo} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifySelf: 'end' }}>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--primary-main)' }}>Dashboard de Vendas</h1>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.globalStats}>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Meta Global</span>
                    <span className={`${styles.statValue} ${styles.neutral}`}>{formatCurrency(grandTotal.target)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Realizado</span>
                    <span className={`${styles.statValue} ${grandTotal.percentage >= 100 ? styles.positive : styles.neutral}`}>
                        {formatCurrency(grandTotal.achieved)}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: grandTotal.percentage >= 100 ? '#4ade80' : '#94a3b8', marginTop: '0.5rem' }}>
                        {grandTotal.percentage.toFixed(1)}% da meta
                    </span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statTitle}>Falta (GAP)</span>
                    <span className={`${styles.statValue} ${styles.negative}`}>{formatCurrency(grandTotal.gap)}</span>
                </div>
            </div>

            <div className={styles.salesList}>
                {metrics.map((person) => (
                    <div key={person.id} className={styles.salesCard}>
                        {/* Avatar & Name */}
                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                {person.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={styles.salesName}>{person.name}</div>
                        </div>

                        {/* Progress Bars (Monthly & Daily) */}
                        <div className={styles.progressSection}>
                            {/* Monthly */}
                            <div className={styles.progressHeader}>
                                <span className={styles.progressLabel}>Progresso Mensal</span>
                                <span className={styles.progressValue}>{person.percentage.toFixed(1)}%</span>
                            </div>
                            <div className={styles.progressBarBg}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{
                                        width: `${Math.min(person.percentage, 100)}%`,
                                        background: person.percentage >= 100 ? '#4ade80' :
                                            person.percentage >= 70 ? 'var(--primary-main)' : '#f59e0b'
                                    }}
                                />
                            </div>

                            {/* Daily */}
                            <div className={styles.dailyProgressSection}>
                                <div className={styles.progressHeader}>
                                    <span className={styles.progressLabel} style={{ color: person.isDailyHit ? '#facc15' : '#94a3b8', fontWeight: person.isDailyHit ? 700 : 400 }}>
                                        {person.isDailyHit ? 'META DO DIA BATIDA! 🔥' : 'Meta do Dia'}
                                    </span>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={styles.progressValue} style={{ fontSize: '0.875rem', color: person.isDailyHit ? '#facc15' : '#cbd5e1' }}>
                                            {formatCurrency(person.todaySales)} / {formatCurrency(person.dailyTarget)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.dailyProgressBarBg}>
                                    <div
                                        className={`${styles.dailyProgressBarFill} ${person.isDailyHit ? styles.hit : ''}`}
                                        style={{
                                            width: `${Math.min(person.dailyPercentage, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* KPIs Right (Updated Order: Meta - Realizado - Falta - Projeção) */}
                        <div className={styles.kpiGroup}>
                            <div className={styles.kpiItem}>
                                <span className={styles.kpiLabel}>META</span>
                                <span className={styles.kpiVal} style={{ color: '#94a3b8' }}>{formatCurrency(person.target)}</span>
                            </div>
                            <div className={styles.kpiItem}>
                                <span className={styles.kpiLabel}>REALIZADO</span>
                                <span className={styles.kpiVal} style={{ color: '#fff' }}>{formatCurrency(person.achieved)}</span>
                            </div>
                            <div className={styles.kpiItem}>
                                <span className={styles.kpiLabel}>FALTA</span>
                                <span className={styles.kpiVal} style={{ color: '#f87171' }}>{formatCurrency(person.gap)}</span>
                            </div>
                            <div className={styles.kpiItem} title="Estimativa de fechamento">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className={styles.kpiLabel}>PROJEÇÃO</span>
                                </div>
                                <span className={styles.kpiVal} style={{ color: '#38bdf8' }}>{formatCurrency(person.projected)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
