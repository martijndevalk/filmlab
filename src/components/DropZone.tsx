import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

const CONSTANTS = {
  MAGIC_NUMBERS: {
    JPG: [0xFF, 0xD8, 0xFF],
    PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024 // 20MB
};

export function DropZone({ onFileSelect }: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = async (file: File): Promise<boolean> => {
    // 1. File size check
    if (file.size > CONSTANTS.MAX_FILE_SIZE) {
      setError(`Bestand is te groot. Maximaal ${CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return false;
    }

    // 2. MIME type check
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Alleen JPG en PNG bestanden zijn toegestaan.');
      return false;
    }

    // 2. Magic Number check
    try {
      const buffer = await file.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const isJpg = CONSTANTS.MAGIC_NUMBERS.JPG.every((byte, i) => bytes[i] === byte);
      const isPng = CONSTANTS.MAGIC_NUMBERS.PNG.every((byte, i) => bytes[i] === byte);

      if (!isJpg && !isPng) {
        setError('Ongeldig bestandsformaat (magic number mismatch).');
        return false;
      }

      setError(null);
      return true;
    } catch (e) {
      console.error(e);
      setError('Fout bij lezen bestand.');
      return false;
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    // Simulate a small delay for better UX (so the loader is visible)
    await new Promise(resolve => setTimeout(resolve, 800));

    if (await validateFile(file)) {
      onFileSelect(file);
    } else {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (isLoading) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processFile(file);
      }
    };
    input.click();
  };

  return (
    <div className={`${styles.dropZone} ${isLoading ? styles.loading : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loaderContainer}>
             <Loader2 className={styles.spinner} size={64} />
             <p className={styles.loadingText}>Bestand verwerken...</p>
          </div>
        ) : (
          <>
            <div className={styles.iconBox}>
              <Upload className={styles.icon} color="white" size={48} strokeWidth={2.5} />
            </div>
            <p className={styles.title}>
              Sleep je JPG hier
            </p>
            <p className={styles.subtitle}>
              of klik om te uploaden
            </p>
            {error && (
              <p style={{ color: 'var(--destructive)', marginTop: '1rem', fontWeight: 'bold' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
