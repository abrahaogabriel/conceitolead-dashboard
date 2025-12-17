import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import type { Sale } from '../types';

export interface GoalsMetrics {
    target: number;
    achieved: number;
    percentage: number;
    currentTier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
    daysLeft: number;
    dailyRequired: number;
    projected: number;
}

export interface DayStatus {
    date: string;
    day: number;
    value: number; // Se passado: valor vendido. Se futuro: meta do dia.
    isPast: boolean;
    isToday: boolean;
    isWeekend: boolean;
}

export const useGoals = (selectedMonth: Date = new Date(), selectedSalespersonId?: string) => {
    const { user, profile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sales, setSales] = useState<Sale[]>([]);

    // KPIs
    const [metrics, setMetrics] = useState<GoalsMetrics>({
        target: 0,
        achieved: 0,
        percentage: 0,
        currentTier: 'T0',
        daysLeft: 0,
        dailyRequired: 0,
        projected: 0
    });

    // Calendar Data
    const [calendar, setCalendar] = useState<DayStatus[]>([]);

    useEffect(() => {
        // Só tenta buscar dados quando a autenticação terminar
        if (!authLoading) {
            if (user && profile) {
                fetchGoalsData();
            } else {
                // Se terminou auth e não tem user, para de carregar
                setLoading(false);
            }
        }
    }, [user, profile, authLoading, selectedMonth, selectedSalespersonId]);

    const fetchGoalsData = async () => {
        setLoading(true);
        try {
            const month = selectedMonth.getMonth() + 1;
            const year = selectedMonth.getFullYear();
            let targetAmount = 0;

            // Define qual ID estamos buscando. 
            // Se admin passou ID, usa ele. Se não passou e não é admin, usa o próprio.
            // Se admin não passou ID (selectedSalespersonId undefined), significa "VISÃO GERAL" (Soma de tudo).
            const targetUserId = selectedSalespersonId || (profile?.role !== 'admin' ? profile?.id : null);

            // 1. Buscando META
            let goalQuery = supabase
                .from('sales_goals')
                .select('target_amount')
                .eq('month', month)
                .eq('year', year);

            if (targetUserId) {
                // Meta de um vendedor específico
                goalQuery = goalQuery.eq('salesperson_id', targetUserId);
            }
            // Se targetUserId for null (Admin Geral), pega todas as metas do mês.

            const { data: goalData, error: goalError } = await goalQuery;

            if (!goalError && goalData) {
                // Soma as metas encontradas (se for visão geral, soma todas. Se for específico, soma só a dele - que é única)
                targetAmount = goalData.reduce((acc, curr) => acc + Number(curr.target_amount), 0);
            }

            // 2. Buscando VENDAS
            let salesQuery = supabase.from('sales')
                .select('*')
                .gte('sale_date', new Date(year, month - 1, 1).toISOString())
                .lte('sale_date', new Date(year, month, 0, 23, 59, 59).toISOString());

            if (targetUserId) {
                // Filtrar por Vendedor Específico
                // Precisamos saber a UTM desse vendedor para filtrar direito
                // Vamos buscar o profile dele rapidinho se não for o logged user
                if (targetUserId === profile?.id) {
                    // É o próprio usuário logado
                    if (profile.utm_code) {
                        salesQuery = salesQuery.or(`salesperson_id.eq.${targetUserId},utm_source.eq.${profile.utm_code}`);
                    } else {
                        salesQuery = salesQuery.eq('salesperson_id', targetUserId);
                    }
                } else {
                    // É outro usuário (Admin vendo Vendedor)
                    const { data: targetProfile } = await supabase.from('profiles').select('utm_code').eq('id', targetUserId).single();
                    if (targetProfile?.utm_code) {
                        salesQuery = salesQuery.or(`salesperson_id.eq.${targetUserId},utm_source.eq.${targetProfile.utm_code}`);
                    } else {
                        salesQuery = salesQuery.eq('salesperson_id', targetUserId);
                    }
                }
            }
            // Se targetUserId for null (Admin Geral), traz todas as vendas do período.

            const { data: salesData, error: salesError } = await salesQuery;

            if (salesError) console.error('Error fetching sales:', salesError);

            const currentSales = (salesData as Sale[]) || [];

            setSales(currentSales);
            calculateMetricsAndCalendar(targetAmount, currentSales, year, month);

        } catch (error) {
            console.error('Erro ao buscar metas:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMetricsAndCalendar = (target: number, salesData: Sale[], year: number, month: number) => {
        // --- 1. Cálculos de KPI ---
        const achieved = salesData.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const percentage = target > 0 ? (achieved / target) * 100 : 0;

        // Definição de Nível
        let currentTier: GoalsMetrics['currentTier'] = 'T0';
        if (percentage >= 200) currentTier = 'T4';
        else if (percentage >= 150) currentTier = 'T3';
        else if (percentage >= 100) currentTier = 'T2';
        else if (percentage >= 70) currentTier = 'T1';

        // Dias úteis e média
        const today = new Date();
        const daysInMonth = new Date(year, month, 0).getDate();

        // Mapa de vendas por dia
        const salesByDay = new Map<number, number>();
        salesData.forEach(sale => {
            const d = new Date(sale.sale_date).getDate();
            salesByDay.set(d, (salesByDay.get(d) || 0) + Number(sale.amount));
        });

        const calendarDays: DayStatus[] = [];
        let remainingTarget = target - achieved;
        if (remainingTarget < 0) remainingTarget = 0;

        let workingDaysLeft = 0;

        // Primeiro loop para contar dias úteis restantes
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (!isPast && !isWeekend) {
                workingDaysLeft++;
            }
        }

        const dailyRequired = workingDaysLeft > 0 ? remainingTarget / workingDaysLeft : 0;

        // Segundo loop para montar o calendário
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            // Comparação de data correta (sem hora)
            const checkToday = new Date();
            checkToday.setHours(0, 0, 0, 0);
            const checkDate = new Date(dateObj);
            checkDate.setHours(0, 0, 0, 0);

            const isPast = checkDate < checkToday;
            const isToday = checkDate.getTime() === checkToday.getTime();

            let value = 0;
            if (isPast || isToday) {
                // Se passou, mostramos o realizado
                value = salesByDay.get(d) || 0;
            } else {
                // Se futuro
                value = isWeekend ? 0 : dailyRequired;
            }

            calendarDays.push({
                date: dateObj.toISOString(),
                day: d,
                value,
                isPast,
                isToday,
                isWeekend
            });
        }

        // Projeção simples
        const dayOfMonth = today.getDate();
        const projected = (achieved / dayOfMonth) * daysInMonth;

        setMetrics({
            target,
            achieved,
            percentage,
            currentTier,
            daysLeft: workingDaysLeft,
            dailyRequired,
            projected
        });

        setCalendar(calendarDays);
    };

    return { metrics, calendar, loading, sales };
};
