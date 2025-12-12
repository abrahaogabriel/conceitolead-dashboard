import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';
import { Card } from '../components/UI/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/UI/Table';
import { Button } from '../components/UI/Button';
import { Trash2, UserPlus } from 'lucide-react';

export const Users: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as Profile[]);

        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando usuários...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Gestão de Usuários</h1>
                <Button>
                    <UserPlus size={18} />
                    Novo Usuário
                </Button>
            </div>

            <Card noPadding>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Cliente Vinculado</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} style={{ textAlign: 'center' }}>Nenhum usuário encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.full_name || 'Sem nome'}</TableCell>
                                    <TableCell>
                                        <span style={{
                                            textTransform: 'capitalize',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            backgroundColor: user.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                                            color: user.role === 'admin' ? '#3730a3' : '#374151'
                                        }}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>{user.client_id || '-'}</TableCell>
                                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <button style={{ color: 'var(--status-error)' }} title="Remover">
                                            <Trash2 size={18} />
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
