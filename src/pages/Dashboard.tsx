import React, { useEffect, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { supabase } from '../services/supabase';
import type { Client } from '../types';
import { useAuth } from '../context/AuthContext';
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { KPIGrid } from '../components/Dashboard/KPIGrid';
import { TopProducts } from '../components/Dashboard/TopProducts';
import { RecentSales } from '../components/Dashboard/RecentSales';
import { NextMeetingCard, TeamCard, GoalCard, ActiveClientsCard } from '../components/Dashboard/SideCards';
import { SalesEvolutionChart } from '../components/Dashboard/SalesEvolutionChart';
import { ClientSalesChart } from '../components/Dashboard/ClientSalesChart';

export const Dashboard: React.FC = () => {
    const { metrics, sales, trends, topProducts, monthlyEvolution, topClients, loading, filters, setFilters } = useDashboardData();
    const { profile } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchClients = async () => {
            if (profile?.role === 'admin') {
                const { data } = await supabase.from('clients').select('id, name').eq('active', true);
                if (data) setClients(data as Client[]);
            }
        };
        fetchClients();
    }, [profile]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background-default)' }}>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'var(--font-family)' }}>
            <DashboardHeader filters={filters} setFilters={setFilters} clients={clients} />

            <KPIGrid metrics={metrics} trends={trends} />

            {/* Visual KPIs - Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <SalesEvolutionChart data={monthlyEvolution} />
                <ClientSalesChart data={topClients} />
            </div>

            {/* Middle Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <TopProducts products={topProducts} />
                <NextMeetingCard />
                <RecentSales sales={sales} />
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <TeamCard />
                <GoalCard />
                <ActiveClientsCard />
            </div>
        </div>
    );
};
