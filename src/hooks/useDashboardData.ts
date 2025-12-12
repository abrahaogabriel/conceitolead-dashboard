import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Sale } from '../types';
import { useAuth } from '../context/AuthContext';

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

const MOCK_SALES: Sale[] = [
    {
        id: '1',
        client_id: 'mock-client',
        amount: 5000,
        commission: 500,
        product_name: 'Consultoria de Marketing',
        buyer_name: 'Acme Corp',
        buyer_email: 'contact@acme.com',
        status: 'completed',
        sale_date: new Date().toISOString(),
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        client_id: 'mock-client',
        amount: 3200,
        commission: 320,
        product_name: 'Treinamento de Vendas',
        buyer_name: 'Globex Inc',
        buyer_email: 'hr@globex.com',
        status: 'approved',
        sale_date: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: '3',
        client_id: 'mock-client',
        amount: 1500,
        commission: 150,
        product_name: 'Análise de SEO',
        buyer_name: 'Soylent Corp',
        buyer_email: 'info@soylent.com',
        status: 'pending',
        sale_date: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: '4',
        client_id: 'mock-client',
        amount: 8000,
        commission: 800,
        product_name: 'Desenvolvimento Web',
        buyer_name: 'Massive Dynamic',
        buyer_email: 'tech@massive.com',
        status: 'completed',
        sale_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
];

export const useDashboardData = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageTicket: 0,
    });
    const [trends, setTrends] = useState<DashboardTrends>({
        salesTrend: '+0%',
        revenueTrend: '+0%',
        commissionTrend: '+0%',
        ticketTrend: 'Estável',
    });
    const [topProducts, setTopProducts] = useState<{ name: string, count: number, revenue: number }[]>([]);
    const [monthlyEvolution, setMonthlyEvolution] = useState<{ month: string, value: number }[]>([]);
    const [topClients, setTopClients] = useState<{ name: string, value: number, color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Default filters: Last 30 days
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        clientId: ''
    });

    useEffect(() => {
        if (!authLoading) {
            if (user && profile) {
                fetchDashboardData();
            } else {
                console.log("No authenticated profile found or auth loading finished. Loading mock data.");
                loadMockData();
            }
        }
    }, [user, profile, authLoading, filters]); // Re-fetch when filters change

    const filterMockData = (data: Sale[]) => {
        return data.filter(sale => {
            const saleDate = sale.sale_date.split('T')[0];
            const matchesDate = saleDate >= filters.startDate && saleDate <= filters.endDate;
            const matchesClient = filters.clientId ? sale.client_id === filters.clientId : true;
            return matchesDate && matchesClient;
        });
    };

    const loadMockData = () => {
        const filtered = filterMockData(MOCK_SALES);
        setSales(filtered);
        // Mock calculation doesn't have real clients to lookup percentage, keeps old simple logic for mock
        const totalSales = filtered.length;
        const totalRevenue = filtered.reduce((acc, curr) => acc + Number(curr.amount), 0);
        // Mock commission logic (just sum)
        const totalCommission = filtered.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        setMetrics({ totalSales, totalRevenue, totalCommission, averageTicket });
        calculateTopProducts(filtered);
        calculateMonthlyEvolution(filtered);
        calculateTopClients(filtered, []); // Empty clients for mock
        setLoading(false);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            let query = supabase.from('sales').select('*');

            // Role-based constraints
            if (profile?.role === 'client') {
                query = query.eq('client_id', profile.client_id!);
            }

            // Apply UI filters
            if (filters.clientId && profile?.role !== 'client') {
                query = query.eq('client_id', filters.clientId);
            }

            if (filters.startDate) {
                query = query.gte('sale_date', `${filters.startDate}T00:00:00`);
            }
            if (filters.endDate) {
                query = query.lte('sale_date', `${filters.endDate}T23:59:59`);
            }

            const { data: salesData, error: salesError } = await query;

            if (salesError) {
                console.error('Info: Error fetching sales, using mock data.', salesError);
                loadMockData();
                return;
            }

            // Fetch all clients to get their commission rates and monthly fees
            const { data: clientsData } = await supabase.from('clients').select('id, commission_rate, monthly_fee, active');
            const clientRates = new Map<string, { rate: number, fee: number }>();

            if (clientsData) {
                clientsData.forEach((c: any) => {
                    clientRates.set(c.id, {
                        rate: c.commission_rate || 0,
                        fee: c.monthly_fee || 0
                    });
                });
            }

            if (!salesData || salesData.length === 0) {
                if (!filters.clientId) {
                    console.log("Info: No sales found query empty.");
                }
            }

            const finalSales = (salesData as Sale[]) || [];

            setSales(finalSales);
            // Pass clientsData (allClients) to calculateMetrics
            calculateMetrics(finalSales, clientRates, clientsData || []);
            calculateTopProducts(finalSales);
            calculateMonthlyEvolution(finalSales);
            calculateTopClients(finalSales, clientsData || []);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            loadMockData();
        }
    };

    const calculateMetrics = (data: Sale[], clientRates: Map<string, { rate: number, fee: number }>, allClients: any[]) => {
        const totalSales = data.length;
        const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.amount), 0);

        // 1. Calculate Variable Commission (from Sales)
        const variableCommission = data.reduce((acc, curr) => {
            const clientInfo = clientRates.get(curr.client_id);
            if (clientInfo) {
                return acc + (Number(curr.amount) * (clientInfo.rate / 100));
            } else {
                return acc + (Number(curr.commission) || 0);
            }
        }, 0);

        // 2. Calculate Fixed Commission (Monthly Fees)
        let monthsDiff = 1;
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
            if (monthsDiff < 1) monthsDiff = 1;
        }

        let totalMonthlyFee = 0;

        if (filters.clientId) {
            // Specific client fee
            const clientInfo = clientRates.get(filters.clientId);
            if (clientInfo) {
                totalMonthlyFee = clientInfo.fee * monthsDiff;
            }
        } else {
            // Sum of fees from ALL ACTIVE clients
            allClients.forEach(c => {
                if (c.active) {
                    totalMonthlyFee += (c.monthly_fee || 0) * monthsDiff;
                }
            });
        }

        const totalCommission = variableCommission + totalMonthlyFee;

        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        setMetrics({
            totalSales,
            totalRevenue,
            totalCommission,
            averageTicket,
        });

        // Calculate simple trends (mock logic - could be enhanced with historical data comparison)
        const salesTrend = totalSales > 5 ? `+${Math.round((totalSales / 10) * 100)}%` : totalSales > 0 ? '+5%' : '0%';
        const revenueTrend = totalRevenue > 10000 ? '+12%' : totalRevenue > 0 ? '+8%' : '0%';
        const commissionTrend = totalCommission > 1000 ? '+8%' : totalCommission > 0 ? '+5%' : '0%';
        const ticketTrend = averageTicket > 5000 ? '+3%' : 'Estável';

        setTrends({
            salesTrend,
            revenueTrend,
            commissionTrend,
            ticketTrend,
        });
    };

    const calculateTopProducts = (data: Sale[]) => {
        const productMap = new Map<string, { count: number, revenue: number }>();

        data.forEach(sale => {
            const current = productMap.get(sale.product_name) || { count: 0, revenue: 0 };
            productMap.set(sale.product_name, {
                count: current.count + 1,
                revenue: current.revenue + Number(sale.amount)
            });
        });

        const sorted = Array.from(productMap.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Top 5

        setTopProducts(sorted);
    };

    const calculateMonthlyEvolution = (data: Sale[]) => {
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const last6Months: { month: string, value: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = monthNames[date.getMonth()];

            const count = data.filter(sale => {
                const saleMonth = new Date(sale.sale_date).toISOString().slice(0, 7);
                return saleMonth === monthKey;
            }).length;

            last6Months.push({ month: monthName, value: count });
        }

        setMonthlyEvolution(last6Months);
    };

    const calculateTopClients = (data: Sale[], clientsData: any[]) => {
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
        const clientMap = new Map<string, number>();

        data.forEach(sale => {
            const current = clientMap.get(sale.client_id) || 0;
            clientMap.set(sale.client_id, current + 1);
        });

        const sorted = Array.from(clientMap.entries())
            .map(([id, count], index) => {
                const client = clientsData.find(c => c.id === id);
                return {
                    name: client?.name || 'Cliente Desconhecido',
                    value: count,
                    color: colors[index % colors.length]
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        setTopClients(sorted);
    };

    return {
        sales,
        metrics,
        trends,
        topProducts,
        monthlyEvolution,
        topClients,
        loading,
        refresh: fetchDashboardData,
        filters,
        setFilters
    };
};
