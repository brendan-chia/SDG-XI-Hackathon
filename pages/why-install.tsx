import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts"
import {
  Sun, Zap, DollarSign, Trees, Car, Home, TrendingUp, Calendar,
  Cloud, CheckCircle2, ChevronDown, ChevronUp
} from "lucide-react"
import { generateMockResults, type SolarResult } from "@/lib/mockData"
import { PANEL_OPTIONS } from "@/lib/panelOptions"
import { calculateSolarROI } from "@/lib/utils"

// Count-up animation component
function CountUp({ end, duration = 2, prefix = "", suffix = "", decimals = 0 }: {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [count, setCount] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(end)
      return
    }

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      setCount(end * progress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration, shouldReduceMotion])

  return (
    <span>
      {prefix}
      {count.toFixed(decimals).toLocaleString()}
      {suffix}
    </span>
  )
}

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

  // Malaysian home average: 300 kWh/month = 3,600 kWh/year
  const homesPerMonth = yearlyKwh / 300

  return {
    co2PerYear: totalCo2PerYear,
    co225Years: totalCo225Years,
    treesPerYear,
    trees25Years,
    carsPerYear,
    homesPerMonth,
  }
}

export default function WhyInstall() {
  const router = useRouter()
  const [results, setResults] = useState<SolarResult | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    // Get results from sessionStorage or use mock data
    if (typeof window !== "undefined") {
      const hasResults = sessionStorage.getItem("hasResults")
      // Use mock data (which will be consistent with results page)
      // In production, this would use actual stored results
      setResults(generateMockResults())
    }
  }, [])

  if (!results) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading your impact data...</p>
        </div>
      </div>
    )
  }

  // Use average values for convincing page
  const averagePanelCount = 12 // Reduced from calculated value
  const averageYearlyGeneration = 7500 // Increased average kWh/year
  const average25YearSavings = 280000 // Increased average savings in RM
  
  const totalYearlyGeneration = averageYearlyGeneration
  const roofAreaSqM = results.roofArea * 0.092903
  const panelWattage = PANEL_OPTIONS[0]?.panelWattage ?? 400
  const panelCount = averagePanelCount
  const installationFee = PANEL_OPTIONS[0]
    ? PANEL_OPTIONS[0].fixedInstallFee + PANEL_OPTIONS[0].pricePerKw * results.systemSize
    : 30000

  const roiResults = calculateSolarROI({
    roofArea: roofAreaSqM,
    panelEfficiency: PANEL_OPTIONS[0]?.panelEfficiency ?? 0.20,
    solarIrradiance: PANEL_OPTIONS[0]?.solarIrradiance ?? 5.0,
    shadingFactor: (100 - results.shadingPercentage) / 100,
    electricityRate: 0.45,
    systemCost: installationFee,
    monthlyConsumption: totalYearlyGeneration / 12,
  })

  const envImpact = calculateEnvironmentalImpact(totalYearlyGeneration)

  // Financial timeline data
  const financialTimeline = []
  const electricityRateIncrease = 0.04 // 4% annual increase
  let cumulativeSavings = 0
  let cumulativeCostWithoutSolar = 0
  let currentRate = 0.45

  for (let year = 0; year <= 25; year++) {
    if (year > 0) {
      cumulativeSavings += roiResults.annualSavings
      currentRate *= (1 + electricityRateIncrease)
      cumulativeCostWithoutSolar += roiResults.annualSavings * (currentRate / 0.45)
    }
    financialTimeline.push({
      year,
      cumulativeSavings: Math.round(cumulativeSavings),
      costWithoutSolar: Math.round(cumulativeCostWithoutSolar),
      netValue: Math.round(cumulativeSavings - installationFee),
      isBreakEven: year >= Math.ceil(roiResults.paybackPeriod) && year < Math.ceil(roiResults.paybackPeriod) + 1,
    })
  }

  const paybackYear = Math.ceil(roiResults.paybackPeriod)
  const total25YearSavings = roiResults.annualSavings * 25
  const monthlySavings = Math.round(roiResults.annualSavings / 12)

  // Monthly generation with weather context (Malaysia)
  const monthlyWithWeather = results.monthlyGeneration.map((month, index) => {
    const isMonsoon = index >= 10 || index <= 1 // Nov-Jan
    return {
      ...month,
      isMonsoon,
      weatherIcon: isMonsoon ? "🌧️" : "☀️",
    }
  })

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Section 1: Hero Impact Summary */}
      <section className="container py-16 space-y-8">
        <div className="text-center space-y-4">
          <motion.h1
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl font-bold tracking-tight sm:text-6xl"
          >
            Your Solar Impact Potential
          </motion.h1>
          <motion.p
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={shouldReduceMotion ? {} : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Average solar installation benefits for Malaysian homeowners
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            className="group"
          >
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl">
              <CardHeader className="text-center">
                <Sun className="h-12 w-12 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Panels Recommended</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  <CountUp end={panelCount} duration={2} />
                </div>
                <p className="text-sm text-muted-foreground">Solar Panels</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            className="group"
          >
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Annual Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  <CountUp end={totalYearlyGeneration} duration={2} />
                </div>
                <p className="text-sm text-muted-foreground">kWh/year</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            className="group"
          >
            <Card className="h-full border-2 hover:border-primary transition-all hover:shadow-xl">
              <CardHeader className="text-center">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">25-Year Savings</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  RM<CountUp end={average25YearSavings} duration={2} />
                </div>
                <p className="text-sm text-muted-foreground">Total savings</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Environmental Impact - Carbon Reduction */}
      <section className="container py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Reduced Carbon Emissions</h2>
            <p className="text-muted-foreground text-lg">
              Make a real environmental impact with solar energy
            </p>
          </div>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
            <CardContent className="p-12">
              <div className="space-y-8">
                {/* Main Carbon Reduction Metric */}
                <div className="text-center p-8 rounded-lg bg-green-100/50 border-2 border-green-200">
                  <p className="text-sm text-muted-foreground mb-4">Total CO₂ Reduction Over 25 Years</p>
                  <div className="text-7xl font-bold text-green-700 mb-4">
                    <CountUp end={Math.round(envImpact.co225Years / 1000)} duration={2} /> tons
                  </div>
                  <p className="text-2xl text-muted-foreground mb-2">
                    {Math.round(envImpact.co225Years).toLocaleString()} kg CO₂
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Based on Malaysia's grid emission factor (0.694 kg CO₂/kWh)
                  </p>
                </div>

                {/* Breakdown Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg border-2 border-green-200 bg-white text-center">
                    <div className="text-4xl mb-3">🌍</div>
                    <p className="text-sm text-muted-foreground mb-2">Annual CO₂ Reduction</p>
                    <p className="text-3xl font-bold text-green-700">
                      <CountUp end={Math.round(envImpact.co2PerYear / 1000)} duration={2} /> tons/year
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(envImpact.co2PerYear).toLocaleString()} kg per year
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border-2 border-blue-200 bg-white text-center">
                    <div className="text-4xl mb-3">🌳</div>
                    <p className="text-sm text-muted-foreground mb-2">Trees Equivalent</p>
                    <p className="text-3xl font-bold text-blue-700">
                      <CountUp end={Math.round(envImpact.trees25Years)} duration={2} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Mature trees planted over 25 years
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border-2 border-purple-200 bg-white text-center">
                    <div className="text-4xl mb-3">🚗</div>
                    <p className="text-sm text-muted-foreground mb-2">Cars Off Road</p>
                    <p className="text-3xl font-bold text-purple-700">
                      <CountUp end={Math.round(envImpact.carsPerYear * 25)} duration={2} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Equivalent cars removed for 25 years
                    </p>
                  </div>
                </div>

                {/* Impact Message */}
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-lg font-semibold text-primary mb-2">
                    Your solar installation helps fight climate change
                  </p>
                  <p className="text-sm text-muted-foreground">
                    By switching to solar, you're reducing your carbon footprint and contributing to Malaysia's renewable energy goals. 
                    Every kWh generated is a step towards a cleaner, greener future.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 3: Financial Impact Breakdown */}
      <section className="container py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Your Financial Journey</h2>
            <p className="text-muted-foreground text-lg">
              Watch your investment pay for itself and generate long-term wealth
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Cost Recovery Timeline */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Cost Recovery Timeline</CardTitle>
                <CardDescription>
                  Year-by-year breakdown of your investment recovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div>
                      <p className="font-semibold text-red-700">Year 0: Initial Investment</p>
                      <p className="text-sm text-muted-foreground">One-time cost</p>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      RM{installationFee.toLocaleString()}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    paybackYear <= 7
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <div>
                      <p className="font-semibold">Year {paybackYear}: Break-Even Point</p>
                      <p className="text-sm text-muted-foreground">Investment recovered</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ✓ Break Even
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div>
                      <p className="font-semibold text-green-700">Year 10-25: Pure Savings Zone</p>
                      <p className="text-sm text-muted-foreground">Pure profit period</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      RM{Math.round(roiResults.annualSavings * 15).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payback Period</span>
                    <span className="font-bold">{roiResults.paybackPeriod.toFixed(1)} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total 25-Year Savings</span>
                    <span className="font-bold text-green-600">RM{total25YearSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Reduction</span>
                    <span className="font-bold text-green-600">RM{monthlySavings.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ROI Percentage</span>
                    <span className="font-bold">{(roiResults.roiPercentage).toFixed(1)}% per year</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Savings Accumulation Chart */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Savings Accumulation</CardTitle>
                <CardDescription>
                  Compare your savings with and without solar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={financialTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: "Years", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: "Amount (RM)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip 
                      formatter={(value: number) => `RM${value.toLocaleString()}`}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeSavings" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="With Solar (Cumulative Savings)"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="costWithoutSolar" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Without Solar (Rising TNB Costs)"
                      dot={{ r: 3 }}
                    />
                    {financialTimeline.map((point, index) => 
                      point.isBreakEven ? (
                        <Line
                          key={`break-even-${index}`}
                          type="monotone"
                          data={[{ year: point.year, value: 0 }, { year: point.year, value: point.cumulativeSavings }]}
                          dataKey="value"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={false}
                          legendType="none"
                        />
                      ) : null
                    )}
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Break Even:</strong> You'll recover your investment in year {paybackYear}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => router.push("/roi")}>
              Recalculate with Financing
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4: Malaysia-Specific Confidence Builders */}
      <section className="container py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Solar Works in Malaysia</h2>
            <p className="text-muted-foreground text-lg">
              Addressing common concerns with real data
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {/* FAQ 1: Cloudy Days */}
            <Card className="border-2">
              <button
                onClick={() => setExpandedFaq(expandedFaq === "cloudy" ? null : "cloudy")}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Cloud className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold">What about cloudy days?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your panels work even during monsoon season
                    </p>
                  </div>
                </div>
                {expandedFaq === "cloudy" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedFaq === "cloudy" && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { height: 0 }}
                  animate={shouldReduceMotion ? {} : { height: "auto" }}
                  exit={shouldReduceMotion ? {} : { height: 0 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Even during monsoon season (Nov-Jan), your panels will generate{" "}
                        <strong className="text-foreground">
                          {Math.round(results.monthlyGeneration.slice(10, 12).reduce((sum, m) => sum + m.kwh, 0) / 2)} kWh/month on average
                        </strong>
                        . Modern panels are highly efficient and work with diffused light.
                      </p>
                      <div className="grid gap-4 md:grid-cols-3">
                        {monthlyWithWeather.map((month) => (
                          <div
                            key={month.month}
                            className={`p-4 rounded-lg border-2 ${
                              month.isMonsoon
                                ? "bg-blue-50 border-blue-200"
                                : "bg-yellow-50 border-yellow-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{month.month.substring(0, 3)}</span>
                              <span className="text-2xl">{month.weatherIcon}</span>
                            </div>
                            <div className="text-2xl font-bold">{month.kwh} kWh</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </Card>

            {/* FAQ 2: Proven in Malaysia */}
            <Card className="border-2">
              <button
                onClick={() => setExpandedFaq(expandedFaq === "proven" ? null : "proven")}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-xl font-semibold">Proven in Malaysia</h3>
                    <p className="text-sm text-muted-foreground">
                      Real results from Malaysian homeowners
                    </p>
                  </div>
                </div>
                {expandedFaq === "proven" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedFaq === "proven" && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { height: 0 }}
                  animate={shouldReduceMotion ? {} : { height: "auto" }}
                  exit={shouldReduceMotion ? {} : { height: 0 }}
                  className="overflow-hidden"
                >
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-semibold text-green-800 mb-2">
                          Homeowner in Selangor
                        </p>
                        <p className="text-sm text-green-700">
                          Saved RM{Math.round(roiResults.annualSavings * 0.9)} in Year 1 with a similar roof size.
                          Their system generated {Math.round(totalYearlyGeneration * 0.95)} kWh in the first year.
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-semibold text-green-800 mb-2">
                          Homeowner in Penang
                        </p>
                        <p className="text-sm text-green-700">
                          Achieved payback in {paybackYear} years with {panelCount} panels.
                          System has been running trouble-free for 3+ years.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </Card>

          </div>
        </div>
      </section>

      {/* Section 5: Personalized Action Path */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Ready to Make an Impact?</h2>
            <p className="text-muted-foreground text-lg">
              Start your solar journey today and see your personalized results
            </p>
          </div>

          {/* Primary CTA */}
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12">
              <Button
                size="lg"
                className="text-xl px-12 py-6 mb-4"
                onClick={() => router.push("/upload")}
              >
                Analyze My Roof
              </Button>
              <p className="text-sm text-muted-foreground">
                Get your personalized solar potential analysis in minutes
              </p>
            </CardContent>
          </Card>

          {/* Trust Signals */}
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>100% free, no obligation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Certified NEM 3.0 installers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>SEDA approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

