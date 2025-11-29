export type PanelOption = {
  id: string
  brand: string
  model: string
  panelEfficiency: number
  pricePerKw: number
  fixedInstallFee: number
  warrantyYears: number
  maintenance: string
  solarIrradiance?: number
  panelWattage: number
  imageUrl: string
}

export const PANEL_OPTIONS: PanelOption[] = [
  {
    id: "helios-pro",
    brand: "Helios",
    model: "Pro 420",
    panelEfficiency: 0.22,
    pricePerKw: 2100,
    fixedInstallFee: 3500,
    warrantyYears: 25,
    maintenance: "Annual inspection plus panel washing twice a year.",
    solarIrradiance: 5.2,
    panelWattage: 420,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "lumina-max",
    brand: "Lumina",
    model: "Max 400",
    panelEfficiency: 0.205,
    pricePerKw: 1950,
    fixedInstallFee: 3000,
    warrantyYears: 20,
    maintenance: "Owner rinsing every quarter; professional servicing yearly.",
    solarIrradiance: 5.0,
    panelWattage: 400,
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "solis-lite",
    brand: "Solis",
    model: "Lite 385",
    panelEfficiency: 0.195,
    pricePerKw: 1750,
    fixedInstallFee: 2500,
    warrantyYears: 18,
    maintenance: "Quarterly debris check; deep clean every 18 months.",
    solarIrradiance: 4.8,
    panelWattage: 385,
    imageUrl: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=400&q=80",
  },
]

