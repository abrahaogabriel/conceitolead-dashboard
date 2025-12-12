import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Client, Profile, Product, ActivityLog } from '../types';
import { Card } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Trash2, UserPlus, Edit2, Shield, ShoppingBag, Activity } from 'lucide-react';

export const Governance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'clients' | 'products' | 'logs'>('users');

    // Check permissions ? profile?.role === 'admin'

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'var(--font-family)' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Governança</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Central de controle administrativo, usuários e configurações.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
                <TabButton
                    active={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                    icon={<Shield size={18} />}
                    label="Usuários"
                />
                <TabButton
                    active={activeTab === 'clients'}
                    onClick={() => setActiveTab('clients')}
                    icon={<UserPlus size={18} />}
                    label="Clientes (Tenants)"
                />
                <TabButton
                    active={activeTab === 'products'}
                    onClick={() => setActiveTab('products')}
                    icon={<ShoppingBag size={18} />}
                    label="Produtos"
                />
                <TabButton
                    active={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                    icon={<Activity size={18} />}
                    label="Logs de Atividade"
                />
            </div>

            <div style={{ minHeight: '400px' }}>
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'clients' && <ClientsTab />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'logs' && <LogsTab />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: active ? '2px solid var(--primary-main)' : '2px solid transparent',
            color: active ? 'var(--primary-main)' : 'var(--text-secondary)',
            fontWeight: active ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
        }}
    >
        {icon}
        {label}
    </button>
);

// --- Sub-components ---

const UsersTab: React.FC = () => {
    // Logic from Users.tsx + Create User Modal logic
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (data) setUsers(data as Profile[]);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button onClick={() => setShowModal(true)}>+ Novo Usuário</Button>
            </div>
            {/* Modal Placeholder - Implement Logic later if needed or simplistic */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50
                }}>
                    <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>Cadastrar Usuário</h3>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Simulação de cadastro (Requer Edge Function para Auth real)</p>
                        {/* Form elements would go here */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input placeholder="Nome" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                            <input placeholder="Email" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                            <select style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <option value="admin">Admin</option>
                                <option value="sales">Vendas</option>
                                <option value="client">Cliente</option>
                            </select>
                            <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '4px' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Se Cliente (Configurações):</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input placeholder="% Comissão (ex: 10)" type="number" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input placeholder="Fee Mensal (R$)" type="number" style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>Cancelar</button>
                            <Button>Salvar</Button>
                        </div>
                    </Card>
                </div>
            )}

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Cliente Vinculado</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{user.full_name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.client_id || '-'}</TableCell>
                                <TableCell><Trash2 size={16} /></TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && !loading && <TableRow><TableCell colSpan={4} style={{ textAlign: 'center' }}>Nenhum usuário.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const ClientsTab: React.FC = () => {
    // Logic from Clients.tsx
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('*');
            if (data) setClients(data as Client[]);
        }
        fetchClients();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button>+ Novo Cliente</Button>
            </div>
            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Comissão</TableHead>
                            <TableHead>Fee Mensal</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map(c => (
                            <TableRow key={c.id}>
                                <TableCell style={{ fontWeight: 500 }}>{c.name}</TableCell>
                                <TableCell>{c.website_url}</TableCell>
                                <TableCell>{c.commission_rate ? `${c.commission_rate}%` : '-'}</TableCell>
                                <TableCell>{c.monthly_fee ? `R$ ${c.monthly_fee}` : '-'}</TableCell>
                                <TableCell>{c.active ? 'Ativo' : 'Inativo'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const ProductsTab: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);

    // Mock fetch
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data as Product[]);
        }
        fetchProducts();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button>+ Novo Produto</Button>
            </div>
            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Cliente (Dono)</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow><TableCell colSpan={4} style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</TableCell></TableRow>
                        ) : (
                            products.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>R$ {p.price}</TableCell>
                                    <TableCell>{p.client_id}</TableCell>
                                    <TableCell><Edit2 size={16} /></TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const LogsTab: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        // Mock Logs for now as table might not exist
        setLogs([
            { id: '1', user_id: 'admin', action: 'Login', details: 'Login realizado com sucesso', created_at: new Date().toISOString() },
            { id: '2', user_id: 'admin', action: 'Update Client', details: 'Alterou comissão do Cliente A', created_at: new Date(Date.now() - 3600000).toISOString() },
        ]);
        // Try fetch
        // supabase.from('activity_logs').select('*').then(({data}) => { if(data) setLogs(data as ActivityLog[]) });
    }, []);

    return (
        <Card noPadding>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Detalhes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map(log => (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            <TableCell>{log.user_id}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.details}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};
