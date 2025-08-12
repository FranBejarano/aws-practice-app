"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import QuestionRenderer from "./question-renderer"
import { createTestResult, recordAttempt } from "@/lib/database"
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle, Target, Home } from "lucide-react"
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

interface TestInterfaceProps {
  questions: Question[]
  mode: "practice" | "timed"
  timeLimit?: number // in seconds
}

export default function TestInterface({ questions, mode, timeLimit }: TestInterfaceProps) {
  const router = useRouter()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitWarning, setShowSubmitWarning] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(userAnswers).length
  const unansweredCount = questions.length - answeredCount

  // Timer effect
  useEffect(() => {
    if (!timeLimit || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitTest(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLimit, timeRemaining])

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (answer: number) => {
      if (!currentQuestion) return

      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
    },
    [currentQuestion],
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

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  // Flag/unflag question
  const toggleFlag = () => {
    if (!currentQuestion) return

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      return newSet
    })
  }

  // Submit test
  const handleSubmitTest = async (autoSubmit = false) => {
    if (!autoSubmit && unansweredCount > 0) {
      setShowSubmitWarning(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate score
      let correctAnswers = 0
      const questionsData: any = {}

      for (const question of questions) {
        const userAnswer = userAnswers[question.id]
        const isCorrect = userAnswer === question.correct_answer

        if (isCorrect) correctAnswers++

        questionsData[question.id] = {
          question_content: question.content,
          user_answer: userAnswer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          topic: question.topic,
          difficulty: question.difficulty,
          flagged: flaggedQuestions.has(question.id),
        }

        // Record individual attempt
        if (userAnswer !== undefined) {
          await recordAttempt(question.id, userAnswer, isCorrect, undefined, "test")
        }
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const topicsCovered = [...new Set(questions.map((q) => q.topic))]

      // Create test result
      const testResultId = await createTestResult(
        correctAnswers,
        questions.length,
        timeTaken,
        mode,
        topicsCovered,
        questionsData,
      )

      if (testResultId) {
        router.push(`/test/results/${testResultId}`)
      } else {
        throw new Error("Failed to save test results")
      }
    } catch (error) {
      console.error("Error submitting test:", error)
      alert("There was an error submitting your test. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = (answeredCount / questions.length) * 100
  const timeWarning = timeLimit && timeRemaining < 300 // 5 minutes warning

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <h1 className="text-lg font-semibold">{mode === "timed" ? "Timed Practice Test" : "Practice Test"}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {timeLimit && (
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                    timeWarning ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
              )}

              {/* Progress */}
              <div className="text-sm text-gray-600">
                {answeredCount} / {questions.length} answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Time Warning */}
      {timeWarning && (
        <Alert className="mx-4 mt-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Less than 5 minutes remaining! Make sure to answer all questions.
          </AlertDescription>
        </Alert>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <QuestionRenderer
                question={currentQuestion}
                selectedAnswer={userAnswers[currentQuestion.id]}
                onAnswerSelect={handleAnswerSelect}
                showResult={false}
                showExplanation={false}
                mode="test"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button onClick={goToPrevious} disabled={currentQuestionIndex === 0} variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleFlag}
                  variant={flaggedQuestions.has(currentQuestion?.id || "") ? "default" : "outline"}
                  size="sm"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.has(currentQuestion?.id || "") ? "Flagged" : "Flag"}
                </Button>

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
            {/* Question Navigator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((question, index) => {
                    const isAnswered = userAnswers[question.id] !== undefined
                    const isFlagged = flaggedQuestions.has(question.id)
                    const isCurrent = index === currentQuestionIndex

                    return (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`
                          relative aspect-square text-xs font-medium rounded border-2 transition-colors
                          ${
                            isCurrent
                              ? "border-blue-500 bg-blue-100 text-blue-800"
                              : "border-gray-200 hover:border-gray-300"
                          }
                          ${isAnswered ? "bg-green-100 text-green-800" : "bg-white text-gray-600"}
                        `}
                      >
                        {index + 1}
                        {isFlagged && <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-500" />}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span>Not answered ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-500" />
                    <span>Flagged ({flaggedQuestions.size})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {unansweredCount > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>You have {unansweredCount} unanswered questions.</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => handleSubmitTest()}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Test
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Exit Test
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Confirm Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have {unansweredCount} unanswered questions. Are you sure you want to submit your test?</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleSubmitTest(true)}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Yes, Submit
                </Button>
                <Button onClick={() => setShowSubmitWarning(false)} variant="outline" className="flex-1">
                  Continue Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
