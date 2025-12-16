import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Target, Settings, LogOut, Shield } from 'lucide-react';
import styles from './Sidebar.module.css';
import logo from '../../assets/logo-horizontal.png';

import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
    const { profile, signOut } = useAuth();

    return (
        <aside className={`${styles.sidebar} ${styles.expanded}`}>
            <div className={styles.logo}>
                <img src={logo} alt="Conceito Lead" className={styles.logoImage} />
            </div>

            <nav className={styles.nav}>
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>Principal</p>
                    <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Dashboard">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                </div>

                {(profile?.role === 'admin' || profile?.role === 'sales') && (
                    <div className={styles.section}>
                        <p className={styles.sectionTitle}>Gestão</p>
                        <NavLink to="/sales" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Vendas">
                            <ShoppingBag size={20} />
                            <span>Vendas</span>
                        </NavLink>
                        <NavLink to="/goals" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Metas">
                            <Target size={20} />
                            <span>Metas</span>
                        </NavLink>
                        {profile?.role === 'admin' && (
                            <NavLink to="/governance" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Governança">
                                <Shield size={20} />
                                <span style={{ fontSize: '0.9rem' }}>Governança</span>
                            </NavLink>
                        )}
                    </div>
                )}

                <div className={styles.section}>
                    <p className={styles.sectionTitle}>Configurações</p>
                    <NavLink to="/settings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Ajustes">
                        <Settings size={20} />
                        <span>Ajustes</span>
                    </NavLink>
                </div>
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={signOut} title="Sair">
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};
