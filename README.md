# Cinematic Birthday Surprise

A luxury, client-side interactive single-page web app built with React, Vite, GSAP, and Three.js (@react-three/fiber and @react-three/drei).

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development Server
To start the local development server with hot reload:
```bash
npm run dev
```

### Building for Production
To build the application for static deployment (e.g., on Vercel):
```bash
npm run build
```

### Previewing Production Build
To test the production build locally:
```bash
npm run preview
```

## Customizing Personal Content

All personal text, dates, gift labels, memory photos, and audio file mappings are centralized in one location:

**`src/config.js`**

To personalize the application for a different recipient:
1. Open `src/config.js`.
2. Update properties like `recipientName`, `birthdayDate`, `birthdayDateShort`, `finalMessage`, `letterText`, `giftLabels`, `giftMessage`, and `memories`.
3. Add custom images into `public/images/` and audio files into `public/audio/`.
