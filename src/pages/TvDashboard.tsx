import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize, HelpCircle, Trophy } from 'lucide-react';
import { supabase } from '../services/supabase';
import styles from './TvDashboard.module.css';
import confetti from 'canvas-confetti';

interface SalesPersonMetric {
    id: string;
    name: string;
    photo?: string;
    target: number;
    achieved: number;
    percentage: number;
    gap: number;
    projected: number;
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

        // Configurar Realtime
        const subscription = supabase
            .channel('tv-dashboard-sales')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sales' },
                async (payload) => {
                    console.log('Nova venda recebida via Realtime!', payload);
                    const newSale = payload.new;

                    // Identificar vendedor (opcional, para exibir no toast)
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
        // 1. Tocar Som
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Som de 'Success Chime'
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplay blocked', e));

        // 2. Confetes
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

        // 3. Mostrar Notificação Visual
        setShowNotification({ show: true, amount, sellerName });

        // 4. Atualizar Dados
        fetchTvData();

        // Esconder notificação após 5s
        setTimeout(() => setShowNotification(null), 5000);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.log("Auto-fullscreen blocked, user interaction needed.", e);
            });
        }
    };

    // Toggle manual
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
            const month = today.getMonth() + 1; // 1-12
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

            // 1. Buscar Vendedores
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['sales', 'admin'])
                .order('full_name');

            // 2. Buscar Metas do Mês
            const { data: goals } = await supabase
                .from('sales_goals')
                .select('*')
                .eq('month', month)
                .eq('year', year);

            // 3. Buscar Vendas do Mês
            const { data: sales } = await supabase
                .from('sales')
                .select('*')
                .gte('sale_date', startDate)
                .lte('sale_date', endDate)
                .neq('status', 'cancelled');

            if (!profiles) return;

            // Processar Dados
            const processed = profiles.map(p => {
                // Meta
                const userGoal = goals?.find(g => g.salesperson_id === p.id);
                const target = userGoal ? Number(userGoal.target_amount) : 0;

                // Realizado
                const userSales = sales?.filter(s => {
                    const idMatch = s.salesperson_id === p.id;
                    const utmMatch = p.utm_code && s.utm_source && (s.utm_source.toLowerCase() === p.utm_code.toLowerCase());
                    return idMatch || utmMatch;
                }) || [];

                const achieved = userSales.reduce((acc, curr) => acc + Number(curr.amount), 0);
                // const percentage = target > 0 ? (achieved / target) * 100 : 0; // Removed unused variable

                const daysInMonth = new Date(year, month, 0).getDate();
                const currentDay = today.getDate();

                // Projeção simples linear
                const projected = currentDay > 0 ? (achieved / currentDay) * daysInMonth : achieved;

                return {
                    id: p.id,
                    name: p.full_name || p.email || 'Vendedor',
                    photo: undefined,
                    target,
                    achieved,
                    percentage: target > 0 ? (achieved / target) * 100 : 0,
                    gap: Math.max(0, target - achieved),
                    projected
                };
            });

            // Filtrar apenas quem tem meta ou venda > 0
            const activeSalespeople = processed.filter(p => p.target > 0 || p.achieved > 0);

            // Ordenar por % de atingimento
            activeSalespeople.sort((a, b) => b.percentage - a.percentage);

            setMetrics(activeSalespeople);

            // Calcular Totais Globais
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
            {/* Notificação de Nova Venda */}
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

            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/goals')} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Voltar
                    </button>
                    <button onClick={handleToggleFullscreen} className={styles.backButton} title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}>
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--primary-main)' }}>Dashboard de Vendas</h1>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
                            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Global Stats */}
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

            {/* Salespeople List */}
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

                        {/* Progress Bar Center */}
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                                <span className={styles.progressLabel}>Progresso da Meta</span>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>0%</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100%</span>
                            </div>
                        </div>

                        {/* KPIs Right */}
                        <div className={styles.kpiGroup}>
                            <div className={styles.kpiItem}>
                                <span className={styles.kpiLabel}>REALIZADO</span>
                                <span className={styles.kpiVal} style={{ color: '#fff' }}>{formatCurrency(person.achieved)}</span>
                            </div>
                            <div className={styles.kpiItem}>
                                <span className={styles.kpiLabel}>FALTA</span>
                                <span className={styles.kpiVal} style={{ color: '#f87171' }}>{formatCurrency(person.gap)}</span>
                            </div>
                            <div className={styles.kpiItem} title="Estimativa de fechamento baseada no ritmo atual">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className={styles.kpiLabel}>PROJEÇÃO</span>
                                    <HelpCircle size={10} color="#64748b" />
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
