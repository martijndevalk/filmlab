# 🎞️ FilmLab

FilmLab is a Neo-brutalist web application designed for photographers who love the analog aesthetic. It allows you to apply high-quality film emulations (LUTs) and physical film effects like grain and halation directly in your browser using high-performance WebGL.

## ✨ Features

- **Genuine 35mm LUTs**: Including Portra 400, Ektachrome, and Kodachrome.
- **Dynamic Film Grain**: Realistic Simplex-noise based grain with adjustable intensity.
- **Halation Effect**: Emulate the "red glow" seen in high-contrast analog shots.
- **Neo-brutalist UI**: A bold, tactile interface with energetic animations.
- **Framed Export**: Save your photos with a professional white border and metadata.
- **Privacy First**: All processing happens locally in your browser. No photos ever leave your computer.

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:4321`

## 🛠️ Built With

- **Astro**: Modern web architecture.
- **React 19**: Responsive UI components.
- **WebGL**: Hardware-accelerated image processing.
- **Lucide**: Clean and consistent iconography.

---
*Created with ❤️ for the analog community.*

## 🌍 Deployment

This project is configured for automated deployment to **GitHub Pages**.

1. Push your code to the `main` branch.
2. Go to your repository settings on GitHub: **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Your site will be live at `https://martijndevalk.github.io/filmlab/` once the action completes.
