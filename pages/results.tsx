import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { generateMockResults, type SolarResult } from "@/lib/mockData"
import { Home, TrendingUp, Sun, DollarSign, Calendar } from "lucide-react"

export default function Results() {
  const router = useRouter()
  const [results, setResults] = useState<SolarResult | null>(null)

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

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Your Solar Potential Results</h1>
          <p className="text-muted-foreground">
            Based on your roof analysis, here are your estimated solar potential metrics
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roof Orientation</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.roofOrientation}</div>
              <p className="text-xs text-muted-foreground">
                Optimal for solar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shading</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Size</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.systemSize} kW</div>
              <p className="text-xs text-muted-foreground">
                {results.roofArea} sq ft roof area
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Generation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalYearlyGeneration.toLocaleString()} kWh</div>
              <p className="text-xs text-muted-foreground">
                Annual energy production
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Generation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Solar Generation</CardTitle>
            <CardDescription>
              Estimated energy production by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.monthlyGeneration.map((month) => {
                const maxKwh = Math.max(...results.monthlyGeneration.map(m => m.kwh))
                const percentage = (month.kwh / maxKwh) * 100
                return (
                  <div key={month.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{month.kwh} kWh</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Savings Information */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Monthly Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${results.estimatedSavings.monthly.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average monthly savings on electricity bills
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Yearly Savings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${results.estimatedSavings.yearly.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Total annual savings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Payback Period</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{results.paybackPeriod} years</div>
              <p className="text-sm text-muted-foreground mt-2">
                Time to recover initial investment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lifetime Savings */}
        <Card>
          <CardHeader>
            <CardTitle>Lifetime Savings</CardTitle>
            <CardDescription>
              Estimated total savings over 25-year system lifetime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-primary">
                ${results.estimatedSavings.lifetime.toLocaleString()}
              </div>
              <p className="text-muted-foreground mt-4">
                Total potential savings over the system&apos;s lifetime
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
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

