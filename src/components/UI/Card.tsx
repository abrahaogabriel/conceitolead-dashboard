import React, { type HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    noPadding = false,
    className,
    ...props
}) => {
    return (
        <div
            className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    );
};
