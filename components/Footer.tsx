export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Solar Potential Estimator. Prototype version.
          </p>
          <p className="text-xs text-muted-foreground">
            This is a demonstration app. Results are simulated and not based on actual solar calculations.
          </p>
        </div>
      </div>
    </footer>
  )
}

