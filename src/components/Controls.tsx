import { RotateCcw, Download, Share2, Frame } from 'lucide-react';
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
  grainAmount: number;
  onGrainChange: (value: number) => void;
  halationAmount: number;
  onHalationChange: (value: number) => void;
  onReset: () => void;
  onDownload: () => void;
  onExportWithFrame: () => void;
  onShare: () => void;
  isProcessing: boolean;
}

export function Controls({
  selectedFilter,
  onFilterChange,
  intensity,
  onIntensityChange,
  grainAmount,
  onGrainChange,
  halationAmount,
  onHalationChange,
  onReset,
  onDownload,
  onExportWithFrame,
  onShare,
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
          aria-label="Instellingen herstellen"
          title="Instellingen herstellen naar de beginwaarden"
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
              title={`Toepassen: ${filter.label}`}
              aria-label={`Selecteer ${filter.label} filter`}
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

      {/* Grain Slider */}
      <div>
        <div className={styles.intensityHeader}>
          <label className={styles.intensityLabel}>Film Grain</label>
          <span className={styles.intensityValue}>{grainAmount}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={grainAmount}
          onChange={(e) => onGrainChange(Number(e.target.value))}
          className={styles.inputRange}
        />
      </div>

      {/* Halation Slider */}
      <div>
        <div className={styles.intensityHeader}>
          <label className={styles.intensityLabel}>Halation (Glow)</label>
          <span className={styles.intensityValue}>{halationAmount}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={halationAmount}
          onChange={(e) => onHalationChange(Number(e.target.value))}
          className={styles.inputRange}
        />
      </div>

      {/* Actions */}
      <div className={styles.actionsGrid}>
        <button
          onClick={onDownload}
          disabled={isProcessing}
          className={`${styles.btn} ${styles.btnPrimary} ${styles.actionButton}`}
          title="Download de bewerkte foto"
          aria-label="Foto downloaden"
        >
          <div className={styles.downloadContent}>
            <Download width={20} height={20} />
            <span>Download</span>
          </div>
        </button>

        <button
          onClick={onExportWithFrame}
          disabled={isProcessing}
          className={`${styles.btn} ${styles.actionButton}`}
          title="Exporteer met een witte rand en tekst"
          aria-label="Exporteer met omlijsting"
        >
          <div className={styles.downloadContent}>
            <Frame width={20} height={20} />
            <span>Framed</span>
          </div>
        </button>

        <button
          onClick={onShare}
          disabled={isProcessing}
          className={`${styles.btn} ${styles.actionButton}`}
          title="Deel je foto via sociale media of andere apps"
          aria-label="Foto delen"
        >
          <div className={styles.downloadContent}>
            <Share2 width={20} height={20} />
            <span>Share</span>
          </div>
        </button>
      </div>
    </div>
  );
}
