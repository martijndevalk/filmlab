import { useEffect, useRef, useState } from 'react';
import { Controls, FilterType } from './Controls';
import { useLutFilter } from '../hooks/useLutFilter';
import styles from './ImageEditor.module.css';

interface ImageEditorProps {
  imageFile: File;
  onReset: () => void;
}

export function ImageEditor({ imageFile, onReset }: ImageEditorProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ektachrome');
  const [intensity, setIntensity] = useState(70);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      setImage(img);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [imageFile]);

  // WebGL Filter Hook
  const { isProcessing } = useLutFilter({
    canvasRef,
    image,
    lutUrl: `/luts/${selectedFilter}.cube`,
    intensity
  });

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const url = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filmlab-${selectedFilter}-${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className={styles.editorContainer}>
      {/* Image Display Area */}
      <div className={styles.canvasWrapper}>
        <div className={styles.canvasContainer}>
           {/* Canvas is controlled by WebGL hook */}
           <canvas
             ref={canvasRef}
             className={styles.canvas}
           />

           {!image && (
             <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        onReset={onReset}
        onDownload={handleDownload}
        isProcessing={isProcessing}
      />
    </div>
  );
}
