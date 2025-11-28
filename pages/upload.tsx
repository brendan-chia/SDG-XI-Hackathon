import { useState } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload as UploadIcon, MapPin, Image as ImageIcon } from "lucide-react"

export default function Upload() {
  const router = useRouter()
  const [uploadMethod, setUploadMethod] = useState<"image" | "address">("image")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [address, setAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    if (uploadMethod === "image" && !selectedImage) {
      alert("Please upload an image first")
      return
    }
    if (uploadMethod === "address" && !address.trim()) {
      alert("Please enter an address first")
      return
    }

    setIsAnalyzing(true)
    
    // Simulate analysis delay
    setTimeout(() => {
      // Store mock data in sessionStorage for results page
      if (typeof window !== "undefined") {
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
          <p className="text-muted-foreground">
            Upload an image of your roof or enter an address to get started
          </p>
        </div>

        {/* Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Analysis Method</CardTitle>
            <CardDescription>
              Select how you want to provide roof information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant={uploadMethod === "image" ? "default" : "outline"}
                className="h-auto flex-col space-y-2 p-6"
                onClick={() => setUploadMethod("image")}
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-lg">Upload Image</span>
              </Button>
              <Button
                variant={uploadMethod === "address" ? "default" : "outline"}
                className="h-auto flex-col space-y-2 p-6"
                onClick={() => setUploadMethod("address")}
              >
                <MapPin className="h-8 w-8" />
                <span className="text-lg">Enter Address</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        {uploadMethod === "image" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Roof Image</CardTitle>
              <CardDescription>
                Upload a clear image of your roof from above or at an angle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {selectedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                    <img
                      src={selectedImage}
                      alt="Roof preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Address Input Section */}
        {uploadMethod === "address" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Address</CardTitle>
              <CardDescription>
                Enter your address to view satellite imagery of your roof
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="123 Main St, City, State, ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-lg"
              />
              <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Google Maps satellite view will appear here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Mock implementation - enter address to proceed)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing || (uploadMethod === "image" && !selectedImage) || (uploadMethod === "address" && !address.trim())}
            className="text-lg px-8 py-6"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Roof"}
          </Button>
        </div>
      </div>
    </div>
  )
}

