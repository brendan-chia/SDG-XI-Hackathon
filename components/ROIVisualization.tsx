import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, DollarSign, Calendar, Percent, ChevronDown, ChevronUp } from "lucide-react"
import type { SolarROIResults } from "@/lib/utils"
import { useState } from "react"

interface ROIVisualizationProps {
  roiResults: SolarROIResults
  systemCost: number
  lifetimeYears?: number
  showRoiCard?: boolean
  showCumulativeSavings?: boolean
  showCostSavingsComparison?: boolean
}

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
}

export default function ROIVisualization({
  roiResults,
  systemCost,
  lifetimeYears = 25,
  showRoiCard = true,
  showCumulativeSavings: initialShowCumulativeSavings = false,
  showCostSavingsComparison: initialShowCostSavingsComparison = false,
}: ROIVisualizationProps) {
  const [showCumulativeSavings, setShowCumulativeSavings] = useState(initialShowCumulativeSavings)
  const [showCostSavingsComparison, setShowCostSavingsComparison] = useState(initialShowCostSavingsComparison)
  const overviewGridCols = showRoiCard ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"
  // Calculate cumulative savings over time
  const cumulativeSavingsData = []
  let cumulativeSavings = 0
  for (let year = 0; year <= lifetimeYears; year++) {
    cumulativeSavings += roiResults.annualSavings
    cumulativeSavingsData.push({
      year,
      cumulative: Math.round(cumulativeSavings),
      annual: Math.round(roiResults.annualSavings),
      netValue: Math.round(cumulativeSavings - systemCost),
    })
  }

  // Find payback year
  const paybackYear = Math.ceil(roiResults.paybackPeriod)

  // ROI Gauge Data
  const roiGaugeData = [
    { name: "ROI", value: Math.min(roiResults.roiPercentage, 100) },
    { name: "Remaining", value: Math.max(0, 100 - roiResults.roiPercentage) },
  ]

  // Cost vs Savings Comparison
  const costSavingsComparison = [
    {
      name: "Initial Cost",
      value: systemCost,
      type: "Cost",
    },
    {
      name: "Year 1 Savings",
      value: roiResults.annualSavings,
      type: "Savings",
    },
    {
      name: "5 Year Savings",
      value: roiResults.annualSavings * 5,
      type: "Savings",
    },
    {
      name: "10 Year Savings",
      value: roiResults.annualSavings * 10,
      type: "Savings",
    },
    {
      name: "Lifetime Savings",
      value: roiResults.annualSavings * lifetimeYears,
      type: "Savings",
    },
  ]

  // ROI percentage color based on value
  const getROIColor = (roi: number) => {
    if (roi >= 15) return COLORS.success
    if (roi >= 8) return COLORS.primary
    if (roi >= 5) return COLORS.warning
    return COLORS.danger
  }

  return (
    <div className="space-y-6">
      {/* ROI Overview Cards */}
      <div className={`grid gap-6 ${overviewGridCols}`}>
        {showRoiCard && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI per Year</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getROIColor(roiResults.roiPercentage) }}>
                {roiResults.roiPercentage.toFixed(1)}%
              </div>
              <Progress value={Math.min(roiResults.roiPercentage, 100)} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Annual return on investment</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roiResults.paybackPeriod.toFixed(1)} years
            </div>
            <Progress 
              value={Math.min((paybackYear / lifetimeYears) * 100, 100)} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Time to recover investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              RM{roiResults.annualSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Yearly electricity savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              RM{(roiResults.annualSavings * lifetimeYears).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Over {lifetimeYears} years
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI Gauge Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Return on Investment (ROI)</CardTitle>
          <CardDescription>
            Annual ROI percentage based on your solar system investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-64 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roiGaugeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    {roiGaugeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? getROIColor(roiResults.roiPercentage) : "#e5e7eb"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div 
                    className="text-4xl font-bold"
                    style={{ color: getROIColor(roiResults.roiPercentage) }}
                  >
                    {roiResults.roiPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Annual ROI</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Savings Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cumulative Savings Over Time</CardTitle>
              <CardDescription>
                Track your savings accumulation and when you break even
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCumulativeSavings(!showCumulativeSavings)}
              className="gap-2"
            >
              {showCumulativeSavings ? (
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
        {showCumulativeSavings && (
          <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cumulativeSavingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: "Years", position: "insideBottom", offset: -5 }}
              />
              <YAxis 
                label={{ value: "Amount (MYR)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip 
                formatter={(value: number) => `RM${value.toLocaleString()}`}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke={COLORS.success} 
                strokeWidth={3}
                name="Cumulative Savings"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="netValue" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Net Value (Savings - Cost)"
                dot={{ r: 3 }}
              />
              {/* Payback line */}
              {paybackYear <= lifetimeYears && (
                <Line
                  type="monotone"
                  dataKey={() => 0}
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Break Even Point"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          {paybackYear <= lifetimeYears && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Break Even:</strong> You'll recover your initial investment in year {paybackYear}
              </p>
            </div>
          )}
          </CardContent>
        )}
      </Card>

      {/* Cost vs Savings Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cost vs Savings Comparison</CardTitle>
              <CardDescription>
                Compare your initial investment with savings over different time periods
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCostSavingsComparison(!showCostSavingsComparison)}
              className="gap-2"
            >
              {showCostSavingsComparison ? (
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
        {showCostSavingsComparison && (
          <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={costSavingsComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ value: "Amount (MYR)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip 
                formatter={(value: number) => `RM${value.toLocaleString()}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Amount"
              >
                {costSavingsComparison.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === "Cost" ? COLORS.danger : COLORS.success} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

