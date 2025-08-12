import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StudyInterface from "@/components/study-interface"
import { getQuestions, getTopics } from "@/lib/database"

interface StudyPageProps {
  searchParams: {
    topic?: string
    difficulty?: string
  }
}

export default async function StudyPage({ searchParams }: StudyPageProps) {
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

  // Get questions and topics based on filters
  const [questions, topics] = await Promise.all([
    getQuestions({
      topic: searchParams.topic,
      difficulty: searchParams.difficulty,
      limit: 50, // Load 50 questions for study session
    }),
    getTopics(),
  ])

  return (
    <StudyInterface
      initialQuestions={questions}
      availableTopics={topics}
      selectedTopic={searchParams.topic}
      selectedDifficulty={searchParams.difficulty}
    />
  )
}
