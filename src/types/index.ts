export interface Client {
    id: string;
    name: string;
    website_url?: string;
    branding_colors?: any;
    active: boolean;
    created_at: string;
    commission_rate?: number;
    monthly_fee?: number;
}

export interface Profile {
    id: string;
    full_name: string | null;
    role: 'admin' | 'sales' | 'client';
    client_id?: string;
    created_at: string;
}

export interface Product {
    id: string;
    client_id: string;
    name: string;
    price?: number;
    created_at: string;
}

export interface Sale {
    id: string;
    client_id: string;
    salesperson_id?: string;
    amount: number;
    commission?: number;
    product_name: string;
    buyer_name?: string;
    buyer_email?: string;
    status: string;
    sale_date: string;
    created_at: string;
}

export interface SalesGoal {
    id: string;
    salesperson_id: string;
    month: number;
    year: number;
    target_amount: number;
}

export interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    details?: any;
    created_at: string;
}
