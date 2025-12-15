import React, { useEffect, useState } from 'react';
import { Card } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { supabase } from '../services/supabase';
import type { Sale, Client, Profile, Product } from '../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { logActivity } from '../utils/activityLogger';

export const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [salespeople, setSalespeople] = useState<Profile[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [creatingSale, setCreatingSale] = useState(false);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const { showToast } = useToast();

    const fetchSales = async () => {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (error) {
            console.error('Error fetching sales:', error);
            showToast('Erro ao carregar vendas', 'error');
        } else if (data) {
            setSales(data as Sale[]);
        }
    };

    useEffect(() => {
        fetchSales();

        // Fetch clients for dropdown
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, name').eq('active', true);
            if (data) setClients(data as Client[]);
        };

        // Fetch salespeople for dropdown (only sales role, not admin)
        const fetchSalespeople = async () => {
            const { data } = await supabase.from('profiles').select('id, full_name').eq('role', 'sales');
            if (data) setSalespeople(data as Profile[]);
        };

        // Fetch products for dropdown
        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('id, name, client_id');
            if (data) setProducts(data as Product[]);
        };

        fetchClients();
        fetchSalespeople();
        fetchProducts();
    }, []);

    const handleDelete = async (sale: Sale) => {
        if (!confirm(`Tem certeza que deseja remover a venda de ${sale.buyer_name}?`)) return;

        const { error } = await supabase.from('sales').delete().eq('id', sale.id);
        if (!error) {
            await logActivity('Venda Removida', 'sale', sale.id, { product: sale.product_name });
            showToast('Venda removida com sucesso!', 'success');
            fetchSales();
        } else {
            showToast('Erro ao remover venda', 'error');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Vendas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie todas as vendas realizadas.</p>
                </div>
                <Button onClick={() => setCreatingSale(true)}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Nova Venda
                </Button>
            </div>

            {creatingSale && (
                <CreateSaleModal
                    clients={clients}
                    salespeople={salespeople}
                    products={products}
                    onClose={() => setCreatingSale(false)}
                    onSave={fetchSales}
                />
            )}

            {editingSale && (
                <EditSaleModal
                    sale={editingSale}
                    clients={clients}
                    products={products}
                    onClose={() => setEditingSale(null)}
                    onSave={fetchSales}
                />
            )}

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Comprador</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Plataforma</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} style={{ textAlign: 'center' }}>
                                    Nenhuma venda cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map(sale => (
                                <TableRow key={sale.id}>
                                    <TableCell>{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>{clients.find(c => c.id === sale.client_id)?.name || '-'}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p style={{ fontWeight: 500 }}>{sale.buyer_name || '-'}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sale.buyer_email || '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{sale.product_name}</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p style={{ fontSize: '0.875rem' }}>{sale.lead_source || '-'}</p>
                                            {sale.utm_source && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UTM: {sale.utm_source}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{sale.sales_platform || '-'}</TableCell>
                                    <TableCell>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: sale.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                            color: sale.status === 'completed' ? '#166534' : '#92400e'
                                        }}>
                                            {sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : sale.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => setEditingSale(sale)}
                                                style={{ color: 'var(--primary-main)', cursor: 'pointer', background: 'none', border: 'none' }}
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sale)}
                                                style={{ color: 'var(--status-error)', cursor: 'pointer', background: 'none', border: 'none' }}
                                                title="Remover"
                                            >
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

const CreateSaleModal: React.FC<{
    clients: Client[];
    salespeople: Profile[];
    products: Product[];
    onClose: () => void;
    onSave: () => void
}> = ({ clients, salespeople, products, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        client_id: '',
        salesperson_id: '',
        product_name: '',
        amount: 0,
        buyer_name: '',
        buyer_email: '',
        lead_source: '',
        utm_source: '',
        sales_platform: '',
        status: 'completed',
        sale_date: new Date().toISOString().split('T')[0]
    });
    const { showToast } = useToast();

    const handleCreate = async () => {
        if (!formData.client_id || !formData.product_name || formData.amount <= 0) {
            showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
            return;
        }

        const { error } = await supabase.from('sales').insert({
            ...formData,
            sale_date: new Date(formData.sale_date).toISOString()
        });

        if (!error) {
            await logActivity('Venda Criada', 'sale', '', { product: formData.product_name, amount: formData.amount });
            showToast('Venda criada com sucesso!', 'success');
            await onSave();
            onClose();
        } else {
            console.error('Error creating sale:', error);
            showToast(`Erro ao criar venda: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3 style={{ marginBottom: '1.5rem' }}>Criar Nova Venda</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cliente *</label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="">Selecione um cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do Comprador</label>
                        <input
                            value={formData.buyer_name}
                            onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email do Comprador</label>
                        <input
                            type="email"
                            value={formData.buyer_email}
                            onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Produto *</label>
                        <select
                            value={formData.product_name}
                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="">Selecione um produto</option>
                            {products
                                .filter(p => !formData.client_id || p.client_id === formData.client_id)
                                .map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        {formData.client_id && products.filter(p => p.client_id === formData.client_id).length === 0 && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--status-warning)', marginTop: '0.25rem' }}>
                                Nenhum produto cadastrado para este cliente
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Valor (R$) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Data da Venda</label>
                        <input
                            type="date"
                            value={formData.sale_date}
                            onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Origem do Lead</label>
                        <input
                            value={formData.lead_source}
                            onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                            placeholder="Google Ads, Facebook, etc"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>UTM Source</label>
                        <input
                            value={formData.utm_source}
                            onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                            placeholder="utm_source=..."
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Plataforma de Vendas</label>
                        <select
                            value={formData.sales_platform}
                            onChange={(e) => setFormData({ ...formData, sales_platform: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="">Selecione</option>
                            <option value="Hotmart">Hotmart</option>
                            <option value="Eduzz">Eduzz</option>
                            <option value="Monetizze">Monetizze</option>
                            <option value="Kiwify">Kiwify</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Vendedor</label>
                        <select
                            value={formData.salesperson_id}
                            onChange={(e) => setFormData({ ...formData, salesperson_id: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="">Nenhum</option>
                            {salespeople.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
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

const EditSaleModal: React.FC<{
    sale: Sale;
    clients: Client[];
    products: Product[];
    onClose: () => void;
    onSave: () => void
}> = ({ sale, clients, products, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...sale,
        sale_date: new Date(sale.sale_date).toISOString().split('T')[0]
    });
    const { showToast } = useToast();

    const handleSave = async () => {
        const { error } = await supabase.from('sales').update({
            ...formData,
            sale_date: new Date(formData.sale_date).toISOString()
        }).eq('id', sale.id);

        if (!error) {
            await logActivity('Venda Editada', 'sale', sale.id, { product: formData.product_name });
            showToast('Venda atualizada com sucesso!', 'success');
            await onSave();
            onClose();
        } else {
            console.error('Error updating sale:', error);
            showToast(`Erro ao atualizar venda: ${error.message}`, 'error');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
            <Card style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
                <h3 style={{ marginBottom: '1.5rem' }}>Editar Venda</h3>

                {/* Same form as CreateSaleModal but with Edit logic */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Cliente</label>
                        <select
                            value={formData.client_id}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nome do Comprador</label>
                        <input
                            value={formData.buyer_name || ''}
                            onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email do Comprador</label>
                        <input
                            type="email"
                            value={formData.buyer_email || ''}
                            onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Produto</label>
                        <select
                            value={formData.product_name}
                            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            {products
                                .filter(p => !formData.client_id || p.client_id === formData.client_id)
                                .map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Valor (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Data da Venda</label>
                        <input
                            type="date"
                            value={formData.sale_date}
                            onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Origem do Lead</label>
                        <input
                            value={formData.lead_source || ''}
                            onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>UTM Source</label>
                        <input
                            value={formData.utm_source || ''}
                            onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Plataforma de Vendas</label>
                        <select
                            value={formData.sales_platform || ''}
                            onChange={(e) => setFormData({ ...formData, sales_platform: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="">Selecione</option>
                            <option value="Hotmart">Hotmart</option>
                            <option value="Eduzz">Eduzz</option>
                            <option value="Monetizze">Monetizze</option>
                            <option value="Kiwify">Kiwify</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', marginTop: '0.25rem' }}
                        >
                            <option value="completed">Concluída</option>
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovada</option>
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
