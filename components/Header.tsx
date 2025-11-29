import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const router = useRouter()

  const isActive = (path: string) => router.pathname === path

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">☀️ Solar Estimator</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              className={cn(
                isActive("/") && "bg-primary text-primary-foreground"
              )}
            >
              Home
            </Button>
          </Link>
          <Link href="/upload">
            <Button
              variant={isActive("/upload") ? "default" : "ghost"}
              className={cn(
                isActive("/upload") && "bg-primary text-primary-foreground"
              )}
            >
              Upload
            </Button>
          </Link>
          <Link href="/results">
            <Button
              variant={isActive("/results") ? "default" : "ghost"}
              className={cn(
                isActive("/results") && "bg-primary text-primary-foreground"
              )}
            >
              Results
            </Button>
          </Link>
          <Link href="/roi">
            <Button
              variant={isActive("/roi") ? "default" : "ghost"}
              className={cn(
                isActive("/roi") && "bg-primary text-primary-foreground"
              )}
            >
              ROI Calculator
            </Button>
          </Link>
          <Link href="/why-install">
            <Button
              variant={isActive("/why-install") ? "default" : "ghost"}
              className={cn(
                isActive("/why-install") && "bg-primary text-primary-foreground"
              )}
            >
              Why Install
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

