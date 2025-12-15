import React from 'react';
import { Card } from '../UI/Card';
import { Video } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const NextMeetingCard: React.FC = () => (
    <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Próxima Reunião</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary-main)', fontWeight: 600 }}>Ver todas</p>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Apresentação Comercial</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cliente: Grupo Modelo</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Hoje, 14:00 - 15:00</p>
        </div>
        <button style={{
            width: '100%',
            backgroundColor: 'var(--primary-main)',
            color: 'white',
            padding: '0.75rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            <Video size={18} />
            Iniciar Reunião
        </button>
    </Card>
);

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
                <button style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '99px', padding: '0.25rem 0.75rem' }}>
                    + Membro
                </button>
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

export const GoalCard: React.FC = () => (
    <Card>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Progresso da Meta</h3>
        <div style={{
            position: 'relative',
            width: '200px',
            height: '100px',
            overflow: 'hidden',
            margin: '0 auto'
        }}>
            <div style={{
                width: '200px',
                height: '200px',
                background: `conic-gradient(var(--primary-main) 0% 65%, #e2e8f0 65% 100%)`,
                borderRadius: '50%',
                transform: 'rotate(-117deg)'
            }} />
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '160px',
                height: '160px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: '30px'
            }}>
                <span style={{ fontSize: '2rem', fontWeight: 700 }}>65%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendas do Mês</span>
            </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
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

export const ActiveClientsCard: React.FC = () => {
    const [activeCount, setActiveCount] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(0);

    React.useEffect(() => {
        const fetchClients = async () => {
            const { data: allClients } = await supabase.from('clients').select('id, active');

            if (allClients) {
                setTotalCount(allClients.length);
                setActiveCount(allClients.filter(c => c.active).length);
            }
        };
        fetchClients();
    }, []);

    const percentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

    return (
        <Card>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Clientes Ativos</h3>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--primary-main)', lineHeight: 1 }}>{activeCount}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    de {totalCount} clientes totais ({percentage}%)
                </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-main), var(--secondary-main))',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
        </Card>
    );
};
