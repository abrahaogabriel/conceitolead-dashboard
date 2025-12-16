import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import styles from './DashboardLayout.module.css';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.container}>
            {/* Mobile Header / Toggle */}
            <div className={styles.mobileHeader}>
                <button
                    className={styles.menuBtn}
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Abrir menu"
                >
                    <Menu size={24} color="var(--primary-main)" />
                </button>
                <span className={styles.mobileBrand}>Conceito Lead</span>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};
