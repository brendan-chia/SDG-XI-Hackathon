import { useEffect, useMemo, useState, useRef } from "react"
import { GoogleMap, Polygon, Marker, useLoadScript } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Calculator, Undo, Info, ZoomIn } from "lucide-react"

type Coordinates = {
  lat: number
  lng: number
}

interface RoofDrawingMapProps {
  coordinates: Coordinates | null
  address: string
  useCurrentLocation: boolean
  onAreaCalculated?: (area: number) => void
}

const DEFAULT_CENTER: Coordinates = { lat: 3.139, lng: 101.6869 }
const DEFAULT_ZOOM = 20
const libraries: ("places" | "drawing" | "geometry")[] = ["places", "drawing", "geometry"]

export default function RoofDrawingMap({
  coordinates,
  address,
  useCurrentLocation,
  onAreaCalculated,
}: RoofDrawingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(coordinates)
  const [polygonPath, setPolygonPath] = useState<Coordinates[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (coordinates) {
      setMapCenter(coordinates)
    }
  }, [coordinates])

  const loadOptions = useMemo(
    () => ({
      googleMapsApiKey: apiKey ?? "",
      libraries,
    }),
    [apiKey]
  )

  const { isLoaded, loadError } = useLoadScript(loadOptions)

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!isDrawing || !e.latLng) return

    const newPoint = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }
    setPolygonPath((prev) => [...prev, newPoint])
  }

  const handleClearPolygon = () => {
    setPolygonPath([])
    setCalculatedArea(null)
    setError(null)
    setShowHelp(true)
  }

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setPolygonPath([])
    setCalculatedArea(null)
    setError(null)
    setShowHelp(true)
  }

  const handleFinishDrawing = () => {
    setIsDrawing(false)
    if (polygonPath.length < 3) {
      setError("Please draw at least 3 points to form a polygon")
      setPolygonPath([])
    } else {
      setShowHelp(false)
    }
  }

  const handleUndoLastPoint = () => {
    if (polygonPath.length > 0) {
      setPolygonPath((prev) => prev.slice(0, -1))
    }
  }

  const handleZoomToRoof = () => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setZoom(21)
      mapRef.current.setCenter(mapCenter)
    }
  }

  const calculateAreaWithGemini = async () => {
    if (polygonPath.length < 3) {
      setError("Please draw a polygon first")
      return
    }

    if (!geminiApiKey) {
      setError("Gemini API key is not configured")
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      // Calculate area using Google Maps Geometry library
      if (window.google && window.google.maps && window.google.maps.geometry) {
        const googlePolygon = new google.maps.Polygon({ paths: polygonPath })
        const areaInSquareMeters = google.maps.geometry.spherical.computeArea(
          googlePolygon.getPath()
        )
        
        setCalculatedArea(areaInSquareMeters)
        if (onAreaCalculated) {
          onAreaCalculated(areaInSquareMeters)
        }

        // Optional: Use Gemini to provide additional insights
        await getGeminiInsights(areaInSquareMeters, polygonPath)
      }
    } catch (err) {
      console.error("Error calculating area:", err)
      setError("Failed to calculate area. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  const getGeminiInsights = async (area: number, path: Coordinates[]) => {
    if (!geminiApiKey) return

    try {
      const response = await fetch("/api/gemini-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area,
          coordinates: path,
          address,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Gemini insights:", data)
      }
    } catch (err) {
      console.error("Error getting Gemini insights:", err)
    }
  }

  const mapDescription = useMemo(() => {
    if (!coordinates) {
      return "Enter an address to start drawing on your roof."
    }
    if (isDrawing) {
      return `Drawing mode active - ${polygonPath.length} points placed. Click around your roof edges.`
    }
    if (polygonPath.length > 0) {
      return "Roof outlined successfully! Calculate the area or adjust points by dragging them."
    }
    return "Click 'Start Drawing' to outline your roof area on the satellite view."
  }, [coordinates, isDrawing, polygonPath.length])

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roof Area Drawing</CardTitle>
          <CardDescription>Draw your roof outline to calculate area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Missing <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
              Add your Google Maps API key to enable this feature.
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roof Area Drawing</CardTitle>
        <CardDescription>{mapDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && (
          <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Unable to load Google Maps. Please verify your API key.
          </div>
        )}

        {!geminiApiKey && (
          <div className="rounded-md border border-dashed border-yellow-400/40 bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertTriangle className="inline h-4 w-4 mr-2" />
            Add <code className="font-mono bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GEMINI_API_KEY</code> for AI-powered insights.
          </div>
        )}

        <div className="relative h-[500px] w-full overflow-hidden rounded-lg border shadow-md">
          {isLoaded && mapCenter ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter ?? DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              options={{
                mapTypeId: "satellite",
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                tilt: 0,
                gestureHandling: isDrawing ? "greedy" : "cooperative",
              }}
              onClick={handleMapClick}
              onLoad={(map) => {
                mapRef.current = map
              }}
            >
              {/* Show markers for each point during drawing */}
              {isDrawing && polygonPath.map((point, index) => (
                <Marker
                  key={`point-${index}`}
                  position={point}
                  label={{
                    text: `${index + 1}`,
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#2563eb",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  }}
                />
              ))}

              {/* Show the polygon */}
              {polygonPath.length > 0 && (
                <Polygon
                  paths={polygonPath}
                  options={{
                    strokeColor: isDrawing ? "#f59e0b" : "#2563eb",
                    strokeOpacity: 0.9,
                    strokeWeight: 3,
                    fillColor: isDrawing ? "#fbbf24" : "#3b82f6",
                    fillOpacity: isDrawing ? 0.2 : 0.35,
                    editable: !isDrawing && polygonPath.length >= 3,
                    draggable: false,
                  }}
                  onMouseUp={() => {
                    // Update polygon path when edited
                    if (mapRef.current && polygonPath.length >= 3) {
                      // Path will auto-update through React state
                    }
                  }}
                />
              )}

              {/* Show a line from last point to first when drawing (closure preview) */}
              {isDrawing && polygonPath.length > 2 && (
                <Polygon
                  paths={[...polygonPath, polygonPath[0]]}
                  options={{
                    strokeColor: "#f59e0b",
                    strokeOpacity: 0.4,
                    strokeWeight: 2,
                    fillOpacity: 0,
                    clickable: false,
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {isLoaded ? "No coordinates yet." : "Loading Google Maps…"}
            </div>
          )}

          {/* Help overlay during drawing */}
          {isDrawing && showHelp && (
            <div className="absolute top-4 left-4 right-4 bg-blue-600/95 text-white p-4 rounded-lg shadow-xl border-2 border-blue-400">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">💡 Drawing Tips</p>
                  <ul className="text-xs space-y-1">
                    <li>• Click along the edges of your roof to trace its outline</li>
                    <li>• Start at any corner and work your way around</li>
                    <li>• You need at least 3 points to form a valid area</li>
                    <li>• Use the Undo button if you make a mistake</li>
                  </ul>
                  <p className="text-xs mt-2 opacity-90">Points placed: <strong>{polygonPath.length}</strong></p>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-white/80 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Area display */}
          {calculatedArea !== null && (
            <div className="pointer-events-none absolute top-4 right-4 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-4 shadow-xl border-2 border-white/20">
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wide">Roof Area</p>
              <p className="text-3xl font-bold text-white mt-1">
                {calculatedArea.toFixed(2)}
              </p>
              <p className="text-xs text-white/90">square meters (m²)</p>
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-lg font-semibold text-white">
                  {(calculatedArea * 10.764).toFixed(2)}
                </p>
                <p className="text-xs text-white/90">square feet (sq ft)</p>
              </div>
            </div>
          )}

          {/* Point counter during drawing */}
          {isDrawing && polygonPath.length > 0 && (
            <div className="pointer-events-none absolute top-4 right-4 rounded-lg bg-orange-500/95 px-4 py-2 shadow-lg border-2 border-orange-300">
              <p className="text-sm font-semibold text-white">
                {polygonPath.length} {polygonPath.length === 1 ? 'Point' : 'Points'}
              </p>
              {polygonPath.length >= 3 && (
                <p className="text-xs text-white/90 mt-0.5">Ready to finish!</p>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-600/95 p-3 text-sm text-white shadow-xl border-2 border-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Zoom helper button */}
          <button
            onClick={handleZoomToRoof}
            className="absolute bottom-20 right-4 bg-white/90 hover:bg-white p-3 rounded-lg shadow-lg border border-gray-200 transition-all hover:scale-105"
            title="Zoom to roof"
          >
            <ZoomIn className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isDrawing && polygonPath.length === 0 && (
            <Button 
              onClick={handleStartDrawing} 
              disabled={!mapCenter}
              size="lg"
              className="gap-2 font-semibold"
            >
              🎯 Start Drawing Roof
            </Button>
          )}

          {isDrawing && (
            <>
              <Button 
                onClick={handleFinishDrawing} 
                variant="default"
                size="lg"
                disabled={polygonPath.length < 3}
                className="gap-2 font-semibold bg-green-600 hover:bg-green-700"
              >
                ✓ Finish Drawing
                {polygonPath.length < 3 && ` (${3 - polygonPath.length} more point${3 - polygonPath.length > 1 ? 's' : ''} needed)`}
              </Button>
              <Button 
                onClick={handleUndoLastPoint} 
                variant="outline"
                size="lg"
                disabled={polygonPath.length === 0}
                className="gap-2"
              >
                <Undo className="h-4 w-4" />
                Undo Point
              </Button>
              <Button 
                onClick={handleClearPolygon} 
                variant="outline" 
                size="lg"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </>
          )}

          {polygonPath.length > 0 && !isDrawing && (
            <>
              <Button
                onClick={calculateAreaWithGemini}
                disabled={isCalculating || polygonPath.length < 3}
                size="lg"
                className="gap-2 font-semibold bg-primary"
              >
                <Calculator className="h-4 w-4" />
                {isCalculating ? "Calculating..." : "📐 Calculate Area"}
              </Button>
              <Button 
                onClick={handleStartDrawing} 
                variant="outline"
                size="lg"
                className="gap-2"
              >
                ✏️ Redraw
              </Button>
              <Button 
                onClick={handleClearPolygon} 
                variant="outline" 
                size="lg"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>

        {isDrawing && (
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {polygonPath.length}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  {polygonPath.length === 0 && "👆 Click on your roof to place the first point"}
                  {polygonPath.length === 1 && "Great! Keep clicking to trace around your roof"}
                  {polygonPath.length === 2 && "One more point needed to create a valid area"}
                  {polygonPath.length >= 3 && "Perfect! Continue adding points or click 'Finish Drawing'"}
                </p>
                <p className="text-xs text-blue-700">
                  💡 Tip: Click at each corner or curve of your roof for best accuracy
                </p>
              </div>
            </div>
          </div>
        )}

        {!isDrawing && polygonPath.length >= 3 && !calculatedArea && (
          <div className="rounded-lg bg-green-50 border-2 border-green-300 p-4 text-sm text-green-800">
            <p className="font-semibold mb-1">✓ Roof outline complete!</p>
            <p className="text-xs">
              You can drag the corner points to adjust, or click "Calculate Area" to get your roof measurements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
