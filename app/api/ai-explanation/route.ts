import { type NextRequest, NextResponse } from "next/server"
import {
  generateAIExplanation,
  generatePersonalizedExplanation,
  type AIExplanationRequest,
} from "@/lib/ai-explanations"
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
    const { type, ...explanationRequest }: { type: "standard" | "personalized" } & AIExplanationRequest = body

    // Validate required fields
    if (
      !explanationRequest.questionContent ||
      !explanationRequest.options ||
      explanationRequest.correctAnswer === undefined
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let result
    if (type === "personalized") {
      result = await generatePersonalizedExplanation(explanationRequest)
    } else {
      result = await generateAIExplanation(explanationRequest)
    }

    if (!result) {
      return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 })
    }

    return NextResponse.json({ explanation: result })
  } catch (error) {
    console.error("Error in AI explanation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
