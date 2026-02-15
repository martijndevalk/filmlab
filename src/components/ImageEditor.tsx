import { useEffect, useRef, useState } from 'react';
import { Controls, type FilterType, FILTERS } from './Controls';
import { useLutFilter } from '../hooks/useLutFilter';
import { Eye } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import styles from './ImageEditor.module.css';

interface ImageEditorProps {
  imageFile: File;
  onReset: () => void;
}

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};

export function ImageEditor({ imageFile, onReset }: ImageEditorProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ektachrome');
  const [intensity, setIntensity] = useState(100);
  const [grainAmount, setGrainAmount] = useState(0);
  const [halationAmount, setHalationAmount] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      setImage(img);
    };

    img.onerror = () => {
      console.error('Failed to load image');
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // WebGL Filter Hook
  const { isProcessing } = useLutFilter({
    canvasRef,
    image,
    lutUrl: `${import.meta.env.BASE_URL}/luts/${selectedFilter}.cube`.replace(/\/+/g, '/'),
    intensity,
    grainAmount,
    halationAmount,
    showOriginal: isComparing
  });

  // Global loading cursor
  useEffect(() => {
    if (isProcessing) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = '';
    }
  }, [isProcessing]);

  const getProcessedCanvas = () => {
    return canvasRef.current;
  };

  const handleDownload = () => {
    const canvas = getProcessedCanvas();
    if (!canvas) return;

    const url = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    const safeName = sanitizeFilename(imageFile.name.split('.')[0] || 'photo');
    a.download = `filmlab-${safeName}-${selectedFilter}.jpg`;
    a.click();
  };

  const handleExportWithFrame = async () => {
    const sourceCanvas = getProcessedCanvas();
    if (!sourceCanvas || !image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = sourceCanvas.width * 0.1; // 10% padding
    const bottomPadding = sourceCanvas.width * 0.25; // Extra space for text

    canvas.width = sourceCanvas.width + padding * 2;
    canvas.height = sourceCanvas.height + padding + bottomPadding;

    // Background
    ctx.fillStyle = '#ffffff'; // --color-surface
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Image
    ctx.drawImage(sourceCanvas, padding, padding);

    // Text
    ctx.fillStyle = '#111827'; // --color-text-primary
    const fontSize = Math.max(20, sourceCanvas.width * 0.04);
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    const filterLabel = FILTERS.find(f => f.id === selectedFilter)?.label || selectedFilter;
    ctx.fillText(`Processed with ${filterLabel}`, canvas.width / 2, sourceCanvas.height + padding + (bottomPadding * 0.6));

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = sanitizeFilename(imageFile.name.split('.')[0] || 'photo');
    a.download = `filmlab-framed-${safeName}-${selectedFilter}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const canvas = getProcessedCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `filmlab-${Date.now()}.jpg`, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'FilmLab Photo',
            text: 'Check uit deze analoge look!'
          });
        } catch (err) {
          console.error('Sharing failed', err);
        }
      } else {
        // Fallback to download if sharing not supported
        handleDownload();
      }
    }, 'image/jpeg', 0.95);
  };

  const startComparing = () => setIsComparing(true);
  const stopComparing = () => setIsComparing(false);

  return (
    <div className={styles.editorContainer}>
      {/* Image Display Area */}
      <div className={styles.canvasWrapper}>
        <div className={styles.canvasContainer}>
           <canvas
             ref={canvasRef}
             className={styles.canvas}
             onMouseDown={startComparing}
             onMouseUp={stopComparing}
             onMouseLeave={stopComparing}
             onTouchStart={startComparing}
             onTouchEnd={stopComparing}
           />

            <div className={styles.themeToggleOverlay}>
              <ThemeToggle />
            </div>

            <div className={styles.compareOverlay} title="Ingehouden houden om te vergelijken met het origineel">
              <Eye size={20} />
              <span className={styles.compareTooltip}>Houd ingedrukt om te vergelijken</span>
            </div>

           {!image && (
             <div className={styles.loadingOverlay}>
               Loading image...
             </div>
           )}
        </div>
      </div>

      {/* Controls Panel */}
      <Controls
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        intensity={intensity}
        onIntensityChange={setIntensity}
        grainAmount={grainAmount}
        onGrainChange={setGrainAmount}
        halationAmount={halationAmount}
        onHalationChange={setHalationAmount}
        onReset={onReset}
        onDownload={handleDownload}
        onExportWithFrame={handleExportWithFrame}
        onShare={handleShare}
        isProcessing={isProcessing}
      />
    </div>
  );
}
