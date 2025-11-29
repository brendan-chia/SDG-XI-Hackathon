import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { calculateSolarROI, type SolarROIResults } from "@/lib/utils"
import ROIVisualization from "@/components/ROIVisualization"
import { Calculator, Home } from "lucide-react"
import { useRouter } from "next/router"

export default function ROICalculator() {
  const router = useRouter()
  const [inputs, setInputs] = useState({
    roofArea: "50", // square meters
    panelEfficiency: "0.20", // 20%
    solarIrradiance: "5.0", // kWh/m²/day (Malaysia average)
    electricityRate: "0.40", // MYR/kWh
    systemCost: "30000", // MYR
    monthlyConsumption: "", // Optional
  })

  const [roiResults, setRoiResults] = useState<SolarROIResults | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCalculate = () => {
    const parsedInputs = {
      roofArea: parseFloat(inputs.roofArea) || 0,
      panelEfficiency: parseFloat(inputs.panelEfficiency) || 0,
      solarIrradiance: parseFloat(inputs.solarIrradiance) || 0,
      electricityRate: parseFloat(inputs.electricityRate) || 0,
      systemCost: parseFloat(inputs.systemCost) || 0,
      monthlyConsumption: inputs.monthlyConsumption
        ? parseFloat(inputs.monthlyConsumption)
        : undefined,
    }

    // Validate inputs
    if (
      parsedInputs.roofArea <= 0 ||
      parsedInputs.panelEfficiency <= 0 ||
      parsedInputs.solarIrradiance <= 0 ||
      parsedInputs.electricityRate <= 0 ||
      parsedInputs.systemCost <= 0
    ) {
      alert("Please fill in all required fields with valid positive numbers")
      return
    }

    if (parsedInputs.panelEfficiency > 1) {
      alert("Panel efficiency should be a decimal (e.g., 0.20 for 20%)")
      return
    }

    const results = calculateSolarROI(parsedInputs)
    setRoiResults(results)
    setHasCalculated(true)
  }

  const handleReset = () => {
    setRoiResults(null)
    setHasCalculated(false)
    setInputs({
      roofArea: "50",
      panelEfficiency: "0.20",
      solarIrradiance: "5.0",
      electricityRate: "0.40",
      systemCost: "30000",
      monthlyConsumption: "",
    })
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8" />
            Solar ROI Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate the return on investment and payback period for your residential solar panel system in Malaysia
          </p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>System Parameters</CardTitle>
            <CardDescription>
              Enter your solar system details to calculate ROI and payback period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="roofArea" className="text-sm font-medium">
                  Roof Area (m²) *
                </label>
                <Input
                  id="roofArea"
                  type="number"
                  step="0.1"
                  value={inputs.roofArea}
                  onChange={(e) => handleInputChange("roofArea", e.target.value)}
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">
                  Available roof area for solar panels
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="panelEfficiency" className="text-sm font-medium">
                  Panel Efficiency (decimal) *
                </label>
                <Input
                  id="panelEfficiency"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.panelEfficiency}
                  onChange={(e) => handleInputChange("panelEfficiency", e.target.value)}
                  placeholder="0.20"
                />
                <p className="text-xs text-muted-foreground">
                  e.g., 0.20 for 20% efficiency
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="solarIrradiance" className="text-sm font-medium">
                  Solar Irradiance (kWh/m²/day) *
                </label>
                <Input
                  id="solarIrradiance"
                  type="number"
                  step="0.1"
                  value={inputs.solarIrradiance}
                  onChange={(e) => handleInputChange("solarIrradiance", e.target.value)}
                  placeholder="5.0"
                />
                <p className="text-xs text-muted-foreground">
                  Malaysia average: 4.5-5.5
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="electricityRate" className="text-sm font-medium">
                  Electricity Rate (MYR/kWh) *
                </label>
                <Input
                  id="electricityRate"
                  type="number"
                  step="0.01"
                  value={inputs.electricityRate}
                  onChange={(e) => handleInputChange("electricityRate", e.target.value)}
                  placeholder="0.40"
                />
                <p className="text-xs text-muted-foreground">
                  Malaysia average: 0.30-0.50 MYR/kWh
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="systemCost" className="text-sm font-medium">
                  System Cost (MYR) *
                </label>
                <Input
                  id="systemCost"
                  type="number"
                  step="100"
                  value={inputs.systemCost}
                  onChange={(e) => handleInputChange("systemCost", e.target.value)}
                  placeholder="30000"
                />
                <p className="text-xs text-muted-foreground">
                  Total installation cost
                </p>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label htmlFor="monthlyConsumption" className="text-sm font-medium">
                  Monthly Consumption (kWh) - Optional
                </label>
                <Input
                  id="monthlyConsumption"
                  type="number"
                  step="1"
                  value={inputs.monthlyConsumption}
                  onChange={(e) => handleInputChange("monthlyConsumption", e.target.value)}
                  placeholder="400"
                />
                <p className="text-xs text-muted-foreground">
                  If provided, savings will be limited to actual consumption
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button onClick={handleCalculate} size="lg" className="px-8">
                Calculate ROI
              </Button>
              {hasCalculated && (
                <Button onClick={handleReset} variant="outline" size="lg" className="px-8">
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {roiResults && (
          <div className="space-y-6">
            {/* Quick Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Daily Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {roiResults.dailyGeneration.toFixed(2)} kWh/day
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {roiResults.monthlyGeneration.toFixed(2)} kWh
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    RM{roiResults.monthlySavings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    RM{roiResults.annualSavings.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Visualizations */}
            <ROIVisualization
              roiResults={roiResults}
              systemCost={parseFloat(inputs.systemCost)}
              lifetimeYears={25}
            />
          </div>
        )}

        {/* Info Section */}
        {!hasCalculated && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use This Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Understanding the Parameters:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>
                    <strong>Roof Area:</strong> The total area available for solar panels in square meters
                  </li>
                  <li>
                    <strong>Panel Efficiency:</strong> The percentage of sunlight converted to electricity (typically 18-22% for residential panels)
                  </li>
                  <li>
                    <strong>Solar Irradiance:</strong> Average daily solar energy per square meter. Malaysia typically receives 4.5-5.5 kWh/m²/day
                  </li>
                  <li>
                    <strong>Electricity Rate:</strong> Your current electricity cost per kWh in Malaysian Ringgit
                  </li>
                  <li>
                    <strong>System Cost:</strong> Total upfront cost including panels, inverter, installation, etc.
                  </li>
                  <li>
                    <strong>Monthly Consumption:</strong> (Optional) Your average monthly electricity usage. If provided, savings are capped at this amount
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What You&apos;ll Get:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Daily and monthly energy generation estimates</li>
                  <li>Monthly and annual savings calculations</li>
                  <li>Payback period (years to recover investment)</li>
                  <li>ROI percentage per year</li>
                  <li>Visual charts showing cumulative savings over time</li>
                  <li>Cost vs savings comparison</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

