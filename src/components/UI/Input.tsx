import React, { type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = false,
    className,
    id,
    ...props
}) => {
    const inputID = id || props.name;

    return (
        <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
            {label && (
                <label htmlFor={inputID} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputID}
                className={`${styles.input} ${error ? styles.errorInput : ''} ${className || ''}`}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};
