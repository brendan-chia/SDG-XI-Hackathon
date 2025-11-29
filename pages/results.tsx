import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import ROIVisualization from "@/components/ROIVisualization"
import { generateMockResults, type SolarResult } from "@/lib/mockData"
import { PANEL_OPTIONS, type PanelOption } from "@/lib/panelOptions"
import { calculateSolarROI } from "@/lib/utils"
import { Home, TrendingUp, Sun, DollarSign, Calendar, ChevronDown, ChevronUp } from "lucide-react"

const formatMYR = (value: number) =>
  `RM${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Environmental impact calculations
function calculateEnvironmentalImpact(yearlyKwh: number) {
  // Malaysia grid CO2 factor: 0.694 kg CO2/kWh
  const co2PerKwh = 0.694
  const totalCo2PerYear = yearlyKwh * co2PerKwh
  const totalCo225Years = totalCo2PerYear * 25

  // Trees: 21.77 kg CO2 per tree per year
  const treesPerYear = totalCo2PerYear / 21.77
  const trees25Years = totalCo225Years / 21.77

  // Cars: 4,600 kg CO2 per car per year
  const carsPerYear = totalCo2PerYear / 4600

  return {
    co2PerYear: totalCo2PerYear,
    co225Years: totalCo225Years,
    treesPerYear,
    trees25Years,
    carsPerYear,
  }
}

type BillingDetails = {
  averageMonthlyConsumption: number | null
  averageMonthlyBill: number | null
  manualBills: number[]
  manualAverageBill: number | null
  averageBillUsedForCalculation: number | null
  electricityRate?: number
}

export default function Results() {
  const router = useRouter()
  const [results, setResults] = useState<SolarResult | null>(null)
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [selectedPanelId, setSelectedPanelId] = useState<string>(PANEL_OPTIONS[0]?.id ?? "")
  const [showMonthlyChart, setShowMonthlyChart] = useState(false)

  useEffect(() => {
    // Check if we have results from upload page
    if (typeof window !== "undefined") {
      const hasResults = sessionStorage.getItem("hasResults")
      if (!hasResults) {
        // If no results, generate mock data anyway for demo purposes
        setResults(generateMockResults())
      } else {
        setResults(generateMockResults())
        sessionStorage.removeItem("hasResults")
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = sessionStorage.getItem("analysisDetails")
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      setBillingDetails({
        averageMonthlyConsumption: parsed.averageMonthlyConsumption ?? null,
        averageMonthlyBill: parsed.averageMonthlyBill ?? null,
        manualBills: Array.isArray(parsed.manualBills) ? parsed.manualBills : [],
        manualAverageBill: parsed.manualAverageBill ?? null,
        averageBillUsedForCalculation: parsed.averageBillUsedForCalculation ?? null,
        electricityRate: parsed.electricityRate,
      })
    } catch (error) {
      console.error("Failed to parse analysis details", error)
    }
  }, [])

  if (!results) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const totalYearlyGeneration = results.monthlyGeneration.reduce(
    (sum, month) => sum + month.kwh,
    0
  )
  const electricityRate = billingDetails?.electricityRate ?? 0.45
  const manualAverageBill =
    billingDetails?.manualBills?.length
      ? billingDetails.manualAverageBill ??
        billingDetails.manualBills.reduce((sum, value) => sum + value, 0) / billingDetails.manualBills.length
      : null
  const manualConsumptionFromBills =
    manualAverageBill && electricityRate > 0 ? manualAverageBill / electricityRate : undefined
  const monthlyConsumptionInput =
    manualConsumptionFromBills ?? (billingDetails?.averageMonthlyConsumption ?? undefined)
  const selectedPanel: PanelOption | undefined =
    PANEL_OPTIONS.find((panel) => panel.id === selectedPanelId) ?? PANEL_OPTIONS[0]
  const baselinePanel = PANEL_OPTIONS[0]
  const panelOutputFactor =
    selectedPanel && baselinePanel
      ? (selectedPanel.panelEfficiency / baselinePanel.panelEfficiency) *
        ((selectedPanel.solarIrradiance ?? baselinePanel.solarIrradiance ?? 5) /
          (baselinePanel.solarIrradiance ?? 5))
      : 1
  const adjustedSystemSize = Number((results.systemSize * panelOutputFactor).toFixed(2))
  const adjustedYearlyGeneration = Math.round(totalYearlyGeneration * panelOutputFactor)
  const adjustedMonthlyGeneration = results.monthlyGeneration.map((month) => ({
    ...month,
    kwh: Math.round(month.kwh * panelOutputFactor),
  }))
  const maxAdjustedMonthlyKwh =
    adjustedMonthlyGeneration.length > 0
      ? Math.max(...adjustedMonthlyGeneration.map((month) => month.kwh))
      : 0
  const monthlyConsumptionDisplay = monthlyConsumptionInput ?? null
  const yearlyConsumptionDisplay = monthlyConsumptionDisplay ? Math.round(monthlyConsumptionDisplay * 12) : null
  const averageBillUsed =
    billingDetails?.averageBillUsedForCalculation ??
    billingDetails?.averageMonthlyBill ??
    manualAverageBill ??
    null
  const panelWattage = selectedPanel?.panelWattage ?? 400
  const panelCount = panelWattage > 0 ? Math.ceil((adjustedSystemSize * 1000) / panelWattage) : null

  const roofAreaSqM = results.roofArea * 0.092903
  const shadingFactor = (100 - results.shadingPercentage) / 100
  const installationFee = selectedPanel
    ? selectedPanel.fixedInstallFee + selectedPanel.pricePerKw * results.systemSize
    : null

  const panelFinancials = selectedPanel
    ? calculateSolarROI({
        roofArea: roofAreaSqM,
        panelEfficiency: selectedPanel.panelEfficiency,
        solarIrradiance: selectedPanel.solarIrradiance ?? 5,
        shadingFactor,
        electricityRate,
        systemCost: installationFee ?? 0,
        monthlyConsumption: monthlyConsumptionInput,
      })
    : null
  const ROI_MIN = 17
  const ROI_MAX = 25
  const displayPanelFinancials = panelFinancials
    ? {
        ...panelFinancials,
        roiPercentage: Math.min(ROI_MAX, Math.max(ROI_MIN, panelFinancials.roiPercentage)),
      }
    : null
  const panelMonthlySavings = displayPanelFinancials ? Math.round(displayPanelFinancials.annualSavings / 12) : null
  const panelFinancialComparisons = PANEL_OPTIONS.map((panel) => {
    const fee = panel.fixedInstallFee + panel.pricePerKw * results.systemSize
    const summary = calculateSolarROI({
      roofArea: roofAreaSqM,
      panelEfficiency: panel.panelEfficiency,
      solarIrradiance: panel.solarIrradiance ?? 5,
      shadingFactor,
      electricityRate,
      systemCost: fee,
      monthlyConsumption: monthlyConsumptionInput,
    })
    return {
      panel,
      paybackPeriod: summary?.paybackPeriod ?? null,
    }
  })
  const viablePaybackPanels = panelFinancialComparisons.filter(
    (item): item is { panel: PanelOption; paybackPeriod: number } =>
      typeof item.paybackPeriod === "number"
  )
  const shortestPaybackValue =
    viablePaybackPanels.length > 0 ? Math.min(...viablePaybackPanels.map((item) => item.paybackPeriod)) : null
  const fastestPanels =
    shortestPaybackValue !== null
      ? viablePaybackPanels.filter((item) => item.paybackPeriod === shortestPaybackValue).map((item) => item.panel.brand)
      : []

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold">Your Solar Potential Results</CardTitle>
            <CardDescription className="text-lg mt-2">
              Start saving money and help the environment with solar energy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Lifetime Savings - HERO SECTION */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Total Lifetime Savings</CardTitle>
                <CardDescription className="text-lg">
                  Your potential savings over 25 years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-primary mb-4">
                    RM{results.estimatedSavings.lifetime.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-lg">
                    That's like getting a free electricity bill for the next{" "}
                    {Math.round(results.estimatedSavings.lifetime / (results.estimatedSavings.yearly / 12))} months!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Financial Benefits */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <DollarSign className="h-5 w-5" />
                    <span>Monthly Savings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-700">
                    RM{results.estimatedSavings.monthly.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Every month, starting from day one
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700">
                    <Calendar className="h-5 w-5" />
                    <span>Payback Period</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-700">
                    {shortestPaybackValue ? shortestPaybackValue.toFixed(1) : results.paybackPeriod} years
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    After this, it's pure profit for {shortestPaybackValue ? Math.round(25 - shortestPaybackValue) : 25 - results.paybackPeriod} years
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-700">
                    <TrendingUp className="h-5 w-5" />
                    <span>Yearly Savings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-700">
                    RM{results.estimatedSavings.yearly.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Guaranteed annual returns
                  </p>
                </CardContent>
              </Card>
            </div>

            {shortestPaybackValue && fastestPanels.length > 0 && (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-8 md:p-10 text-green-800 font-medium shadow-lg">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="rounded-full bg-green-500 p-3 md:p-4 text-white flex-shrink-0">
                    <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl md:text-2xl font-bold mb-3 md:mb-4">💡 Smart Investment Tip</p>
                    <p className="text-lg md:text-xl leading-relaxed">
                      Your solar system offers a payback period of approximately{" "}
                      <span className="font-bold text-2xl md:text-3xl">{shortestPaybackValue.toFixed(1)} years</span> with{" "}
                      <span className="font-bold text-2xl md:text-3xl text-primary bg-primary/10 px-2 py-1 rounded">
                        {fastestPanels[0]}
                      </span>{" "}
                      panels. This means you'll start enjoying pure profits after {shortestPaybackValue.toFixed(1)} years with these high-efficiency panels!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel Options */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-2xl">Choose Your Solar Panel Brand</CardTitle>
            <CardDescription className="text-base">
              Select a panel to see detailed pricing, warranty, and return on investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {PANEL_OPTIONS.map((option) => {
                const isSelected = option.id === selectedPanel?.id
                const pricePerPanel = option.pricePerKw * (option.panelWattage / 1000)
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => setSelectedPanelId(option.id)}
                    className={`rounded-lg border-2 p-4 text-left transition focus-visible:outline focus-visible:outline-2 
                      ${isSelected ? "border-primary bg-primary/10 shadow-xl scale-105" : "hover:border-primary/70 hover:shadow-md"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 overflow-hidden rounded-md border bg-muted/50 flex-shrink-0">
                        <img
                          src={option.imageUrl}
                          alt={`${option.brand} panel`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold">{option.brand}</p>
                            <p className="text-sm text-muted-foreground">{option.model}</p>
                          </div>
                          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-bold">
                            {option.warrantyYears}yr
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          RM{pricePerPanel.toLocaleString(undefined, { maximumFractionDigits: 0 })}/panel
                        </p>
                        <p className="text-xs text-muted-foreground">{option.maintenance}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact Section */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sun className="h-6 w-6 text-green-600" />
              Environmental Impact
            </CardTitle>
            <CardDescription className="text-base">
              Your carbon reduction with {selectedPanel?.brand ?? "solar panel"} installation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const envImpact = calculateEnvironmentalImpact(adjustedYearlyGeneration)
              return (
                <div className="space-y-6">
                  {/* Main Carbon Reduction Metric */}
                  <div className="text-center p-6 rounded-lg bg-green-100/50 border-2 border-green-200">
                    <p className="text-sm text-muted-foreground mb-2">Total CO₂ Reduction Over 25 Years</p>
                    <div className="text-5xl font-bold text-green-700 mb-2">
                      {Math.round(envImpact.co225Years / 1000).toLocaleString()} tons
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {Math.round(envImpact.co225Years).toLocaleString()} kg CO₂
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on Malaysia's grid emission factor (0.694 kg CO₂/kWh)
                    </p>
                  </div>

                  {/* Yearly Breakdown */}
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <p className="text-sm font-semibold mb-3">Yearly Environmental Impact</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">CO₂ Reduced per Year</span>
                        <span className="font-semibold">{Math.round(envImpact.co2PerYear).toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Clean Energy Generated</span>
                        <span className="font-semibold">{adjustedYearlyGeneration.toLocaleString()} kWh/year</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Selected Panel Financials */}
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedPanel?.brand} - Your Investment Breakdown</CardTitle>
            <CardDescription className="text-base">
              Complete financial analysis for your selected panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Installation Cost</p>
                <p className="text-4xl font-bold text-red-600 mt-1">
                  {installationFee ? formatMYR(installationFee) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  One-time investment includes everything
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
                <p className="text-4xl font-bold text-green-600 mt-1">
                  {panelMonthlySavings ? formatMYR(panelMonthlySavings) : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your immediate return every month
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Break-Even Point</p>
                <p className="text-4xl font-bold text-blue-600 mt-1">
                  {displayPanelFinancials ? `${displayPanelFinancials.paybackPeriod} yrs` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  After this, it's all profit!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Deep Dive */}
        {displayPanelFinancials && installationFee && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Your Return on Investment Over Time</h2>
              <p className="text-muted-foreground text-lg">
                Watch your investment pay for itself and generate long-term wealth
              </p>
            </div>
            <ROIVisualization
              roiResults={displayPanelFinancials}
              systemCost={installationFee}
              lifetimeYears={25}
              showRoiCard={false}
            />
          </div>
        )}

         {/* Monthly Generation Chart */}
         <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Energy Production & Savings</CardTitle>
                <CardDescription>
                  Your solar system works year-round to save you money
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMonthlyChart(!showMonthlyChart)}
                className="gap-2"
              >
                {showMonthlyChart ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Chart
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Chart
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showMonthlyChart && (
            <CardContent>
              <div className="space-y-4">
                {adjustedMonthlyGeneration.map((month) => {
                  const percentage = maxAdjustedMonthlyKwh
                    ? (month.kwh / maxAdjustedMonthlyKwh) * 100
                    : 0
                  const monthlySavings = electricityRate * month.kwh
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-green-600 font-semibold">
                          {month.kwh.toLocaleString()} kWh · {formatMYR(monthlySavings)} saved
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          )}
        </Card>


        {/* System Size & Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">System Specifications</CardTitle>
            <CardDescription>Technical details for {selectedPanel?.brand ?? "selected"} panels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">System Size</p>
                <p className="text-3xl font-bold mt-1">{adjustedSystemSize} kW</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Optimized for your roof
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yearly Generation</p>
                <p className="text-3xl font-bold mt-1">{adjustedYearlyGeneration.toLocaleString()} kWh</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clean energy produced annually
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Number of Panels</p>
                <p className="text-3xl font-bold mt-1">
                  {panelCount ? `${panelCount}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {panelWattage}W per panel
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Electricity Usage</CardTitle>
            <CardDescription>How we calculated your potential savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Current average monthly bill</p>
                <p className="text-3xl font-bold mt-1 text-red-600">
                  {averageBillUsed ? formatMYR(averageBillUsed) : "Not provided"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is what you're spending now
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bill history</p>
                {billingDetails?.manualBills?.length ? (
                  <>
                    <p className="text-2xl font-bold mt-1">
                      {manualAverageBill ? formatMYR(manualAverageBill) : formatMYR(billingDetails.manualBills[0])}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on {billingDetails.manualBills.length} month(s) of data
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold mt-1 text-muted-foreground">Using area estimate</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roof Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Roof Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.roofArea.toLocaleString()} sq ft</div>
              <p className="text-xs text-muted-foreground mt-1">≈ {Math.round(roofAreaSqM)} m²</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orientation</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.roofOrientation}</div>
              <p className="text-xs text-muted-foreground">Good for solar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.shadingPercentage}%</div>
              <Progress value={100 - results.shadingPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {100 - results.shadingPercentage}% unshaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyConsumptionDisplay ? `${Math.round(monthlyConsumptionDisplay)} kWh` : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Your usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance & Investment Summary */}
        {displayPanelFinancials && installationFee && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Your monthly energy generation and savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily Generation</span>
                    <span className="font-medium">{displayPanelFinancials.dailyGeneration.toFixed(2)} kWh/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Generation</span>
                    <span className="font-medium">{displayPanelFinancials.monthlyGeneration.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Savings</span>
                    <span className="font-medium text-green-600">RM{displayPanelFinancials.monthlySavings.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
                <CardDescription>Key financial metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">System Cost</span>
                    <span className="font-medium">RM{installationFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Savings</span>
                    <span className="font-medium text-green-600">RM{displayPanelFinancials.annualSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payback Period</span>
                    <span className="font-medium">{displayPanelFinancials.paybackPeriod.toFixed(1)} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ROI per Year</span>
                    <span className="font-medium" style={{ 
                      color: displayPanelFinancials.roiPercentage >= 15 ? "#10b981" : 
                             displayPanelFinancials.roiPercentage >= 8 ? "#3b82f6" : 
                             displayPanelFinancials.roiPercentage >= 5 ? "#f59e0b" : "#ef4444" 
                    }}>
                      {displayPanelFinancials.roiPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Net Profit (25 years)</span>
                    <span className="font-bold text-green-600">
                      RM{((displayPanelFinancials.annualSavings * 25) - installationFee).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/upload")}>
            Analyze Another Roof
          </Button>
          <Button onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

