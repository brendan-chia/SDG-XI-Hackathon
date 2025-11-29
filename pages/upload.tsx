import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LocateFixed } from "lucide-react"
import GoogleMapVisualization from "@/components/GoogleMapVisualization"
import RoofDrawingMap from "@/components/RoofDrawingMap"

type Coordinates = {
  lat: number
  lng: number
}

export default function Upload() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [estimatedDailyOutput, setEstimatedDailyOutput] = useState<number | null>(null)
  const [averageMonthlyConsumption, setAverageMonthlyConsumption] = useState<number | null>(null)
  const [averageMonthlyBill, setAverageMonthlyBill] = useState<number | null>(null)
  const [manualBills, setManualBills] = useState<number[]>([])
  const [manualBillInput, setManualBillInput] = useState("")
  const [roofArea, setRoofArea] = useState<number | null>(null)
  const [useDrawingMode, setUseDrawingMode] = useState(false)
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const ELECTRICITY_RATE = 0.45
  const manualAverageBill =
    manualBills.length > 0 ? manualBills.reduce((sum, value) => sum + value, 0) / manualBills.length : null
  const averageBillUsedForCalculation = manualAverageBill ?? averageMonthlyBill
  const averageBillSource = manualAverageBill
    ? "Based on your entered bill history."
    : "Based on the estimated area average."

  const requestCurrentLocation = () => {
    if (useCurrentLocation) {
      setUseCurrentLocation(false)
      setLocationError(null)
      return
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCoordinates(coords)
        setUseCurrentLocation(true)
        setIsLocating(false)

        if (googleMapsKey) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${googleMapsKey}`
            )
            const data = await response.json()
            const formattedAddress = data.results?.[0]?.formatted_address
            if (formattedAddress) {
              setAddress(formattedAddress)
            }
          } catch (error) {
            console.error("Reverse geocode failed", error)
          }
        }
      },
      (error) => {
        setLocationError(error.message || "Unable to access your location.")
        setIsLocating(false)
        setUseCurrentLocation(false)
      }
    )
  }

  useEffect(() => {
    if (!googleMapsKey || !address.trim() || useCurrentLocation) {
      if (!address.trim() && !useCurrentLocation) {
        setCoordinates(null)
        setAverageMonthlyConsumption(null)
        setAverageMonthlyBill(null)
      }
      return
    }

    const controller = new AbortController()
    setIsLocating(true)
    setGeocodeError(null)

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error("Failed to geocode address")
        }

        const data = await response.json()
        if (data.status !== "OK") {
          setGeocodeError("Address not found. Try refining your search.")
          setCoordinates(null)
          return
        }

        const location = data.results[0]?.geometry?.location
        if (location) {
          setCoordinates({ lat: location.lat, lng: location.lng })
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setGeocodeError("Unable to locate address. Please try again.")
          console.error(error)
        }
      } finally {
        setIsLocating(false)
      }
    }, 500)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [address, googleMapsKey, useCurrentLocation])

  useEffect(() => {
    if (!coordinates) {
      setEstimatedDailyOutput(null)
      return
    }

    const base = 12
    const locationBonus = useCurrentLocation ? 2 : (address.length % 3)
    setEstimatedDailyOutput(parseFloat((base + locationBonus).toFixed(1)))
  }, [coordinates, useCurrentLocation, address])

  useEffect(() => {
    if (!address.trim()) {
      setAverageMonthlyConsumption(null)
      setAverageMonthlyBill(null)
      return
    }

    const normalizedLength = address.replace(/[^a-zA-Z]/g, "").length || 1
    const baseConsumption = 380
    const variation = (normalizedLength % 60) - 30
    const monthlyConsumption = Math.max(250, baseConsumption + variation * 4)
    setAverageMonthlyConsumption(monthlyConsumption)
    setAverageMonthlyBill(Number((monthlyConsumption * ELECTRICITY_RATE).toFixed(2)))
  }, [address])

  const handleAddBill = () => {
    const value = parseFloat(manualBillInput)
    if (!isNaN(value) && value > 0) {
      setManualBills((prev) => [...prev, Number(value.toFixed(2))])
      setManualBillInput("")
    }
  }

  const handleRemoveBill = (index: number) => {
    setManualBills((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAnalyze = () => {
    if (!address.trim() && !useCurrentLocation) {
      alert("Please enter an address or enable current location first")
      return
    }

    setIsAnalyzing(true)
    
    // Simulate analysis delay
    setTimeout(() => {
      // Store mock data in sessionStorage for results page
      if (typeof window !== "undefined") {
        const billingDetails = {
          averageMonthlyConsumption,
          averageMonthlyBill,
          manualBills,
          manualAverageBill,
          averageBillUsedForCalculation,
          electricityRate: ELECTRICITY_RATE,
          roofArea,
        }
        sessionStorage.setItem("analysisDetails", JSON.stringify(billingDetails))
        sessionStorage.setItem("hasResults", "true")
      }
      router.push("/results")
    }, 1500)
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Analyze Your Roof</h1>
          <p className="text-muted-foreground">Enter your address or enable location to preview your roof</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Address</CardTitle>
            <CardDescription>
              Enter your address or enable location services to preview your roof
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="address-input" className="text-sm font-medium">
                Address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="address-input"
                  type="text"
                  placeholder="123 Main St, Kuala Lumpur"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (useCurrentLocation) {
                      setUseCurrentLocation(false)
                    }
                  }}
                  className="text-lg"
                  disabled={useCurrentLocation}
                />
                <Button
                  type="button"
                  onClick={requestCurrentLocation}
                  className="gap-2"
                  variant={useCurrentLocation ? "default" : "outline"}
                >
                  <LocateFixed className="h-4 w-4" />
                  {useCurrentLocation ? "Disable Location" : isLocating ? "Locating..." : "Use My Location"}
                </Button>
              </div>
              {locationError && (
                <p className="text-sm text-destructive">{locationError}</p>
              )}
              {geocodeError && !useCurrentLocation && (
                <p className="text-sm text-destructive">{geocodeError}</p>
              )}
              {!googleMapsKey && (
                <p className="text-sm text-muted-foreground">
                  Add <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable Google Maps previews.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Map Mode</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!useDrawingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseDrawingMode(false)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant={useDrawingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseDrawingMode(true)}
                    disabled={!coordinates}
                  >
                    Draw Roof Area
                  </Button>
                </div>
              </div>

              {!useDrawingMode ? (
                <GoogleMapVisualization
                  coordinates={coordinates}
                  shadingPercent={10}
                  estimatedDailyKwh={estimatedDailyOutput}
                  address={address}
                  useCurrentLocation={useCurrentLocation}
                />
              ) : (
                <RoofDrawingMap
                  coordinates={coordinates}
                  address={address}
                  useCurrentLocation={useCurrentLocation}
                  onAreaCalculated={(area) => setRoofArea(area)}
                />
              )}
            </div>

            {roofArea && (
              <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
                <p className="text-sm font-medium text-primary">Calculated Roof Area</p>
                <div className="flex items-baseline gap-3 mt-2">
                  <p className="text-3xl font-bold">{roofArea.toFixed(2)} m²</p>
                  <p className="text-lg text-muted-foreground">({(roofArea * 10.764).toFixed(2)} sq ft)</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on the roof outline you drew
                </p>
              </div>
            )}

            {averageMonthlyBill && (
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">Estimated average monthly bill for your area</p>
                <p className="text-3xl font-bold mt-2">
                  RM{averageMonthlyBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                {averageMonthlyConsumption && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on roughly {Math.round(averageMonthlyConsumption)} kWh monthly consumption.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Electricity Bill History</CardTitle>
            <CardDescription>Optional: enter recent bills to tailor ROI calculations later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 320.50"
                value={manualBillInput}
                onChange={(e) => setManualBillInput(e.target.value)}
              />
              <Button type="button" onClick={handleAddBill} disabled={!manualBillInput.trim()}>
                Add Bill
              </Button>
            </div>
            {manualBills.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {manualBills.map((bill, index) => (
                    <div
                      key={`${bill}-${index}`}
                      className="flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-sm"
                    >
                      <span>RM{bill.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBill(index)}
                        className="text-muted-foreground hover:text-destructive focus:outline-none"
                        aria-label="Remove bill"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {manualAverageBill && (
                  <p className="text-sm">
                    Average of {manualBills.length} month{manualBills.length > 1 ? "s" : ""}:{" "}
                    <span className="font-semibold">RM{manualAverageBill.toFixed(2)}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Adding at least 3 bills will produce more accurate payback estimates.
              </p>
            )}
          </CardContent>
        </Card>

        {averageBillUsedForCalculation && (
          <div className="rounded-2xl border border-primary/60 bg-primary/5 p-6 text-center">
            <p className="text-base font-semibold text-primary tracking-wide uppercase">Average bill used</p>
            <p className="text-5xl font-bold mt-4">
              RM{averageBillUsedForCalculation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{averageBillSource}</p>
          </div>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!address.trim() && !useCurrentLocation)}
            className="text-lg px-8 py-6"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Roof"}
          </Button>
        </div>
      </div>
    </div>
  )
}

