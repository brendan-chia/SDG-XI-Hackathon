// Mock data generator for solar potential results

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
  const monthlySavings = Math.round(yearlyGeneration / 12 * 0.12) // $0.12 per kWh average
  const yearlySavings = monthlySavings * 12
  const lifetimeSavings = yearlySavings * 25 // 25 year system lifetime
  
  const systemCost = systemSize * 3000 // $3000 per kW
  const paybackPeriod = Math.round(systemCost / yearlySavings)
  
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
    paybackPeriod
  }
}

