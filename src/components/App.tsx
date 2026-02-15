import { useState } from 'react';
import { DropZone } from './DropZone';
import { ImageEditor } from './ImageEditor';
import styles from './App.module.css';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
  };

  const handleReset = () => {
    setImageFile(null);
  };

  return (
    <div className={styles.appContainer}>
      {!imageFile ? (
        <DropZone onFileSelect={handleFileSelect} />
      ) : (
        <ImageEditor imageFile={imageFile} onReset={handleReset} />
      )}
    </div>
  );
}
