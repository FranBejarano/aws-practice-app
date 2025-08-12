import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TestInterface from "@/components/test-interface"
import { getRandomQuestionsForTest } from "@/lib/database"

interface TestPageProps {
  searchParams: {
    mode?: "practice" | "timed"
    questions?: string
  }
}

export default async function TestPage({ searchParams }: TestPageProps) {
  // Check Supabase configuration
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Check authentication
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get test configuration
  const mode = searchParams.mode || "practice"
  const questionCount = Number.parseInt(searchParams.questions || "65")

  // Get random questions for the test
  const questions = await getRandomQuestionsForTest(questionCount)

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h1>
          <p className="text-gray-600 mb-4">There are no questions available for the test.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <TestInterface
      questions={questions}
      mode={mode}
      timeLimit={mode === "timed" ? 90 * 60 : undefined} // 90 minutes for timed mode
    />
  )
}
