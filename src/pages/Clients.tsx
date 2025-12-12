import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Client } from '../types';
import { Card } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Plus, Edit2 } from 'lucide-react';

export const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setClients(data as Client[]);

        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando clientes...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Clientes</h1>
                <Button>
                    <Plus size={18} />
                    Novo Cliente
                </Button>
            </div>

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>URL Website</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} style={{ textAlign: 'center' }}>Nenhum cliente cadastrado.</TableCell>
                            </TableRow>
                        ) : (
                            clients.map(client => (
                                <TableRow key={client.id}>
                                    <TableCell style={{ fontWeight: 500 }}>{client.name}</TableCell>
                                    <TableCell>
                                        {client.website_url ? (
                                            <a href={client.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-main)', textDecoration: 'underline' }}>
                                                {client.website_url}
                                            </a>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            backgroundColor: client.active ? '#dcfce7' : '#fef2f2',
                                            color: client.active ? '#166534' : '#991b1b'
                                        }}>
                                            {client.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <button style={{ color: 'var(--text-secondary)' }} title="Editar">
                                            <Edit2 size={18} />
                                        </button>
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
