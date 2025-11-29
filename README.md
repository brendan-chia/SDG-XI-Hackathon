# Solar Potential Estimator

![Build Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A modern web application that empowers homeowners to discover their roof's solar potential and estimate energy savings. Featuring interactive satellite maps, AI-powered analysis, and precise ROI projections tailored for the Malaysian market.

## ✨ Key Features

- **Interactive Roof Mapping** - Draw your roof outline directly on satellite imagery to get precise area calculations
- **AI-Powered Analysis** - Google Gemini integration for intelligent solar potential insights and personalized recommendations
- **ROI Calculator** - Comprehensive return on investment projections with payback period analysis
- **Bill Tracking** - Track historical electricity bills for accurate consumption estimates
- **Shade Analysis** - Identify shading patterns and roof orientation impacts
- **Environmental Impact** - View CO2 reduction and tree-equivalent offsets from your solar system
- **Multi-Panel Options** - Compare different solar panel configurations and pricing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Maps API Key (with Geocoding, Geometry Library enabled)
- Google Generative AI API Key (optional, for AI-powered insights)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/brendan-chia/SDG-XI-Hackathon.git
   cd SDG-XI-Hackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **Getting API Keys:**
   - **Google Maps API**: Visit [Google Cloud Console](https://console.cloud.google.com/), create a project, enable Maps JavaScript API, Geocoding API, and Geometry Library, then generate an API key
   - **Google Gemini API**: Get a free key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Estimating Your Solar Potential

1. **Enter Your Location**
   - Type your address or click "Use Current Location"
   - The satellite map will center on your home

2. **Draw Your Roof Area**
   - Click "Draw Roof Area" to enable drawing mode
   - Click points around your roof perimeter on the map
   - The app automatically closes the shape when complete
   - Get instant area calculations in both m² and sq ft

3. **Review Solar Analysis**
   - Estimated number of solar panels that fit your roof
   - Estimated system capacity (kW)
   - Monthly and annual energy production estimates
   - View AI-powered recommendations (if Gemini API configured)

4. **Track Your Savings**
   - Enter your monthly electricity bills (or leave for auto-estimate)
   - View annual cost savings projections
   - Calculate payback period for different panel options
   - Explore environmental impact metrics

5. **Customize Your System**
   - Compare multiple solar panel configurations
   - View different pricing scenarios
   - See long-term ROI over 25-year system lifetime

## 🏗️ Project Structure

```
.
├── components/
│   ├── ui/                       # Reusable UI components (buttons, cards, inputs)
│   ├── Header.tsx                # Navigation header with logo
│   ├── Footer.tsx                # Footer with links
│   ├── GoogleMapVisualization.tsx # Basic map display component
│   ├── RoofDrawingMap.tsx        # Interactive roof drawing and area calculation
│   └── ROIVisualization.tsx      # ROI charts and visualizations
├── lib/
│   ├── utils.ts                  # Shared utility functions
│   ├── mockData.ts               # Mock data generation for results
│   └── panelOptions.ts           # Solar panel configuration options
├── ml/
│   ├── fetch_nasa_data.py        # Fetch solar irradiance data from NASA API
│   ├── solar_forecast.py         # Time series forecasting using Prophet
│   ├── solar_irradiance.csv      # Historical solar irradiance data
│   └── solar_forecast.csv        # Forecasted solar irradiance (12 months)
├── pages/
│   ├── api/
│   │   └── gemini-analyze.ts    # AI analysis API endpoint
│   ├── index.tsx                 # Home/landing page
│   ├── upload.tsx                # Address input and roof drawing page
│   ├── results.tsx               # Solar analysis results display
│   ├── roi.tsx                   # ROI calculator and projections
│   ├── why-install.tsx           # Educational content page
│   └── _app.tsx                  # Next.js app wrapper
├── styles/
│   └── globals.css               # Global styles and Tailwind setup
├── public/                        # Static assets
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── next.config.js                # Next.js configuration
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (Pages Router) |
| **Language** | TypeScript 5.2 |
| **Styling** | Tailwind CSS with Tailwind Merge |
| **UI Components** | Shadcn UI (Radix UI based) |
| **Icons** | Lucide React |
| **Maps** | Google Maps JavaScript API with Geometry Library |
| **AI** | Google Generative AI (Gemini) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Build Tool** | Next.js with PostCSS |

## 📋 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run ESLint
npm run lint
```

## 🔧 Configuration

### Google Maps API Setup

Required APIs to enable in [Google Cloud Console](https://console.cloud.google.com/):
- Maps JavaScript API
- Geocoding API
- Geometry Library (included with Maps JavaScript API)

### Optional: Google Gemini AI

When configured, enables:
- AI-powered roof analysis with detailed insights
- Intelligent solar potential estimates
- Personalized system recommendations based on site conditions

Set your Gemini API key in `.env.local` to activate this feature.

## 🎯 Use Cases

- **Homeowners**: Discover if your home is suitable for solar installation
- **Solar Companies**: Provide quick preliminary assessments to potential customers
- **Researchers**: Analyze solar potential across different geographic areas
- **Educational**: Learn about solar energy and ROI calculations

## 💡 Key Technical Details

- **Roof Area Calculation**: Uses Google Maps Geometry library for pixel-perfect measurements
- **Coordinates**: WGS84 (EPSG:4326) latitude/longitude format
- **Currency**: Malaysian Ringgit (MYR) - easily customizable in code
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Type Safety**: Full TypeScript support throughout codebase

## 📊 Machine Learning & Data Science

The `ml/` folder contains Python scripts for solar irradiance forecasting and analysis:

- **`fetch_nasa_data.py`** - Fetches historical solar irradiance data from NASA's POWER API for any geographic location
- **`solar_forecast.py`** - Uses Facebook's Prophet library to forecast solar irradiance for the next 12 months based on historical patterns
- **`solar_irradiance.csv`** - Historical daily solar irradiance measurements (MJ/m²/day)
- **`solar_forecast.csv`** - 12-month solar irradiance forecast with confidence intervals

### Using the ML Scripts

```bash
# Install Python dependencies
pip install requests pandas prophet matplotlib

# Fetch historical data for your location
python ml/fetch_nasa_data.py

# Generate 12-month forecast
python ml/solar_forecast.py
```

The forecasted data can be integrated into the application to provide more accurate long-term solar production estimates.

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support & Resources

- **Documentation**: Check individual component files for inline documentation
- **Examples**: See [USAGE_EXAMPLES.tsx](./USAGE_EXAMPLES.tsx) for code samples
- **Issues**: Report bugs and feature requests on [GitHub Issues](https://github.com/brendan-chia/SDG-XI-Hackathon/issues)

## 🌍 Supported Regions

Currently optimized for Malaysia with MYR currency and Malaysian-specific solar calculations. The codebase is structured for easy localization to other regions.

## 🎉 Acknowledgments

- Built for the SDG-XI Hackathon
- Solar data calculations based on Malaysian solar irradiance standards
- Environmental impact metrics based on Malaysia's national grid carbon intensity
- UI components built with Shadcn UI and Radix UI

---

**Questions?** Open an issue or contact the maintainers. We'd love to hear your feedback!
