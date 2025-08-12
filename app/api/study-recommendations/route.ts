import { type NextRequest, NextResponse } from "next/server"
import { generateStudyRecommendations } from "@/lib/ai-explanations"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { topic, difficulty, userPerformance } = body

    if (!topic || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const recommendations = await generateStudyRecommendations(topic, difficulty, userPerformance)

    if (!recommendations) {
      return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error in study recommendations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
