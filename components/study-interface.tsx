"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import QuestionRenderer from "./question-renderer"
import { recordAttempt, startStudySession, updateStudySession } from "@/lib/database"
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Home, Filter, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Question {
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
}

interface StudyInterfaceProps {
  initialQuestions: Question[]
  availableTopics: string[]
  selectedTopic?: string
  selectedDifficulty?: string
}

export default function StudyInterface({
  initialQuestions,
  availableTopics,
  selectedTopic,
  selectedDifficulty,
}: StudyInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [questions] = useState<Question[]>(initialQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    startTime: Date.now(),
  })

  const currentQuestion = questions[currentQuestionIndex]
  const hasAnswered = currentQuestion && userAnswers[currentQuestion.id] !== undefined
  const showResult = currentQuestion && showResults[currentQuestion.id]

  // Initialize study session
  useEffect(() => {
    const initSession = async () => {
      const id = await startStudySession(selectedTopic)
      setSessionId(id)
    }
    initSession()
  }, [selectedTopic])

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    async (answer: number) => {
      if (!currentQuestion || hasAnswered) return

      const isCorrect = answer === currentQuestion.correct_answer

      // Update local state
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
      setShowResults((prev) => ({ ...prev, [currentQuestion.id]: true }))

      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      }))

      // Record attempt in database
      await recordAttempt(currentQuestion.id, answer, isCorrect, undefined, "study")

      // Update study session
      if (sessionId) {
        await updateStudySession(sessionId, {
          questions_studied: sessionStats.questionsAnswered + 1,
          correct_answers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
          time_spent: Math.floor((Date.now() - sessionStats.startTime) / 1000),
        })
      }
    },
    [currentQuestion, hasAnswered, sessionStats, sessionId],
  )

  // Navigation functions
  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const resetSession = () => {
    setUserAnswers({})
    setShowResults({})
    setCurrentQuestionIndex(0)
    setSessionStats({
      questionsAnswered: 0,
      correctAnswers: 0,
      startTime: Date.now(),
    })
  }

  // Handle filter changes
  const handleTopicChange = (topic: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (topic === "all") {
      params.delete("topic")
    } else {
      params.set("topic", topic)
    }
    router.push(`/study?${params.toString()}`)
  }

  const handleDifficultyChange = (difficulty: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (difficulty === "all") {
      params.delete("difficulty")
    } else {
      params.set("difficulty", difficulty)
    }
    router.push(`/study?${params.toString()}`)
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Questions Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">No questions match your current filters. Try adjusting your selection.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const accuracy =
    sessionStats.questionsAnswered > 0 ? (sessionStats.correctAnswers / sessionStats.questionsAnswered) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold">Study Mode</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={selectedTopic || "all"} onValueChange={handleTopicChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {availableTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty || "all"} onValueChange={handleDifficultyChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={resetSession} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <QuestionRenderer
                question={currentQuestion}
                selectedAnswer={userAnswers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                showResult={showResult}
                showExplanation={showResult}
                mode="study"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button onClick={goToPrevious} disabled={currentQuestionIndex === 0} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <Button onClick={goToNext} disabled={currentQuestionIndex === questions.length - 1} variant="outline">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Questions Answered</span>
                    <span>
                      {sessionStats.questionsAnswered} / {questions.length}
                    </span>
                  </div>
                  <Progress value={(sessionStats.questionsAnswered / questions.length) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-lg font-semibold text-green-800">{sessionStats.correctAnswers}</div>
                    <div className="text-xs text-green-600">Correct</div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-lg font-semibold text-red-800">
                      {sessionStats.questionsAnswered - sessionStats.correctAnswers}
                    </div>
                    <div className="text-xs text-red-600">Incorrect</div>
                  </div>
                </div>

                {sessionStats.questionsAnswered > 0 && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{accuracy.toFixed(1)}%</div>
                    <div className="text-sm text-blue-600">Accuracy</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = userAnswers[question.id] !== undefined
                    const isCorrect = isAnswered && userAnswers[question.id] === question.correct_answer
                    const isCurrent = index === currentQuestionIndex

                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          aspect-square text-xs font-medium rounded border-2 transition-colors
                          ${
                            isCurrent
                              ? "border-blue-500 bg-blue-100 text-blue-800"
                              : "border-gray-200 hover:border-gray-300"
                          }
                          ${
                            isAnswered
                              ? isCorrect
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              : "bg-white text-gray-600"
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Current Filters */}
            {(selectedTopic || selectedDifficulty) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedTopic && <Badge variant="secondary">Topic: {selectedTopic}</Badge>}
                    {selectedDifficulty && <Badge variant="secondary">Level: {selectedDifficulty}</Badge>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
