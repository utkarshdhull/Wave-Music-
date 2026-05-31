# 🎵 Wave Music Player

Wave is a state-of-the-art, high-fidelity music streaming application built with a modern glassmorphic UI, dynamic ambient color gradients, and real-time audio analytics visualization.

---

## ✨ Premium Features

### 🌈 1. Dynamic Background Glow
- Automatically extracts dominant colors from the currently playing track's album artwork.
- Updates global CSS background gradients and container backplates with a smooth, transition-based glow effect (no sudden flashes).

### 📊 2. Reusable Animated Equalizer
- Features modular, vertical soundwave equalizer bars that bounce in sync with playback.
- Automatically pauses the vertical bounce animation when playback is paused.
- Integrated elegantly across song lists, cover art hover cards, player controls, and fullscreen overlays.

### 🔮 3. Dynamic Floating Music Orb
- A glassmorphic floating orb overlay showing the active album art.
- Spins slowly and floats dynamically while music is playing, complete with dual pulsing aura rings.
- **Single Click**: Seamlessly enters visualizer full-screen mode.
- **Double Click**: Expands the standard full-screen player.
- **Hover**: Renders a glassmorphic song details tooltip card.

### 🎛️ 4. Immersive Fullscreen & Vinyl Player
- A fullscreen immersive mode featuring standard art view and a **Vinyl Record mode**.
- Vinyl View includes rotating grooves and a moving metallic tonearm that slides into place during playback.
- Offers a live sidebar layout toggling between the active queue list and a shimmery lyrics panel.

### 🎨 5. Interactive Canvas Visualizer
- High-definition HTML5 Canvas drawing, fully optimized for Retina/High-DPI displays.
- Supports 3 real-time frequency-domain styles: **Waveform**, **Circular Spectrum**, and **Bar Spectrum** (center-mirrored).

---

## 🛠️ Technology Stack

### Front-End (Client)
- **Core**: React 19, Vite (Fast Bundling)
- **Styling**: Tailwind CSS & Custom Vanilla CSS Keyframe Animations
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)

### Back-End (Server)
- **Core**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with Secure Cookie Contexts
- **Media Uploads**: Multer
- **API Client**: Axios

---

## 📁 Project Directory Structure

```text
├── client/                 # Front-end React Application
│   ├── src/
│   │   ├── api/            # API endpoints & Axios configuration
│   │   ├── components/     # UI elements, layout, and player components
│   │   ├── context/        # AudioPlayer and Auth contexts
│   │   ├── hooks/          # Custom react hooks (useAudioPlayer, useFavorites)
│   │   ├── pages/          # Navigation views (Home, Library, Register, Search, Upload)
│   │   ├── styles/         # Global styles (index.css with custom premium animations)
│   │   └── utils/          # Client utilities & media helpers
│   ├── index.html
│   ├── tailwind.config.js  # Theme and animation configurations
│   └── package.json
│
├── server/                 # Back-end Express REST API
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # Route handler controller functions
│   │   ├── middleware/     # JWT authorization & secure request wrappers
│   │   ├── models/         # MongoDB Schemas (User, Song, Playlist)
│   │   ├── routes/         # Router declarations
│   │   └── utils/          # Server serializers and async wrappers
│   ├── uploads/            # Local media file storage (songs & cover art)
│   └── package.json
│
├── scripts/                # Database Seed and Verification Scripts
│   ├── seed-songs.mjs      # Auto-populates 80+ songs with high-res album covers
│   └── smoke-mongo.mjs     # MongoDB verification helper
│
└── package.json            # Main workspace setup (concurrent scripts)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- Make sure [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) are installed and running locally on your system.

### 🔧 Installation & Setup

1. **Install workspace dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `server` folder:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/wave
   JWT_SECRET=your-secure-development-secret-key-goes-here
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. **Seed the database**:
   Run the automatic seeder script to populate your database with 80+ Bollywood, Punjabi, and pop hits (along with verified high-res iTunes album art):
   ```bash
   npm run seed:songs
   ```

4. **Run the application**:
   Starts both the React front-end and Express back-end concurrently:
   ```bash
   npm run dev
   ```

---

## ⚡ Developer Scripts

All commands can be run from the root workspace directory:
- `npm run dev`: Launch client and server concurrently.
- `npm run dev:client`: Launch client server on `http://localhost:5173`.
- `npm run dev:server`: Launch Express API server on `http://localhost:5001`.
- `npm run seed:songs`: Seeds/updates tracks into MongoDB.
- `npm run build`: Compile Vite production build for the client.
- `npm run smoke:mongo`: Checks MongoDB health.
