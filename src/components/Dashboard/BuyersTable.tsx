import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../UI/Table';
import type { Sale } from '../../types';
import { Card } from '../UI/Card';

interface BuyersTableProps {
    sales: Sale[];
}

export const BuyersTable: React.FC<BuyersTableProps> = ({ sales }) => {
    return (
        <Card noPadding>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Compradores Recentes</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente/Comprador</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Nenhuma venda encontrada.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>{new Date(sale.sale_date).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{sale.buyer_name || 'Desconhecido'}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sale.buyer_email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{sale.product_name}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.amount))}
                                </TableCell>
                                <TableCell>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        backgroundColor: sale.status === 'completed' || sale.status === 'approved' ? '#dcfce7' : '#fef9c3',
                                        color: sale.status === 'completed' || sale.status === 'approved' ? '#166534' : '#854d0e'
                                    }}>
                                        {sale.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
};
