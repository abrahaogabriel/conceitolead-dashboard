import React, { type TableHTMLAttributes, type HTMLAttributes, type ThHTMLAttributes, type TdHTMLAttributes } from 'react';
import styles from './Table.module.css';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
    // Add specific props if needed
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={`${styles.table} ${className || ''}`} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
    <thead className={styles.thead} {...props}>{children}</thead>
);

export const TableBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
    <tbody className={styles.tbody} {...props}>{children}</tbody>
);

export const TableRow: React.FC<HTMLAttributes<HTMLTableRowElement>> = ({ children, ...props }) => (
    <tr className={styles.tr} {...props}>{children}</tr>
);

export const TableHead: React.FC<ThHTMLAttributes<HTMLTableCellElement>> = ({ children, ...props }) => (
    <th className={styles.th} {...props}>{children}</th>
);

export const TableCell: React.FC<TdHTMLAttributes<HTMLTableCellElement>> = ({ children, ...props }) => (
    <td className={styles.td} {...props}>{children}</td>
);
