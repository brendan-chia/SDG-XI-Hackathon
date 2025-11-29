import { useEffect, useMemo, useState } from "react"
import { GoogleMap, Marker, Circle, useLoadScript } from "@react-google-maps/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

type Coordinates = {
  lat: number
  lng: number
}

interface GoogleMapVisualizationProps {
  coordinates: Coordinates | null
  shadingPercent: number
  estimatedDailyKwh?: number | null
  address: string
  useCurrentLocation: boolean
}

const DEFAULT_CENTER: Coordinates = { lat: 3.139, lng: 101.6869 }
const DEFAULT_ZOOM = 18
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"]

export default function GoogleMapVisualization({
  coordinates,
  shadingPercent,
  estimatedDailyKwh,
  address,
  useCurrentLocation,
}: GoogleMapVisualizationProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(coordinates)

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

  const shadingRadius = useMemo(() => {
    const minRadius = 15
    const maxRadius = 80
    return minRadius + ((shadingPercent / 100) * (maxRadius - minRadius))
  }, [shadingPercent])

  const mapDescription = useMemo(() => {
    if (!coordinates) {
      return "Enter an address or enable current location to preview your roof."
    }
    if (useCurrentLocation) {
      return "Using your current location. Drag to fine-tune the marker if needed."
    }
    return "Live preview based on the address you entered."
  }, [coordinates, useCurrentLocation])

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Maps Preview</CardTitle>
          <CardDescription>Interactive map preview of your roof</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Missing <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
              Add your Google Maps API key to enable this preview.
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Maps Preview</CardTitle>
        <CardDescription>{mapDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && (
          <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Unable to load Google Maps. Please verify your API key.
          </div>
        )}
        <div className="relative h-96 w-full overflow-hidden rounded-lg border">
          {isLoaded && mapCenter ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter ?? DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              options={{
                mapTypeId: "hybrid",
                disableDefaultUI: true,
                zoomControl: true,
                tilt: 45,
              }}
            >
              <Marker position={mapCenter} />
              <Circle
                center={mapCenter}
                radius={shadingRadius}
                options={{
                  strokeColor: "#f97316",
                  strokeOpacity: 0.8,
                  strokeWeight: 1,
                  fillColor: "#fbbf24",
                  fillOpacity: 0.25,
                }}
              />
            </GoogleMap>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {isLoaded ? "No coordinates yet." : "Loading Google Maps…"}
            </div>
          )}

          {mapCenter && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-background/90 p-3 text-xs shadow-lg">
              <p className="font-semibold">{useCurrentLocation ? "Current Location" : "Address Preview"}</p>
              {address && !useCurrentLocation && (
                <p className="text-[11px] text-muted-foreground break-all">{address}</p>
              )}
              {typeof estimatedDailyKwh === "number" && (
                <p className="mt-2 text-sm font-semibold text-primary">
                  Est. Daily Output: {estimatedDailyKwh.toFixed(1)} kWh/day
                </p>
              )}
              <p className="text-muted-foreground">Shading: {shadingPercent}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

