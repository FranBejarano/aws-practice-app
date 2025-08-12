"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Loader2, RefreshCw, TrendingUp, AlertCircle } from "lucide-react"

interface StudyRecommendationsProps {
  topic: string
  difficulty: "easy" | "medium" | "hard"
  userPerformance?: { correct: number; total: number }
  autoGenerate?: boolean
}

export default function StudyRecommendations({
  topic,
  difficulty,
  userPerformance,
  autoGenerate = false,
}: StudyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<string[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/study-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          userPerformance,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate recommendations")
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (err) {
      setError("Failed to generate study recommendations. Please try again.")
      console.error("Error generating recommendations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoGenerate) {
      generateRecommendations()
    }
  }, [autoGenerate, topic, difficulty])

  const getPerformanceColor = () => {
    if (!userPerformance) return "text-gray-600"
    const percentage = (userPerformance.correct / userPerformance.total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-green-800">
          <TrendingUp className="h-5 w-5" />
          AI Study Recommendations
        </CardTitle>
        {userPerformance && (
          <div className={`text-sm ${getPerformanceColor()}`}>
            Current performance: {userPerformance.correct}/{userPerformance.total} (
            {((userPerformance.correct / userPerformance.total) * 100).toFixed(1)}%)
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {!recommendations && !autoGenerate ? (
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-green-400" />
            <p className="text-green-700 mb-4">Get personalized study recommendations for {topic}</p>
            <Button onClick={generateRecommendations} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Study Recommendations
                </>
              )}
            </Button>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-3">Recommended Study Areas</h4>
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 text-green-700">
                    <div className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-green-200">
              <Button
                onClick={generateRecommendations}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-green-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Get New Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-green-600 animate-spin" />
            <p className="text-green-700">Generating personalized recommendations...</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
