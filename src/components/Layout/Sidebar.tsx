import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Target, Settings, LogOut, Shield } from 'lucide-react';
import styles from './Sidebar.module.css';

import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
    const { profile, signOut } = useAuth();
    // ... (keep initial code if reusing full file, but replace uses smaller chunk)
    // Re-implementing component body to include useAuth and conditionals

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h1>Conceito Lead</h1>
            </div>

            <nav className={styles.nav}>
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>Principal</p>
                    <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                </div>

                {(profile?.role === 'admin' || profile?.role === 'sales') && (
                    <div className={styles.section}>
                        <p className={styles.sectionTitle}>Gestão</p>
                        <NavLink to="/sales" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                            <ShoppingBag size={20} />
                            <span>Vendas</span>
                        </NavLink>
                        <NavLink to="/goals" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                            <Target size={20} />
                            <span>Metas</span>
                        </NavLink>
                        {profile?.role === 'admin' && (
                            <NavLink to="/governance" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                                <Shield size={20} />
                                <span style={{ fontSize: '0.9rem' }}>Governança</span>
                            </NavLink>
                        )}
                    </div>
                )}

                <div className={styles.section}>
                    <p className={styles.sectionTitle}>Configurações</p>
                    <NavLink to="/settings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                        <Settings size={20} />
                        <span>Ajustes</span>
                    </NavLink>
                </div>
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={signOut}>
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};
