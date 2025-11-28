# Solar Potential Estimator App

A Next.js prototype application for estimating solar potential of roofs using Shadcn UI components.

## Features

- **Home Page**: Hero section with call-to-action and feature overview
- **Upload Page**: Image upload or address input for roof analysis
- **Results Page**: Mock solar potential results including:
  - Roof orientation and shading analysis
  - Monthly solar generation estimates
  - Cost savings projections
  - Payback period calculations

## Tech Stack

- Next.js 14 (Pages Router)
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Lucide React icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── components/
│   ├── ui/          # Shadcn UI components (Button, Card, Progress, Input)
│   ├── Header.tsx   # Navigation header
│   └── Footer.tsx   # Footer component
├── lib/
│   ├── utils.ts     # Utility functions (cn helper)
│   └── mockData.ts  # Mock data generator for results
├── pages/
│   ├── _app.tsx     # App wrapper with layout
│   ├── index.tsx    # Home page
│   ├── upload.tsx   # Upload/Analysis page
│   └── results.tsx  # Results display page
└── styles/
    └── globals.css  # Global styles and Tailwind directives
```

## Notes

- This is a prototype with mock data only
- No actual solar calculations are performed
- Results are randomly generated for demonstration purposes
- Image uploads are stored in browser memory only (not persisted)

