import { createClient } from "@/lib/supabase/server"

export interface Question {
  id: string
  content: string
  correct_answer: number
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  topic: string
  subtopic?: string
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  topic?: string
  questions_studied: number
  correct_answers: number
  time_spent: number
  session_data?: any
  created_at: string
  ended_at?: string
}

export interface UserAttempt {
  id: string
  user_id: string
  question_id: string
  selected_answer: number
  is_correct: boolean
  time_taken?: number
  mode: "study" | "test"
  created_at: string
}

export interface TestResult {
  id: string
  user_id: string
  score: number
  total_questions: number
  percentage: number
  time_taken: number
  test_type: "practice" | "timed" | "topic_specific"
  topics_covered: string[]
  questions_data: any
  created_at: string
}

// Fetch questions with optional filtering
export async function getQuestions(filters?: {
  topic?: string
  difficulty?: string
  limit?: number
  offset?: number
}): Promise<Question[]> {
  const supabase = createClient()

  let query = supabase.from("questions").select("*").order("created_at", { ascending: false })

  if (filters?.topic) {
    query = query.eq("topic", filters.topic)
  }

  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching questions:", error)
    return []
  }

  return data || []
}

// Get unique topics from questions
export async function getTopics(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("questions").select("topic").order("topic")

  if (error) {
    console.error("Error fetching topics:", error)
    return []
  }

  const uniqueTopics = [...new Set(data?.map((item) => item.topic) || [])]
  return uniqueTopics
}

// Record user attempt
export async function recordAttempt(
  questionId: string,
  selectedAnswer: number,
  isCorrect: boolean,
  timeTaken?: number,
  mode: "study" | "test" = "study",
): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase.from("user_attempts").insert({
    user_id: user.id,
    question_id: questionId,
    selected_answer: selectedAnswer,
    is_correct: isCorrect,
    time_taken: timeTaken,
    mode,
  })

  if (error) {
    console.error("Error recording attempt:", error)
    return false
  }

  return true
}

// Start study session
export async function startStudySession(topic?: string): Promise<string | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      topic,
      questions_studied: 0,
      correct_answers: 0,
      time_spent: 0,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error starting study session:", error)
    return null
  }

  return data?.id || null
}

// Update study session
export async function updateStudySession(
  sessionId: string,
  updates: {
    questions_studied?: number
    correct_answers?: number
    time_spent?: number
    ended_at?: string
  },
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("study_sessions").update(updates).eq("id", sessionId)

  if (error) {
    console.error("Error updating study session:", error)
    return false
  }

  return true
}

// Get user's study statistics
export async function getUserStats(): Promise<{
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  studySessions: number
  favoriteTopics: string[]
} | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Get attempt statistics
  const { data: attempts } = await supabase
    .from("user_attempts")
    .select("is_correct, question_id")
    .eq("user_id", user.id)
    .eq("mode", "study")

  // Get study sessions count
  const { data: sessions } = await supabase.from("study_sessions").select("topic").eq("user_id", user.id)

  const totalQuestions = attempts?.length || 0
  const correctAnswers = attempts?.filter((a) => a.is_correct).length || 0
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
  const studySessions = sessions?.length || 0

  // Get favorite topics (most studied)
  const topicCounts =
    sessions?.reduce((acc: Record<string, number>, session) => {
      if (session.topic) {
        acc[session.topic] = (acc[session.topic] || 0) + 1
      }
      return acc
    }, {}) || {}

  const favoriteTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic)

  return {
    totalQuestions,
    correctAnswers,
    accuracy,
    studySessions,
    favoriteTopics,
  }
}

// Create a new test result
export async function createTestResult(
  score: number,
  totalQuestions: number,
  timeTaken: number,
  testType: "practice" | "timed" | "topic_specific" = "practice",
  topicsCovered: string[] = [],
  questionsData: any = {},
): Promise<string | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("test_results")
    .insert({
      user_id: user.id,
      score,
      total_questions: totalQuestions,
      time_taken: timeTaken,
      test_type: testType,
      topics_covered: topicsCovered,
      questions_data: questionsData,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error creating test result:", error)
    return null
  }

  return data?.id || null
}

