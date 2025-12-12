import React from 'react';
import { Card } from '../UI/Card';

interface TopProduct {
    name: string;
    count: number;
    revenue: number;
}

interface TopProductsProps {
    products: TopProduct[];
}

export const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
    return (
        <Card>
            <h3 style={{ marginBottom: '1rem' }}>Produtos Mais Vendidos</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum dado disponível.</p>
                ) : (
                    products.map((product, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index !== products.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: index !== products.length - 1 ? '0.5rem' : '0' }}>
                            <div>
                                <p style={{ fontWeight: 500 }}>{product.name}</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.count} vendas</p>
                            </div>
                            <p style={{ fontWeight: 600 }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.revenue)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
