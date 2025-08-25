# [canvas] - interactive creation

A Next.js 14 web application for creating unique generative artworks through parameter-driven algorithms. Built with Steve Jobs' minimal design philosophy and full responsive support.

## Features

### **🎨 Core Generation**
- **Three Pattern Types**: Linear (vertical rhythm), Texture (ASCII-like organic), Geometric (radial polygons)
- **Text-to-Binary Art**: Convert words/sentences to binary data that directly influences artwork generation
- **Real-time Generation**: Instant visual updates as parameters change
- **SHA256 Signatures**: Unique hash identifiers for each generated artwork

### **🎵 Audio-Visual Integration**
- **Web Audio API**: Real-time frequency analysis of uploaded audio files
- **Audio Reactivity**: Bass drives density, treble affects positioning, beats create bursts
- **Progressive Audio**: Upload and playback controls with visual feedback

### **⚡ Advanced Interactions**
- **Keyboard Shortcuts**: Power-user controls (1-3 for patterns, Q/W/E for colors, R/Space to regenerate)
- **Mouse Velocity**: Canvas scaling effects based on cursor movement
- **Double-click Regeneration**: Instant new variations with mouse/touch
- **Movement Toggle**: Flowing animations with Perlin noise

### **🎯 User Experience**
- **Dual Themes**: Pure white and deep black themes with smooth transitions
- **Responsive Design**: Optimized layouts for desktop and mobile devices
- **Local Storage**: Save parameter presets and auto-restore last settings
- **URL Sharing**: Shareable links with compressed parameter encoding

### **📁 Export & Batch Processing**
- **Single Export**: High-resolution PNG with embedded hash and frame
- **Batch Export**: Generate multiple variations with parameter evolution
- **Temporal Evolution**: Subtle parameter changes over time for living artworks

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000`

## Design Philosophy

Built with Steve Jobs' **"Simplicity is the ultimate sophistication"** philosophy:

### **White Theme**
- Pure white background (#FFFFFF) with true black text (#000000)
- Surgical precision in spacing and typography
- Canvas gets soft shadow with subtle gray center area

### **Black Theme** 
- Deep black background (#000000) with pure white text (#FFFFFF)
- Dark gray center area with stronger shadows
- All controls adapt to dark aesthetic seamlessly

### **Typography & Layout**
- Inter font family with ultra-light weights (300)
- Desktop: 25% controls | 60% canvas | 15% audio
- Mobile: Stacked layout with canvas-first approach
- Apple-quality font smoothing and micro-interactions

### **Progressive Disclosure**
- Audio controls hidden until needed
- Export appears on hover (desktop) or always visible (mobile)
- Theme switchers as minimal dots in corner
- No unnecessary labels - interactions speak for themselves

## Technical Stack

- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- Canvas API for rendering
- Web Audio API for sound analysis
- Crypto API for SHA256 generation

## Architecture

```
/app
  page.tsx              # Main interface with three-panel layout
/components
  Canvas.tsx            # Art generation canvas with export
  ParameterControls.tsx # Left panel parameter controls
  AudioControls.tsx     # Right panel audio upload/playback
/lib
  generators.ts         # Pattern generation algorithms
  crypto.ts            # SHA256 hash generation utilities
```

## Usage

### **Desktop Experience**
1. **Select Pattern**: Click Linear, Texture, or Geometric in left panel
2. **Adjust Complexity**: Drag minimal slider - shows "minimal", "balanced", "complex"
3. **Choose Colors**: Click mono, gray, or color options  
4. **Theme Switch**: Click white or black dots in top-right corner
5. **Export**: Hover canvas and click "save" button
6. **Audio**: Click "+ audio" when ready to add sound

### **Mobile Experience**
1. **Canvas First**: Large artwork display takes center stage
2. **Controls Below**: All parameters in bottom sheet
3. **Theme Dots**: Available in header area
4. **Always-Visible Export**: "save" button always shown below canvas
5. **Touch Interactions**: Double-tap to regenerate new variations

### **Universal Interactions**
- **Double-click/tap**: Regenerate with new random seed
- **Text Input**: Type any word/sentence - converted to binary and integrated into art
- **SHA256 Hash**: Displayed in bottom-left corner (8 characters)
- **Real-time Updates**: All parameter changes instantly reflected
- **Mouse Velocity**: Subtle canvas scaling effect on desktop

### **Text-to-Binary Integration**
- **Linear Pattern**: Binary 1s create denser dot areas, 0s create sparse regions
- **Texture Pattern**: Actual binary digits (0s and 1s) appear in the ASCII art
- **Geometric Pattern**: 1s create complex polygons, 0s create simpler shapes
- **Bit Counter**: Shows total bits generated from your text (8 bits per character)
- **Enhanced Seeding**: Text influences the random seed for unique variations

### **Audio-Visual Mapping**
- **Linear Pattern**: Bass → dot density, treble → vertical distribution, beats → burst effects
- **Texture Pattern**: Frequency bands influence character placement and line complexity
- **Geometric Pattern**: Audio drives polygon count, size, and radial positioning
- **Real-time Analysis**: 60fps frequency data with smoothing and beat detection

### **Keyboard Shortcuts**
```
1, 2, 3     → Pattern types (Linear, Texture, Geometric)
Q, W, E     → Color schemes (Mono, Grayscale, Accent)
R, Space    → Regenerate artwork
M           → Toggle movement/animation
S           → Save/Export current artwork
↑, ↓        → Adjust complexity
```

### **Advanced Features**
- **Parameter Presets**: Save and load favorite configurations
- **URL Sharing**: `?share=xyz` - compressed parameter encoding
- **Batch Export**: Generate 5-100 variations automatically
- **Temporal Evolution**: Artworks slowly evolve over time
- **Local Storage**: Automatic session restoration

## Pattern Types

### Linear
Vertical lines with varying dot densities, creating rhythmic data visualization patterns.

### Texture  
ASCII-like character patterns forming organic shapes and textures.

### Geometric
Polygon arrangements in radial/mandala patterns with connecting lines.

Each pattern type uses seeded random generation for consistent, reproducible results.

## Development

```bash
npm run dev     # Development server
npm run build   # Production build  
npm run start   # Production server
npm run lint    # ESLint checking
```