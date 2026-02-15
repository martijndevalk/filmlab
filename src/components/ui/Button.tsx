import React from 'react';
import styles from '../Controls.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass = variant === 'primary' ? styles.btnPrimary :
                       variant === 'icon' ? styles.btnIcon : '';

  return (
    <button
      className={`${styles.btn} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
