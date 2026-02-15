import { useState } from 'react';
import { DropZone } from './DropZone';
import { ImageEditor } from './ImageEditor';
import { Zap, Layers, ShieldCheck } from 'lucide-react';
import styles from './App.module.css';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
  };

  const handleReset = () => {
    setImageFile(null);
  };

  if (imageFile) {
    return <ImageEditor imageFile={imageFile} onReset={handleReset} />;
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.logoWrapper}>
          <h1 className={styles.logoText}>FilmLab</h1>
        </div>
        <h2 className={styles.headline}>
          Geef je digitale foto's een authentieke analoge film-look
        </h2>
        <p className={styles.subheadline}>
          Upload je JPG en kies uit klassieke filmstocks zoals Portra, Kodachrome en Vision3. Direct in je browser, zonder upload naar een server.
        </p>
      </header>

      <main className={styles.mainContent}>
        <DropZone onFileSelect={handleFileSelect} />
      </main>

      <footer className={styles.featuresGrid}>
        <div className={styles.featureBox}>
          <div className={styles.featureHeader}>
            <Zap size={20} fill="orange" stroke="orange" />
            <span className={styles.featureTitle}>Snel</span>
          </div>
          <p className={styles.featureDesc}>Direct resultaat in je browser</p>
        </div>

        <div className={styles.featureBox}>
          <div className={styles.featureHeader}>
            <Layers size={20} fill="#3b82f6" stroke="#3b82f6" />
            <span className={styles.featureTitle}>Authentiek</span>
          </div>
          <p className={styles.featureDesc}>4 klassieke filmstocks</p>
        </div>

        <div className={styles.featureBox}>
          <div className={styles.featureHeader}>
            <ShieldCheck size={20} fill="#10b981" stroke="#10b981" />
            <span className={styles.featureTitle}>Privacy</span>
          </div>
          <p className={styles.featureDesc}>100% lokaal, geen upload</p>
        </div>
      </footer>
    </div>
  );
}
