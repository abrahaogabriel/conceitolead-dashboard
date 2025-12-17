import React from 'react';
import { Card } from '../UI/Card';
import { supabase } from '../../services/supabase';
import { useGoals } from '../../hooks/useGoals';

export const TeamCard: React.FC = () => {
    const [teamMembers, setTeamMembers] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchTeam = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('role', ['sales', 'admin'])
                .limit(3);

            if (data) setTeamMembers(data);
        };
        fetchTeam();
    }, []);

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem' }}>Equipe</h3>
                {/* <button style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '99px', padding: '0.25rem 0.75rem' }}>
                    + Membro
                </button> */}
            </div>
            {teamMembers.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nenhum membro encontrado.</p>
            ) : (
                teamMembers.map((member) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary-main), var(--secondary-main))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            {member.full_name?.substring(0, 2).toUpperCase() || 'AN'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{member.full_name || 'Anônimo'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {member.role === 'admin' ? 'Admin' : member.role === 'sales' ? 'Vendedor' : 'Cliente'}
                            </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px' }}>Ativo</span>
                    </div>
                ))
            )}
        </Card>
    );
};

export const GoalCard: React.FC = () => {
    const { metrics } = useGoals();

    // Calculo do angulo para o conic-gradient
    // 0% => 0deg (ou hidden)
    // 100% => 360deg? Não, o visual original parece ser uns 270deg (3/4 de circulo) ou similar.
    // O original era: transform: 'rotate(-117deg)' e conic até 65%. 
    // Vamos simplificar: Usar um anel de 360 graus onde X% é preenchido.
    // Mas para manter o estilo "Gauge" (velocímetro), vamos assumir 100% = volta completa.
    const percentage = metrics.percentage > 100 ? 100 : metrics.percentage;
    const degrees = percentage * 3.6; // 360 / 100

    return (
        <Card>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Progresso da Meta</h3>
            <div style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* Fundo do Gauge (Cinza) */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#e2e8f0'
                }} />

                {/* Gauge de Progresso */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(var(--primary-main) ${degrees}deg, transparent 0deg)`,
                    transition: 'background 1s ease-out'
                }} />

                {/* Mascara central (Branca) para criar o anel */}
                <div style={{
                    position: 'absolute',
                    width: '160px',
                    height: '160px',
                    background: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {metrics.percentage.toFixed(0)}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendas do Mês</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-main)', marginTop: '4px' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(metrics.achieved)}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
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
    );
};
