import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { createClient } from '@supabase/supabase-js';
import type { Client, Profile, Product, ActivityLog } from '../types';
import { Card } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Trash2, UserPlus, Edit2, Shield, ShoppingBag, Activity, X } from 'lucide-react';
import { logActivity } from '../utils/activityLogger';
import { useToast } from '../context/ToastContext';

export const Governance: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'clients' | 'products' | 'logs'>('users');

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', fontFamily: 'var(--font-family)' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Governança</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Central de controle administrativo, usuários e configurações.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Shield size={18} />} label="Usuários" />
                <TabButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<UserPlus size={18} />} label="Clientes (Tenants)" />
                <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<ShoppingBag size={18} />} label="Produtos" />
                <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Activity size={18} />} label="Logs de Atividade" />
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
    <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
        backgroundColor: 'transparent', border: 'none',
        borderBottom: active ? '2px solid var(--primary-main)' : '2px solid transparent',
        color: active ? 'var(--primary-main)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s'
    }}>
        {icon}
        {label}
    </button>
);

// --- Sub-components ---

const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const { showToast } = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data as Profile[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (user: Profile) => {
        if (!confirm(`Tem certeza que deseja remover ${user.full_name}?`)) return;

        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (!error) {
            await logActivity('Usuário Removido', 'user', user.id, { name: user.full_name });
            showToast('Usuário removido com sucesso!', 'success');
            fetchUsers();
        } else {
            showToast('Erro ao remover usuário', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button onClick={() => setCreatingUser(true)}>+ Novo Usuário</Button>
            </div>

            {creatingUser && (
                <CreateUserModal onClose={() => setCreatingUser(false)} onSave={fetchUsers} />
            )}

            {editingUser && (
                <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={fetchUsers} />
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
                                <TableCell>
                                    <span style={{
                                        textTransform: 'capitalize', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                                        backgroundColor: user.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                                        color: user.role === 'admin' ? '#3730a3' : '#374151'
                                    }}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>{user.client_id || '-'}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setEditingUser(user)} style={{ color: 'var(--primary-main)', cursor: 'pointer', background: 'none', border: 'none' }} title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(user)} style={{ color: 'var(--status-error)', cursor: 'pointer', background: 'none', border: 'none' }} title="Remover">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && !loading && <TableRow><TableCell colSpan={4} style={{ textAlign: 'center' }}>Nenhum usuário.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const CreateUserModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'sales' as 'admin' | 'sales' | 'client',
        client_id: ''
    });
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!formData.full_name || !formData.email || !formData.password) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
            return;
        }

        setLoading(true);

        try {
            // 1. Create a persistent-less Supabase client
            // This allows creating a new user without logging out the current admin
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const tempSupabase = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    persistSession: false, // CRITICAL: Do not save session to localStorage
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            // 2. SignUp the new user
            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name
                    }
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('Este email já está cadastrado.');
                }
                throw authError; // Rethrow other errors
            }

            if (authData.user) {
                // 3. Create public profile using the main admin client (to have write permissions)
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: authData.user.id,
                    full_name: formData.full_name,
                    role: formData.role,
                    client_id: formData.client_id || null,
                    email: formData.email
                });

                if (profileError) throw profileError;

                await logActivity('Usuário Criado (Front)', 'user', authData.user.id, {
                    name: formData.full_name,
                    email: formData.email,
                    role: formData.role
                });

                showToast('Usuário criado com sucesso!', 'success');
                onSave();
                onClose();
            }

        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            showToast(error.message || 'Erro ao criar usuário', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3>Criar Novo Usuário</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome Completo *</label>
                        <input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email *</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Senha *</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Função</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <option value="admin">Admin</option>
                            <option value="sales">Vendas</option>
                            <option value="client">Cliente</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} disabled={loading} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                    <Button onClick={handleCreate} disabled={loading}>{loading ? 'Criando...' : 'Criar Usuário'}</Button>
                </div>
            </Card>
        </div>
    );
};

