import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Target, Settings, LogOut, Shield } from 'lucide-react';
import styles from './Sidebar.module.css';
import logo from '../../assets/logo-horizontal.png';

import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { profile, signOut } = useAuth();

    return (
        <>
            {/* Overlay Mobile */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={onClose}
            />

            <aside className={`${styles.sidebar} ${styles.expanded} ${isOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.logo}>
                    <img src={logo} alt="Conceito Lead" className={styles.logoImage} />
                    {/* Botão fechar mobile (opcional, já clica fora pra fechar) */}
                </div>

                <nav className={styles.nav}>
                    {/* ... (resto do nav mantém igual, apenas adicionamos onClick={onClose} nos NavLinks para fechar ao navegar mobile) */}
                    <div className={styles.section}>
                        <p className={styles.sectionTitle}>Principal</p>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                            title="Dashboard"
                            onClick={onClose}
                        >
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                    </div>

                    {(profile?.role === 'admin' || profile?.role === 'sales') && (
                        <div className={styles.section}>
                            <p className={styles.sectionTitle}>Gestão</p>
                            <NavLink to="/sales" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Vendas" onClick={onClose}>
                                <ShoppingBag size={20} />
                                <span>Vendas</span>
                            </NavLink>
                            <NavLink to="/goals" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Metas" onClick={onClose}>
                                <Target size={20} />
                                <span>Metas</span>
                            </NavLink>
                            {profile?.role === 'admin' && (
                                <NavLink to="/governance" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Governança" onClick={onClose}>
                                    <Shield size={20} />
                                    <span style={{ fontSize: '0.9rem' }}>Governança</span>
                                </NavLink>
                            )}
                        </div>
                    )}

                    <div className={styles.section}>
                        <p className={styles.sectionTitle}>Configurações</p>
                        <NavLink to="/settings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} title="Ajustes" onClick={onClose}>
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
        </>
    );
};
