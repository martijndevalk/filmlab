import { RotateCcw, Download } from 'lucide-react';
import styles from './Controls.module.css';

export type FilterType = 'ektachrome' | 'portra-400' | 'agfa-vista-400' | 'kodachrome-64';

export const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'ektachrome', label: 'Ektachrome' },
  { id: 'portra-400', label: 'Portra 400' },
  { id: 'agfa-vista-400', label: 'Agfa Vista 400' },
  { id: 'kodachrome-64', label: 'Kodachrome 64' },
];

interface ControlsProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  intensity: number;
  onIntensityChange: (value: number) => void;
  onReset: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

export function Controls({
  selectedFilter,
  onFilterChange,
  intensity,
  onIntensityChange,
  onReset,
  onDownload,
  isProcessing
}: ControlsProps) {
  return (
    <div className={styles.controlsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>FilmLab</h1>
        <button
          onClick={onReset}
          className={`${styles.btn} ${styles.btnIcon}`}
          aria-label="Reset"
        >
          <RotateCcw width={20} height={20} />
        </button>
      </div>

      {/* Filter Selection */}
      <div>
        <label className={styles.filterLabel}>Film Type</label>
        <div className={styles.filterGrid}>
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`${styles.btn} ${styles.filterButton} ${selectedFilter === filter.id ? styles.btnPrimary : ''}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <div className={styles.intensityHeader}>
          <label className={styles.intensityLabel}>Intensity</label>
          <span className={styles.intensityValue}>{intensity}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => onIntensityChange(Number(e.target.value))}
          className={styles.inputRange}
        />
      </div>

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={isProcessing}
        className={`${styles.btn} ${styles.btnPrimary} ${styles.downloadButton}`}
      >
        <div className={styles.downloadContent}>
          <Download width={24} height={24} />
          <span>{isProcessing ? 'Processing...' : 'Download'}</span>
        </div>
      </button>
    </div>
  );
}
