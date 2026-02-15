import React from 'react';
import styles from '../Controls.module.css';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  suffix = '%'
}: SliderProps) {
  return (
    <div className={styles.sliderGroup}>
      <div className={styles.intensityHeader}>
        <label className={styles.intensityLabel}>{label}</label>
        <span className={styles.intensityValue}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.inputRange}
      />
    </div>
  );
}
