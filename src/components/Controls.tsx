import { useState, useEffect } from 'react';
import { RotateCcw, Download, Share2, Frame, ChevronDown, ChevronUp, Sliders, Film } from 'lucide-react';
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

import { Button } from './ui/Button';
import { Slider } from './ui/Slider';

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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(true);

  // Auto-collapse on small screens initially if needed,
  // but let's keep it simple for now and just allow manual toggle.
  useEffect(() => {
    if (window.innerWidth < 768) {
      // Maybe collapse effects by default on small mobile?
      // setIsEffectsExpanded(false);
    }
  }, []);

  return (
    <div className={styles.controlsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>FilmLab</h1>
        <Button
          variant="icon"
          onClick={onReset}
          aria-label="Instellingen herstellen"
          title="Instellingen herstellen naar de beginwaarden"
        >
          <RotateCcw size={20} />
        </Button>
      </div>

      {/* Filter Selection Section */}
      <div className={`${styles.section} ${!isFiltersExpanded ? styles.sectionCollapsed : ''}`}>
        <button
          className={styles.sectionHeader}
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
        >
          <div className={styles.sectionTitleWrapper}>
            <Film size={18} />
            <h2 className={styles.sectionTitle}>Film Type</h2>
          </div>
          {isFiltersExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <div className={`${styles.sectionContent} ${!isFiltersExpanded ? styles.collapsed : ''}`}>
          <div className={styles.filterGrid}>
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                variant={selectedFilter === filter.id ? 'primary' : 'secondary'}
                className={styles.filterButton}
                title={`Toepassen: ${filter.label}`}
                aria-label={`Selecteer ${filter.label} filter`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Effects/Settings Section */}
      <div className={`${styles.section} ${!isEffectsExpanded ? styles.sectionCollapsed : ''}`}>
        <button
          className={styles.sectionHeader}
          onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
        >
          <div className={styles.sectionTitleWrapper}>
            <Sliders size={18} />
            <h2 className={styles.sectionTitle}>Effects</h2>
          </div>
          {isEffectsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <div className={`${styles.sectionContent} ${styles.effectsGrid} ${!isEffectsExpanded ? styles.collapsed : ''}`}>
          <Slider
            label="Intensity"
            value={intensity}
            onChange={onIntensityChange}
          />
          <Slider
            label="Film Grain"
            value={grainAmount}
            onChange={onGrainChange}
          />
          <Slider
            label="Halation"
            value={halationAmount}
            onChange={onHalationChange}
          />
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actionsGrid}>
        <Button
          variant="primary"
          onClick={onDownload}
          disabled={isProcessing}
          className={styles.actionButton}
          title="Download de bewerkte foto"
          aria-label="Foto downloaden"
        >
          <div className={styles.downloadContent}>
            <Download size={18} />
            <span>Save</span>
          </div>
        </Button>

        <Button
          onClick={onExportWithFrame}
          disabled={isProcessing}
          className={styles.actionButton}
          title="Exporteer met een witte rand en tekst"
          aria-label="Exporteer met omlijsting"
        >
          <div className={styles.downloadContent}>
            <Frame size={18} />
            <span>Frame</span>
          </div>
        </Button>

        <Button
          onClick={onShare}
          disabled={isProcessing}
          className={styles.actionButton}
          title="Deel je foto via sociale media of andere apps"
          aria-label="Foto delen"
        >
          <div className={styles.downloadContent}>
            <Share2 size={18} />
            <span>Share</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
