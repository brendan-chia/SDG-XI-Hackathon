# Solar Potential Estimator App

A Next.js prototype application for estimating solar potential of roofs using Shadcn UI components, Google Maps integration, and AI-powered analysis via Google Gemini.

## Features

- **Home Page**: Hero section with call-to-action and feature overview
- **Upload Page**: 
  - Address input with geocoding and current location support
  - Interactive Google Maps with satellite view
  - **NEW: Draw and calculate roof area** - Circle your roof to get precise measurements
  - Bill history tracking for accurate ROI calculations
- **Results Page**: Mock solar potential results including:
  - Roof orientation and shading analysis
  - Monthly solar generation estimates
  - Cost savings projections
  - Payback period calculations
- **ROI Calculator**: Interactive return on investment analysis
- **AI-Powered Insights**: Google Gemini integration for intelligent roof analysis

## New: Roof Area Calculator 🏠

Draw your roof outline directly on the satellite map and get:
- ✅ Precise area calculations (m² and sq ft)
- ✅ AI-powered solar potential analysis
- ✅ Estimated panel count and system capacity
- ✅ Annual energy production estimates
- ✅ Personalized recommendations

[See ROOF_CALCULATOR_GUIDE.md for detailed instructions](./ROOF_CALCULATOR_GUIDE.md)

## Tech Stack

- Next.js 14 (Pages Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Lucide React icons
- Google Maps JavaScript API with Geometry library
- Google Gemini AI API
- @google/generative-ai SDK

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key  # Optional
```

**Get API Keys:**
- Google Maps API: [Google Cloud Console](https://console.cloud.google.com/)
- Gemini API: [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── components/
│   ├── ui/                      # Shadcn UI components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Footer component
│   ├── GoogleMapVisualization.tsx  # Basic map preview
│   ├── RoofDrawingMap.tsx       # NEW: Interactive roof drawing
│   └── ROIVisualization.tsx     # ROI calculations
├── lib/
│   ├── utils.ts                 # Utility functions
│   ├── mockData.ts              # Mock data generator
│   └── panelOptions.ts          # Solar panel configurations
├── pages/
│   ├── api/
│   │   └── gemini-analyze.ts   # NEW: Gemini AI API endpoint
│   ├── _app.tsx                 # App wrapper
│   ├── index.tsx                # Home page
│   ├── upload.tsx               # Upload & roof drawing page
│   ├── results.tsx              # Results display
│   └── roi.tsx                  # ROI calculator
└── styles/
    └── globals.css              # Global styles
```

## How to Use the Roof Area Calculator

1. **Navigate to Upload Page** - Enter your address or use current location
2. **Switch to Drawing Mode** - Click "Draw Roof Area" button
3. **Draw Your Roof** - Click points around your roof perimeter
4. **Calculate Area** - Get precise measurements and AI insights
5. **Analyze** - Proceed with full solar potential analysis

See [ROOF_CALCULATOR_GUIDE.md](./ROOF_CALCULATOR_GUIDE.md) for detailed instructions.

## API Configuration

### Google Maps API
Required APIs to enable:
- Maps JavaScript API
- Geocoding API  
- Geometry Library

### Google Gemini API
Optional but recommended for:
- AI-powered roof analysis
- Solar potential estimates
- Personalized recommendations

## Notes

- Roof area calculations use Google Maps Geometry for precision
- Gemini API integration provides intelligent insights
- Bill tracking helps generate accurate ROI projections
- Drawing feature works best with clear satellite imagery