// Get user's test results
export async function getUserTestResults(): Promise<TestResult[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching test results:", error)
    return []
  }

  return data || []
}

// Get a specific test result
export async function getTestResult(testId: string): Promise<TestResult | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching test result:", error)
    return null
  }

  return data
}

// Get random questions for test
export async function getRandomQuestionsForTest(count = 65): Promise<Question[]> {
  const supabase = createClient()

  // Get a random sample of questions
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(count * 3) // Get more than needed to ensure randomness

  if (error) {
    console.error("Error fetching questions for test:", error)
    return []
  }

  // Shuffle and take the required count
  const shuffled = (data || []).sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Get user's test history
export async function getTestHistory(limit = 10): Promise<
  Array<{
    id: string
    score: number
    total_questions: number
    correct_answers: number
    time_taken: number
    test_date: string
  }>
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("test_results")
    .select("id, score, total_questions, time_taken, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching test history:", error)
    return []
  }

  return (data || []).map((test) => ({
    id: test.id,
    score: test.score,
    total_questions: test.total_questions,
    correct_answers: Math.round((test.score / 100) * test.total_questions),
    time_taken: test.time_taken,
    test_date: test.created_at,
  }))
}

// Get user's study session history
export async function getStudySessionHistory(limit = 10): Promise<
  Array<{
    id: string
    questions_studied: number
    time_spent: number
    created_at: string
  }>
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, questions_studied, time_spent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching study session history:", error)
    return []
  }

  return data || []
}

// Get performance by topic
export async function getPerformanceByTopic(): Promise<
  Array<{
    topic: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
  }>
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Get all attempts with question topics
  const { data, error } = await supabase
    .from("user_attempts")
    .select(`
      is_correct,
      questions (topic)
    `)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching performance by topic:", error)
    return []
  }

  // Group by topic and calculate stats
  const topicStats: Record<string, { total: number; correct: number }> = {}

  data?.forEach((attempt) => {
    const topic = (attempt.questions as any)?.topic
    if (topic) {
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0 }
      }
      topicStats[topic].total++
      if (attempt.is_correct) {
        topicStats[topic].correct++
      }
    }
  })

  return Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
}

// Get progress over time (weekly)
export async function getProgressOverTime(): Promise<
  Array<{
    week: string
    totalQuestions: number
    correctAnswers: number
    accuracy: number
  }>
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Get attempts from the last 8 weeks
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  const { data, error } = await supabase
    .from("user_attempts")
    .select("is_correct, created_at")
    .eq("user_id", user.id)
    .gte("created_at", eightWeeksAgo.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching progress over time:", error)
    return []
  }

  // Group by week
  const weeklyStats: Record<string, { total: number; correct: number }> = {}

  data?.forEach((attempt) => {
    const date = new Date(attempt.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split("T")[0]

    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { total: 0, correct: 0 }
    }
    weeklyStats[weekKey].total++
    if (attempt.is_correct) {
      weeklyStats[weekKey].correct++
    }
  })

  return Object.entries(weeklyStats)
    .map(([week, stats]) => ({
      week,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    }))
    .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
}

// Get recent activity
export async function getRecentActivity(limit = 10): Promise<
  Array<{
    type: "test" | "study"
    date: string
    data: any
  }>
> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // Get recent test results
  const { data: tests } = await supabase
    .from("test_results")
    .select("score, total_questions, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  // Get recent study sessions
  const { data: sessions } = await supabase
    .from("study_sessions")
    .select("questions_studied, time_spent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  const activities: Array<{
    type: "test" | "study"
    date: string
    data: any
  }> = []

  // Add test activities
  tests?.forEach((test) => {
    activities.push({
      type: "test",
      date: test.created_at,
      data: {
        score: test.score,
        total_questions: test.total_questions,
      },
    })
  })

  // Add study activities
  sessions?.forEach((session) => {
    activities.push({
      type: "study",
      date: session.created_at,
      data: {
        questions_studied: session.questions_studied,
        time_spent: session.time_spent,
      },
    })
  })

  // Sort by date and limit
  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}
