// Example usage of the Roof Area Calculator
// This file demonstrates how to use the new features

import RoofDrawingMap from '@/components/RoofDrawingMap'

// Basic usage in your component
function MyComponent() {
  const [roofArea, setRoofArea] = useState<number | null>(null)
  const coordinates = { lat: 3.139, lng: 101.6869 } // Kuala Lumpur

  return (
    <RoofDrawingMap
      coordinates={coordinates}
      address="123 Main St, Kuala Lumpur"
      useCurrentLocation={false}
      onAreaCalculated={(area) => {
        console.log('Roof area calculated:', area, 'm²')
        setRoofArea(area)
        
        // You can now use this area for further calculations
        const estimatedPanels = Math.floor((area * 0.8) / 1.7)
        console.log('Estimated panels:', estimatedPanels)
      }}
    />
  )
}

// Calculating solar potential from roof area
function calculateSolarPotential(roofAreaM2: number) {
  const usableArea = roofAreaM2 * 0.8 // 80% usable
  const panelAreaM2 = 1.7 // Standard panel size
  const panelWattage = 400 // 400W panels
  const peakSunHours = 4.5 // Malaysia average
  
  const panelCount = Math.floor(usableArea / panelAreaM2)
  const systemCapacityKW = (panelCount * panelWattage) / 1000
  const dailyProductionKWh = systemCapacityKW * peakSunHours
  const annualProductionKWh = dailyProductionKWh * 365
  
  return {
    panelCount,
    systemCapacityKW,
    dailyProductionKWh,
    annualProductionKWh,
  }
}

// Example: Using with Gemini API
async function analyzeRoofWithAI(roofArea: number, coordinates: any[], address: string) {
  try {
    const response = await fetch('/api/gemini-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        area: roofArea,
        coordinates,
        address,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Analysis failed')
    }
    
    const data = await response.json()
    console.log('AI Insights:', data.insights)
    console.log('Recommendations:', data.recommendations)
    console.log('Solar Potential:', data.solarPotential)
    
    return data
  } catch (error) {
    console.error('Error analyzing roof:', error)
    return null
  }
}

// Example: Complete workflow
async function completeRoofAnalysis() {
  // 1. User draws roof and gets area
  const roofArea = 85.5 // m² from drawing
  
  // 2. Calculate basic solar potential
  const potential = calculateSolarPotential(roofArea)
  console.log('Basic calculations:', potential)
  // Output: { panelCount: 40, systemCapacityKW: 16, ... }
  
  // 3. Get AI insights
  const coordinates = [/* polygon points */]
  const insights = await analyzeRoofWithAI(roofArea, coordinates, 'Your Address')
  
  // 4. Combine results for display
  return {
    roofArea,
    ...potential,
    aiInsights: insights,
  }
}

// Environment variable setup example
/*
Create .env.local file:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your_key
NEXT_PUBLIC_GEMINI_API_KEY=AIza...your_key

The app will automatically:
- Load Google Maps with drawing tools
- Enable polygon drawing on satellite view
- Calculate area using Geometry library
- Send data to Gemini for analysis (if key provided)
*/

// Customizing the Gemini analysis prompt
// Edit pages/api/gemini-analyze.ts to customize the AI behavior
/*
const customPrompt = `
You are a solar energy expert...

Provide analysis for:
- Roof area: ${area}m²
- Custom criteria: [your requirements]
- Regional factors: [your location specifics]

Return JSON with your custom structure
`
*/
