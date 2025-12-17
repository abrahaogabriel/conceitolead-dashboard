import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import type { Sale } from '../types';

export interface GoalsMetrics {
    target: number;
    achieved: number;
    percentage: number;
    currentTier: 'T1' | 'T2' | 'T3' | 'T4';
    daysLeft: number;
    dailyRequired: number;
    projected: number;
}

export interface DayStatus {
    date: string;
    day: number;
    value: number; // Se passado: valor vendido. Se futuro: meta do dia.
    targetValue?: number; // Meta calculada para aquele dia
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
        currentTier: 'T1',
        daysLeft: 0,
        dailyRequired: 0,
        projected: 0
    });

    // Calendar Data
    const [calendar, setCalendar] = useState<DayStatus[]>([]);

    useEffect(() => {
        if (!authLoading) {
            if (user && profile) {
                fetchGoalsData();
            } else {
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

            const targetUserId = selectedSalespersonId || (profile?.role !== 'admin' ? profile?.id : null);

            // 1. Buscando META
            let goalQuery = supabase
                .from('sales_goals')
                .select('target_amount')
                .eq('month', month)
                .eq('year', year);

            if (targetUserId) {
                goalQuery = goalQuery.eq('salesperson_id', targetUserId);
            }

            const { data: goalData, error: goalError } = await goalQuery;

            if (!goalError && goalData) {
                targetAmount = goalData.reduce((acc, curr) => acc + Number(curr.target_amount), 0);
            }

            // 2. Buscando VENDAS
            let salesQuery = supabase.from('sales')
                .select('*')
                .gte('sale_date', new Date(year, month - 1, 1).toISOString())
                .lte('sale_date', new Date(year, month, 0, 23, 59, 59).toISOString());

            if (targetUserId) {
                if (targetUserId === profile?.id) {
                    if (profile.utm_code) {
                        salesQuery = salesQuery.or(`salesperson_id.eq.${targetUserId},utm_source.eq.${profile.utm_code}`);
                    } else {
                        salesQuery = salesQuery.eq('salesperson_id', targetUserId);
                    }
                } else {
                    const { data: targetProfile } = await supabase.from('profiles').select('utm_code').eq('id', targetUserId).single();
                    if (targetProfile?.utm_code) {
                        salesQuery = salesQuery.or(`salesperson_id.eq.${targetUserId},utm_source.eq.${targetProfile.utm_code}`);
                    } else {
                        salesQuery = salesQuery.eq('salesperson_id', targetUserId);
                    }
                }
            }

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
        // KPI Base
        const achieved = salesData.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const percentage = target > 0 ? (achieved / target) * 100 : 0;

        let currentTier: GoalsMetrics['currentTier'] = 'T1';
        if (percentage >= 200) currentTier = 'T4';
        else if (percentage >= 150) currentTier = 'T3';
        else if (percentage >= 100) currentTier = 'T2';

        const today = new Date();
        const daysInMonth = new Date(year, month, 0).getDate();

        // Mapa de Vendas
        const salesByDay = new Map<number, number>();
        salesData.forEach(sale => {
            const d = new Date(sale.sale_date).getDate();
            salesByDay.set(d, (salesByDay.get(d) || 0) + Number(sale.amount));
        });

        // Contar dias úteis totais
        let totalWorkingDays = 0;
        let futureWorkingDays = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            // Check Future only
            const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
            const checkDate = new Date(dateObj); checkDate.setHours(0, 0, 0, 0);
            const isFuture = checkDate > todayMidnight;

            if (!isWeekend) {
                totalWorkingDays++;
                if (isFuture) futureWorkingDays++;
            }
        }

        // --- CÁLCULO PROGRESSIVO DE METAS ---
        const calendarDays: DayStatus[] = [];

        // Variáveis acumulativas para "Simular" o mês dia a dia
        let currentRemainingTarget = target;
        let currentWorkingDaysLeft = totalWorkingDays;

        // Pacing (Meta Dinâmica do Futuro)
        let dynamicGap = Math.max(0, target - achieved);
        let dynamicPacing = futureWorkingDays > 0 ? dynamicGap / futureWorkingDays : 0;

        // Se já bateu a meta, pacing futuro é 0
        if (target > 0 && achieved >= target) dynamicPacing = 0;


        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month - 1, d);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            const todayRef = new Date();
            todayRef.setHours(0, 0, 0, 0);
            const checkDate = new Date(dateObj);
            checkDate.setHours(0, 0, 0, 0);

            const isPast = checkDate < todayRef;
            const isToday = checkDate.getTime() === todayRef.getTime();

            // 1. Calcular a Meta Deste Dia (Baseada no saldo INICIAL do dia)
            let dailyGoal = 0;

            if (!isWeekend && currentWorkingDaysLeft > 0) {
                // Meta do dia = O que falta / Dias que faltam
                dailyGoal = Math.max(0, currentRemainingTarget) / currentWorkingDaysLeft;
            }

            // 2. Definir valor a exibir
            let value = 0;
            let targetValue = 0;

            if (isPast) {
                // Passado: Mostra Realizado e a Meta HISTÓRICA daquele dia
                value = salesByDay.get(d) || 0;
                targetValue = isWeekend ? 0 : dailyGoal;

                // Atualizar acumuladores para o próximo dia do loop
                currentRemainingTarget -= value; // Abate o que vendeu. Se vendeu 0, target do próximo dia sobe.
                if (!isWeekend) currentWorkingDaysLeft--; // Um dia útil a menos

            } else if (isToday) {
                // Hoje: Mostra Realizado (até agora) e a Meta DO DIA (Calculada no início do loop, fixa para hoje)
                value = salesByDay.get(d) || 0;
                targetValue = isWeekend ? 0 : dailyGoal;

                // Não atualizamos os acumuladores AQUI para o display de hoje, 
                // mas para o cálculo do futuro sim.
                // Mas wait: o loop continua para o futuro. 
                // Precisamos atualizar o 'currentRemainingTarget' e 'currentWorkingDaysLeft' para os dias 18, 19...?
                // Sim, mas para os dias FUTUROS, costuma-se mostrar o "Pacing Atual" (Target Total - Achieved Total) / DiasFuturos.
                // Se seguirmos a lógica desse loop até o fim do mês com values '0' (futuro), a meta vai disparar absurdamente.
                // Ex: Se hoje é dia 15 e eu tenho pro futuro venda 0, dia 30 a meta vai ser 1 milhão.

                // PAUSA NA LÓGICA PROGRESSIVA PARA FUTURO:
                // Para dias FUTUROS, não simulamos venda 0. Usamos a "Meta de Pacing" (Média necessária real).
            } else {
                // Futuro: 
                // A meta exibida é o "Pacing" atualizado (Quanto tenho que vender por dia a partir de amanhã).
                value = isWeekend ? 0 : dynamicPacing;
                targetValue = 0; // Futuro não tem target comparativo, o value é o target.
            }

            calendarDays.push({
                date: dateObj.toISOString(),
                day: d,
                value,
                targetValue,
                isPast,
                isToday,
                isWeekend
            });
        }

        // Ajuste fino: Se o usuário quiser ver a "meta que seria" caso ele venda 0 hoje?
        // O código acima para 'Future' usa dynamicPacing, que é baseada no ACUMULADO ATUAL (vendas até agora na db).
        // Isso é correto. 

        const dayOfMonth = today.getDate();
        const projected = (achieved / dayOfMonth) * daysInMonth;

        setMetrics({
            target,
            achieved,
            percentage,
            currentTier,
            daysLeft: futureWorkingDays,
            dailyRequired: dynamicPacing,
            projected
        });

        setCalendar(calendarDays);
    };

    return { metrics, calendar, loading, sales };
};
