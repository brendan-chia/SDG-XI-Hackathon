import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleGenerativeAI } from "@google/generative-ai"

type Coordinates = {
  lat: number
  lng: number
}

type RequestBody = {
  area: number
  coordinates: Coordinates[]
  address: string
}

type ResponseData = {
  insights?: string
  recommendations?: string[]
  solarPotential?: {
    estimatedPanels: number
    estimatedCapacity: string
    estimatedAnnualProduction: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    return res.status(500).json({ error: "Gemini API key not configured" })
  }

  try {
    const { area, coordinates, address }: RequestBody = req.body

    if (!area || !coordinates || coordinates.length < 3) {
      return res.status(400).json({ error: "Invalid request data" })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create a detailed prompt for Gemini
    const prompt = `
You are a solar energy expert analyzing a roof for solar panel installation potential.

Roof Details:
- Address: ${address}
- Calculated roof area: ${area.toFixed(2)} square meters (${(area * 10.764).toFixed(2)} square feet)
- Number of roof outline points: ${coordinates.length}
- Roof polygon coordinates: ${JSON.stringify(coordinates.slice(0, 5))}... (showing first 5 points)

Please provide:
1. A brief assessment of the roof size for solar panel installation
2. Estimated number of solar panels that could fit (assuming standard 1.7m² per panel and 80% usable area)
3. Estimated solar system capacity in kW (assuming 400W panels)
4. Estimated annual energy production in Malaysia's climate (4.5 peak sun hours average)
5. 3-5 practical recommendations for maximizing solar potential

Format your response as JSON with this structure:
{
  "insights": "brief assessment text",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "solarPotential": {
    "estimatedPanels": number,
    "estimatedCapacity": "X.X kW",
    "estimatedAnnualProduction": "X,XXX kWh"
  }
}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse JSON response from Gemini
    let parsedResponse: ResponseData
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      parsedResponse = JSON.parse(jsonText)
    } catch (parseError) {
      // If parsing fails, create a structured response from the text
      console.error("Failed to parse Gemini response as JSON:", parseError)
      
      // Calculate fallback values
      const usableArea = area * 0.8 // 80% usable
      const panelArea = 1.7 // square meters per panel
      const estimatedPanels = Math.floor(usableArea / panelArea)
      const panelWattage = 400
      const estimatedCapacity = (estimatedPanels * panelWattage) / 1000 // in kW
      const peakSunHours = 4.5
      const estimatedAnnualProduction = Math.round(estimatedCapacity * peakSunHours * 365)

      parsedResponse = {
        insights: text.substring(0, 300) + "...",
        recommendations: [
          "Ensure roof structure can support panel weight",
          "Consider panel orientation for optimal sun exposure",
          "Regular cleaning and maintenance for efficiency",
        ],
        solarPotential: {
          estimatedPanels,
          estimatedCapacity: `${estimatedCapacity.toFixed(1)} kW`,
          estimatedAnnualProduction: `${estimatedAnnualProduction.toLocaleString()} kWh`,
        },
      }
    }

    return res.status(200).json(parsedResponse)
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to analyze roof area",
    })
  }
}
