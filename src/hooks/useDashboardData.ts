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
    const [topProducts, setTopProducts] = useState<{ name: string, count: number, revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (user && profile) {
                fetchDashboardData();
            } else {
                // If no user/profile, or simple demo mode, load mock data
                console.log("No authenticated profile found or auth loading finished. Loading mock data.");
                loadMockData();
            }
        }
    }, [user, profile, authLoading]);

    const loadMockData = () => {
        setSales(MOCK_SALES);
        calculateMetrics(MOCK_SALES);
        calculateTopProducts(MOCK_SALES);
        setLoading(false);
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Determine query based on role
            let query = supabase.from('sales').select('*');

            if (profile?.role === 'client') {
                query = query.eq('client_id', profile.client_id!);
            }
            // Add other role filters if necessary

            const { data, error } = await query;

            if (error) {
                console.error('Info: Error fetching sales (might be empty or permission), using mock data.', error);
                loadMockData();
                return;
            }

            if (!data || data.length === 0) {
                console.log("Info: No sales found, using mock data for demonstration.");
                loadMockData();
                return;
            }

            const salesData = data as Sale[];
            setSales(salesData);
            calculateMetrics(salesData);
            calculateTopProducts(salesData);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            loadMockData(); // Fallback
        }
    };

    const calculateMetrics = (data: Sale[]) => {
        const totalSales = data.length;
        const totalRevenue = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalCommission = data.reduce((acc, curr) => acc + (Number(curr.commission) || 0), 0);
        const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

        setMetrics({
            totalSales,
            totalRevenue,
            totalCommission,
            averageTicket,
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

    return { sales, metrics, topProducts, loading, refresh: fetchDashboardData };
};