const EditUserModal: React.FC<{ user: Profile; onClose: () => void; onSave: () => void }> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);
    const { showToast } = useToast();

    const handleSave = async () => {
        const { error } = await supabase.from('profiles').update({
            full_name: formData.full_name,
            role: formData.role,
            client_id: formData.client_id
        }).eq('id', user.id);

        if (!error) {
            await logActivity('Usuário Editado', 'user', user.id, { name: formData.full_name });
            showToast('Usuário atualizado com sucesso!', 'success');
            await onSave(); // Wait for data refresh
            onClose();
        } else {
            console.error('Error updating user:', error);
            showToast(`Erro ao atualizar usuário: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3>Editar Usuário</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome</label>
                        <input value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Função</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <option value="admin">Admin</option>
                            <option value="sales">Vendas</option>
                            <option value="client">Cliente</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </Card>
        </div>
    );
};

const ClientsTab: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { showToast } = useToast();

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*');
        if (data) setClients(data as Client[]);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleToggleActive = async (client: Client) => {
        const newStatus = !client.active;
        const { error } = await supabase.from('clients').update({ active: newStatus }).eq('id', client.id);
        if (!error) {
            await logActivity(newStatus ? 'Cliente Ativado' : 'Cliente Desativado', 'client', client.id, { name: client.name });
            showToast(`Cliente ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'success');
            fetchClients();
        } else {
            showToast('Erro ao atualizar status do cliente', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button onClick={() => alert('Funcionalidade em desenvolvimento')}>+ Novo Cliente</Button>
            </div>

            {editingClient && (
                <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={fetchClients} />
            )}

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Comissão</TableHead>
                            <TableHead>Fee Mensal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map(c => (
                            <TableRow key={c.id}>
                                <TableCell style={{ fontWeight: 500 }}>{c.name}</TableCell>
                                <TableCell>{c.website_url || '-'}</TableCell>
                                <TableCell>{c.commission_rate ? `${c.commission_rate}%` : '-'}</TableCell>
                                <TableCell>{c.monthly_fee ? `R$ ${c.monthly_fee}` : '-'}</TableCell>
                                <TableCell>
                                    <span style={{
                                        padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem',
                                        backgroundColor: c.active ? '#dcfce7' : '#fef2f2',
                                        color: c.active ? '#166534' : '#991b1b'
                                    }}>
                                        {c.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setEditingClient(c)} style={{ color: 'var(--primary-main)', cursor: 'pointer', background: 'none', border: 'none' }} title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleToggleActive(c)} style={{ color: c.active ? 'var(--status-error)' : 'var(--status-success)', cursor: 'pointer', background: 'none', border: 'none' }} title={c.active ? 'Desativar' : 'Ativar'}>
                                            {c.active ? <X size={16} /> : <Shield size={16} />}
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const EditClientModal: React.FC<{ client: Client; onClose: () => void; onSave: () => void }> = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState(client);
    const { showToast } = useToast();

    const handleSave = async () => {
        const { error } = await supabase.from('clients').update({
            name: formData.name,
            website_url: formData.website_url,
            commission_rate: formData.commission_rate,
            monthly_fee: formData.monthly_fee
        }).eq('id', client.id);

        if (!error) {
            await logActivity('Cliente Editado', 'client', client.id, { name: formData.name });
            showToast('Cliente atualizado com sucesso!', 'success');
            await onSave(); // Wait for data refresh
            onClose();
        } else {
            console.error('Error updating client:', error);
            showToast(`Erro ao atualizar cliente: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3>Editar Cliente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome da Empresa</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Website</label>
                        <input value={formData.website_url || ''} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>% Comissão</label>
                            <input type="number" value={formData.commission_rate || ''} onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Fee Mensal (R$)</label>
                            <input type="number" value={formData.monthly_fee || ''} onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </Card>
        </div>
    );
};

const ProductsTab: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [creatingProduct, setCreatingProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { showToast } = useToast();

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) setProducts(data as Product[]);
    };

    useEffect(() => {
        fetchProducts();

        // Fetch clients for dropdown
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, name').eq('active', true);
            if (data) setClients(data as Client[]);
        };
        fetchClients();
    }, []);

    const handleDelete = async (product: Product) => {
        if (!confirm(`Tem certeza que deseja remover ${product.name}?`)) return;

        const { error } = await supabase.from('products').delete().eq('id', product.id);
        if (!error) {
            await logActivity('Produto Removido', 'product', product.id, { name: product.name });
            showToast('Produto removido com sucesso!', 'success');
            fetchProducts();
        } else {
            showToast('Erro ao remover produto', 'error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <Button onClick={() => setCreatingProduct(true)}>+ Novo Produto</Button>
            </div>

            {creatingProduct && (
                <CreateProductModal clients={clients} onClose={() => setCreatingProduct(false)} onSave={fetchProducts} />
            )}

            {editingProduct && (
                <EditProductModal product={editingProduct} clients={clients} onClose={() => setEditingProduct(null)} onSave={fetchProducts} />
            )}

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Cliente (Dono)</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow><TableCell colSpan={3} style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</TableCell></TableRow>
                        ) : (
                            products.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{clients.find(c => c.id === p.client_id)?.name || p.client_id}</TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setEditingProduct(p)} style={{ color: 'var(--primary-main)', cursor: 'pointer', background: 'none', border: 'none' }} title="Editar">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(p)} style={{ color: 'var(--status-error)', cursor: 'pointer', background: 'none', border: 'none' }} title="Remover">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

const CreateProductModal: React.FC<{ clients: Client[]; onClose: () => void; onSave: () => void }> = ({ clients, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', client_id: '' });
    const { showToast } = useToast();

    const handleCreate = async () => {
        if (!formData.name || !formData.client_id) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
            return;
        }

        const { error } = await supabase.from('products').insert({
            name: formData.name,
            client_id: formData.client_id
        });

        if (!error) {
            await logActivity('Produto Criado', 'product', '', { name: formData.name });
            showToast('Produto criado com sucesso!', 'success');
            await onSave();
            onClose();
        } else {
            console.error('Error creating product:', error);
            showToast(`Erro ao criar produto: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3>Criar Novo Produto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do Produto *</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cliente *</label>
                        <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}>
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                    <Button onClick={handleCreate}>Criar</Button>
                </div>
            </Card>
        </div>
    );
};

const EditProductModal: React.FC<{ product: Product; clients: Client[]; onClose: () => void; onSave: () => void }> = ({ product, clients, onClose, onSave }) => {
    const [formData, setFormData] = useState(product);
    const { showToast } = useToast();

    const handleSave = async () => {
        const { error } = await supabase.from('products').update({
            name: formData.name,
            client_id: formData.client_id
        }).eq('id', product.id);

        if (!error) {
            await logActivity('Produto Editado', 'product', product.id, { name: formData.name });
            showToast('Produto atualizado com sucesso!', 'success');
            await onSave();
            onClose();
        } else {
            console.error('Error updating product:', error);
            showToast(`Erro ao atualizar produto: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3>Editar Produto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do Produto</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cliente</label>
                        <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                    <Button onClick={handleSave}>Salvar</Button>
                </div>
            </Card>
        </div>
    );
};

const LogsTab: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (data && data.length > 0) {
                setLogs(data as ActivityLog[]);
            } else {
                // Mock data if table doesn't exist yet
                setLogs([
                    { id: '1', user_id: 'admin', action: 'Login', details: 'Login realizado com sucesso', created_at: new Date().toISOString() },
                ]);
            }
        };
        fetchLogs();
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
                            <TableCell>{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                            <TableCell>{log.user_id}</TableCell>
                            <TableCell>
                                <span style={{
                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                                    backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 500
                                }}>
                                    {log.action}
                                </span>
                            </TableCell>
                            <TableCell style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};
