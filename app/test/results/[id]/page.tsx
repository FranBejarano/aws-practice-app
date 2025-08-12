import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getTestResult } from "@/lib/database"
import TestResults from "@/components/test-results"

interface TestResultsPageProps {
  params: {
    id: string
  }
}

export default async function TestResultsPage({ params }: TestResultsPageProps) {
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

  // Get test result
  const testResult = await getTestResult(params.id)

  if (!testResult) {
    notFound()
  }

  return <TestResults testResult={testResult} />
}
