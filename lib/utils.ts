import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Interface for solar ROI calculation inputs
 */
export interface SolarROIInputs {
  /** Roof area available for solar panels in square meters */
  roofArea: number
  /** Panel efficiency as a decimal (e.g., 0.20 for 20%) */
  panelEfficiency: number
  /** Average solar irradiance in kWh/m²/day for Malaysia (typically 4.5-5.5) */
  solarIrradiance: number
  /** Shading factor as a decimal (e.g., 0.9 means 10% shading, 90% unshaded) */
  shadingFactor: number
  /** Electricity rate in MYR per kWh (Malaysia average: 0.30-0.50 MYR/kWh) */
  electricityRate: number
  /** Total system installation cost in MYR */
  systemCost: number
  /** Optional: Monthly electricity consumption in kWh (limits savings if provided) */
  monthlyConsumption?: number
}

/**
 * Interface for solar ROI calculation results
 */
export interface SolarROIResults {
  /** Daily energy generation in kWh/day */
  dailyGeneration: number
  /** Monthly energy generation in kWh */
  monthlyGeneration: number
  /** Monthly savings in MYR (limited by consumption if provided) */
  monthlySavings: number
  /** Annual savings in MYR */
  annualSavings: number
  /** Payback period in years */
  paybackPeriod: number
  /** ROI percentage per year */
  roiPercentage: number
}

/**
 * Calculates ROI and payback period for a residential solar panel system in Malaysia.
 * 
 * This function performs comprehensive calculations including:
 * - Daily and monthly energy generation accounting for shading
 * - Monthly and annual savings based on electricity rates
 * - Payback period (time to recover initial investment)
 * - ROI percentage per year
 * 
 * @param inputs - Object containing all required input parameters
 * @returns Object containing all calculated metrics
 * 
 * @example
 * ```typescript
 * const results = calculateSolarROI({
 *   roofArea: 50,
 *   panelEfficiency: 0.20,
 *   solarIrradiance: 5.0,
 *   shadingFactor: 0.9,
 *   electricityRate: 0.40,
 *   systemCost: 30000,
 *   monthlyConsumption: 400
 * });
 * ```
 */
export function calculateSolarROI(inputs: SolarROIInputs): SolarROIResults {
  const {
    roofArea,
    panelEfficiency,
    solarIrradiance,
    shadingFactor,
    electricityRate,
    systemCost,
    monthlyConsumption,
  } = inputs

  // Step 1: Calculate daily energy generation (kWh/day)
  // Formula: roofArea × panelEfficiency × solarIrradiance × shadingFactor
  // This accounts for the physical area, panel efficiency, available sunlight, and shading losses
  const dailyGeneration = roofArea * panelEfficiency * solarIrradiance * shadingFactor

  // Step 2: Calculate monthly energy generation (kWh)
  // Using average of 30.44 days per month (365.25 / 12) for accuracy
  const averageDaysPerMonth = 30.44
  const monthlyGeneration = dailyGeneration * averageDaysPerMonth

  // Step 3: Calculate monthly savings (MYR)
  // If monthlyConsumption is provided, limit savings to actual consumption
  // (you can't save more than what you would have consumed)
  // Otherwise, use full monthly generation
  const usableMonthlyGeneration = monthlyConsumption !== undefined
    ? Math.min(monthlyGeneration, monthlyConsumption)
    : monthlyGeneration

  const monthlySavings = usableMonthlyGeneration * electricityRate

  // Step 4: Calculate annual savings (MYR)
  // Simply multiply monthly savings by 12
  const annualSavings = monthlySavings * 12

  // Step 5: Calculate payback period (years)
  // Payback period = Initial investment / Annual savings
  // This represents how many years it takes to recover the initial cost
  const paybackPeriod = annualSavings > 0 
    ? systemCost / annualSavings 
    : Infinity // If no savings, payback is never

  // Step 6: Calculate ROI percentage per year
  // ROI = (Annual savings / Initial investment) × 100
  // This represents the annual return on investment as a percentage
  const roiPercentage = systemCost > 0 
    ? (annualSavings / systemCost) * 100 
    : 0 // If no cost, ROI is undefined (set to 0)

  return {
    dailyGeneration: Math.round(dailyGeneration * 100) / 100, // Round to 2 decimal places
    monthlyGeneration: Math.round(monthlyGeneration * 100) / 100,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    paybackPeriod: Math.round(paybackPeriod * 100) / 100,
    roiPercentage: Math.round(roiPercentage * 100) / 100,
  }
}

