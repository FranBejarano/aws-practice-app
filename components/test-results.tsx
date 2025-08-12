"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuestionRenderer from "./question-renderer"
import { Trophy, Clock, Target, TrendingUp, CheckCircle, XCircle, Flag, Home, RotateCcw } from "lucide-react"
import Link from "next/link"

interface TestResult {
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

interface TestResultsProps {
  testResult: TestResult
}

export default function TestResults({ testResult }: TestResultsProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)

  const questionsData = testResult.questions_data || {}
  const questionIds = Object.keys(questionsData)

  const correctCount = testResult.score
  const incorrectCount = testResult.total_questions - testResult.score
  const unansweredCount = testResult.total_questions - questionIds.length

  // Calculate topic performance
  const topicPerformance = testResult.topics_covered.reduce((acc: Record<string, any>, topic) => {
    const topicQuestions = questionIds.filter((id) => questionsData[id].topic === topic)
    const topicCorrect = topicQuestions.filter((id) => questionsData[id].is_correct).length

    acc[topic] = {
      total: topicQuestions.length,
      correct: topicCorrect,
      percentage: topicQuestions.length > 0 ? (topicCorrect / topicQuestions.length) * 100 : 0,
    }

    return acc
  }, {})

  // Get performance level
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 80) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (percentage >= 70) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (percentage >= 60) return { level: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    return { level: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-100" }
  }

  const performance = getPerformanceLevel(testResult.percentage)

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const selectedQuestion = selectedQuestionId ? questionsData[selectedQuestionId] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
                <p className="text-gray-600">
                  {testResult.test_type === "timed" ? "Timed Practice Test" : "Practice Test"} •{" "}
                  {new Date(testResult.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/test">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Take Another Test
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2" style={{ color: performance.color.replace("text-", "") }}>
                  {testResult.percentage.toFixed(1)}%
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color}`}
                >
                  {performance.level}
                </div>
                <div className="mt-4 text-gray-600">
                  {testResult.score} out of {testResult.total_questions} questions correct
                </div>
                <Progress value={testResult.percentage} className="mt-4 h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(testResult.time_taken)}</div>
              <div className="text-sm text-gray-600 mt-1">
                Avg: {Math.round(testResult.time_taken / testResult.total_questions)}s per question
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Correct: {correctCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Incorrect: {incorrectCount}</span>
                </div>
                {unansweredCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-400"></div>
                    <span className="text-sm">Unanswered: {unansweredCount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topics">Topic Performance</TabsTrigger>
            <TabsTrigger value="questions">Question Review</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(topicPerformance).map(([topic, data]: [string, any]) => (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{topic}</span>
                        <span className="text-sm text-gray-600">
                          {data.correct}/{data.total} ({data.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={data.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {questionIds.map((questionId, index) => {
                      const questionData = questionsData[questionId]
                      const isSelected = selectedQuestionId === questionId

                      return (
                        <button
                          key={questionId}
                          onClick={() => setSelectedQuestionId(questionId)}
                          className={`
                            w-full text-left p-3 rounded-lg border transition-colors
                            ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Q{index + 1}</span>
                            <div className="flex items-center gap-1">
                              {questionData.flagged && <Flag className="h-3 w-3 text-orange-500" />}
                              {questionData.user_answer !== undefined ? (
                                questionData.is_correct ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-400"></div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{questionData.topic}</div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Question Detail */}
              <div className="lg:col-span-3">
                {selectedQuestion ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Question Review</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{selectedQuestion.topic}</Badge>
                          {selectedQuestion.flagged && (
                            <Badge variant="outline" className="text-orange-600">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <QuestionRenderer
                        question={{
                          id: selectedQuestionId!,
                          content: selectedQuestion.question_content,
                          correct_answer: selectedQuestion.correct_answer,
                          option_a: "Option A", // These would need to be stored in questions_data
                          option_b: "Option B",
                          option_c: "Option C",
                          option_d: "Option D",
                          difficulty: selectedQuestion.difficulty,
                          topic: selectedQuestion.topic,
                          explanation: "Detailed explanation would go here",
                        }}
                        selectedAnswer={selectedQuestion.user_answer}
                        showResult={true}
                        showExplanation={true}
                        mode="test"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a question to review</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(topicPerformance)
                      .filter(([, data]: [string, any]) => data.percentage >= 70)
                      .map(([topic, data]: [string, any]) => (
                        <div key={topic} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            <strong>{topic}</strong> - {data.percentage.toFixed(1)}% correct
                          </span>
                        </div>
                      ))}
                    {Object.entries(topicPerformance).filter(([, data]: [string, any]) => data.percentage >= 70)
                      .length === 0 && (
                      <p className="text-gray-600 text-sm">
                        Focus on improving performance across all topics to identify strengths.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(topicPerformance)
                      .filter(([, data]: [string, any]) => data.percentage < 70)
                      .sort(([, a]: [string, any], [, b]: [string, any]) => a.percentage - b.percentage)
                      .map(([topic, data]: [string, any]) => (
                        <div key={topic} className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">
                            <strong>{topic}</strong> - {data.percentage.toFixed(1)}% correct
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
