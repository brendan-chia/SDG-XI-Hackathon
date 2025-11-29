// Mock data generator for solar potential results
import { calculateSolarROI, type SolarROIResults } from "./utils"

export interface SolarResult {
  roofOrientation: string
  shadingPercentage: number
  monthlyGeneration: {
    month: string
    kwh: number
  }[]
  estimatedSavings: {
    monthly: number
    yearly: number
    lifetime: number
  }
  roofArea: number
  systemSize: number
  paybackPeriod: number
  roiResults?: SolarROIResults
  systemCost?: number
}

const orientations = ["South", "South-East", "South-West", "East", "West", "North"]
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function generateMockResults(): SolarResult {
  // Generate random but realistic mock data
  const orientation = orientations[Math.floor(Math.random() * orientations.length)]
  const shadingPercentage = Math.floor(Math.random() * 30) // 0-30% shading
  const roofArea = Math.floor(Math.random() * 200) + 100 // 100-300 sq ft
  const systemSize = Math.floor(roofArea * 0.15) // ~15% of roof area
  
  // Generate monthly generation (higher in summer months)
  const monthlyGeneration = months.map((month, index) => {
    const baseGeneration = systemSize * 0.8 // Base kWh per kW
    const seasonalMultiplier = 1 + 0.5 * Math.sin((index - 2) * Math.PI / 6) // Peak in summer
    const shadingFactor = (100 - shadingPercentage) / 100
    const orientationFactor = orientation === "South" ? 1.0 : 
                             orientation.includes("South") ? 0.9 : 
                             orientation === "East" || orientation === "West" ? 0.8 : 0.6
    
    return {
      month,
      kwh: Math.round(baseGeneration * seasonalMultiplier * shadingFactor * orientationFactor)
    }
  })
  
  const yearlyGeneration = monthlyGeneration.reduce((sum, m) => sum + m.kwh, 0)
  const savingsRate = 0.35 // MYR per kWh equivalent to highlight better value
  const monthlySavings = Math.max(400, Math.round((yearlyGeneration / 12) * savingsRate))
  const yearlySavings = monthlySavings * 12
  const lifetimeSavings = yearlySavings * 25 // 25 year system lifetime
  const baseSystemCost = systemSize * 1800 + 5000
  const systemCost = Math.max(15000, Math.round(baseSystemCost))
  const paybackPeriod = Math.max(2, Math.round(systemCost / yearlySavings))

  // Calculate ROI using the actual calculation function
  // Convert roof area from sq ft to sq meters (1 sq ft = 0.092903 sq m)
  const roofAreaSqM = roofArea * 0.092903
  // Average solar irradiance for Malaysia: 4.5-5.5 kWh/m²/day
  const solarIrradiance = 5.0
  // Panel efficiency: typically 18-22% for residential
  const panelEfficiency = 0.20
  // Shading factor: convert percentage to decimal
  const shadingFactor = (100 - shadingPercentage) / 100
  // Electricity rate in Malaysia: typically 0.30-0.50 MYR/kWh
  const electricityRate = 0.40
  // Average monthly consumption (optional)
  const monthlyConsumption = yearlyGeneration / 12

  const roiResults = calculateSolarROI({
    roofArea: roofAreaSqM,
    panelEfficiency,
    solarIrradiance,
    shadingFactor,
    electricityRate,
    systemCost,
    monthlyConsumption,
  })
  
  return {
    roofOrientation: orientation,
    shadingPercentage,
    monthlyGeneration,
    estimatedSavings: {
      monthly: monthlySavings,
      yearly: yearlySavings,
      lifetime: lifetimeSavings
    },
    roofArea,
    systemSize,
    paybackPeriod,
    roiResults,
    systemCost
  }
}

