import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, DollarSign, TrendingUp } from "lucide-react"

export default function Home() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/upload")
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-8 py-20 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Solar Potential Estimator
          </h1>
          <p className="mx-auto max-w-[700px] text-xl text-muted-foreground">
            Discover your roof&apos;s solar potential and estimate your energy savings. 
            Upload a roof image or enter an address to get started.
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={handleGetStarted}
          className="text-lg px-8 py-6"
        >
          Estimate Your Roof Potential
        </Button>
      </section>

      {/* Features Section */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Sun className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Roof Analysis</CardTitle>
              <CardDescription>
                Analyze your roof orientation and shading to determine solar potential
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Energy Generation</CardTitle>
              <CardDescription>
                Get estimates of monthly and yearly solar energy generation
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Cost Savings</CardTitle>
              <CardDescription>
                Calculate potential savings on your electricity bills
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Quick Results</CardTitle>
              <CardDescription>
                Get instant estimates with our easy-to-use interface
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-16">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">
              Get your solar potential estimate in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Upload or Enter Address</h3>
              <p className="text-muted-foreground">
                Upload an image of your roof or enter your address for satellite view
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Analyze Your Roof</h3>
              <p className="text-muted-foreground">
                Our system analyzes roof orientation, shading, and area
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">View Results</h3>
              <p className="text-muted-foreground">
                Get detailed estimates of solar generation and potential savings
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

