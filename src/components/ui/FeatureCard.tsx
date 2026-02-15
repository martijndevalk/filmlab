import React from 'react';
import styles from '../App.module.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles.featureBox}>
      <div className={styles.featureHeader}>
        {icon}
        <span className={styles.featureTitle}>{title}</span>
      </div>
      <p className={styles.featureDesc}>{description}</p>
    </div>
  );
}
