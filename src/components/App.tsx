import { useState } from 'react';
import { DropZone } from './DropZone';
import { ImageEditor } from './ImageEditor';
import { Zap, Layers, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import styles from './App.module.css';

import { FeatureCard } from './ui/FeatureCard';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setImageFile(file);
      });
    } else {
      setImageFile(file);
    }
  };

  const handleReset = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setImageFile(null);
      });
    } else {
      setImageFile(null);
    }
  };

  return (
    <div className={`${styles.viewContainer} ${imageFile ? styles.editorActive : ''}`}>
      {!imageFile ? (
        <div className={styles.appContainer}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.logoWrapper}>
                <h1 className={styles.logoText}>FilmLab</h1>
              </div>
              <ThemeToggle />
            </div>
            <h2 className={styles.headline}>
              Geef je digitale foto's een authentieke analoge film-look
            </h2>
            <p className={styles.subheadline}>
              Upload je JPG en kies uit klassieke filmstocks zoals Portra, Kodachrome en Ektachrome. Direct in je browser, zonder upload naar een server.
            </p>
          </header>

          <main className={styles.mainContent}>
            <DropZone onFileSelect={handleFileSelect} />
          </main>

          <footer className={styles.featuresGrid}>
            <FeatureCard
              icon={<Zap size={20} fill="var(--color-accent-orange)" stroke="var(--color-accent-orange)" />}
              title="Snel"
              description="Direct resultaat in je browser"
            />
            <FeatureCard
              icon={<Layers size={20} fill="var(--color-accent-blue)" stroke="var(--color-accent-blue)" />}
              title="Authentiek"
              description="4 klassieke filmstocks"
            />
            <FeatureCard
              icon={<ShieldCheck size={20} fill="var(--color-success)" stroke="var(--color-success)" />}
              title="Privacy"
              description="100% lokaal, geen upload"
            />
          </footer>
        </div>
      ) : (
        <ImageEditor imageFile={imageFile} onReset={handleReset} />
      )}
    </div>
  );
}
