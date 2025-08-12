"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MarkdownRenderer from "./markdown-renderer"
import { Sparkles, Lightbulb, BookOpen, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIExplanation {
  explanation: string
  keyPoints: string[]
  relatedConcepts: string[]
  studyTips: string[]
  commonMistakes?: string[]
}

interface AIExplanationProps {
  questionContent: string
  correctAnswer: number
  options: string[]
  userAnswer?: number
  topic: string
  difficulty: "easy" | "medium" | "hard"
  existingExplanation?: string
  className?: string
}

export default function AIExplanationComponent({
  questionContent,
  correctAnswer,
  options,
  userAnswer,
  topic,
  difficulty,
  existingExplanation,
  className,
}: AIExplanationProps) {
  const [aiExplanation, setAiExplanation] = useState<AIExplanation | null>(null)
  const [personalizedExplanation, setPersonalizedExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const generateExplanation = async (type: "standard" | "personalized" = "standard") => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          questionContent,
          correctAnswer,
          options,
          userAnswer,
          topic,
          difficulty,
          existingExplanation,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate explanation")
      }

      const data = await response.json()

      if (type === "personalized") {
        setPersonalizedExplanation(data.explanation)
      } else {
        setAiExplanation(data.explanation)
        setHasGenerated(true)
      }
    } catch (err) {
      setError("Failed to generate AI explanation. Please try again.")
      console.error("Error generating explanation:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const isIncorrect = userAnswer !== undefined && userAnswer !== correctAnswer

  return (
    <div className={cn("space-y-4", className)}>
      {/* Existing explanation */}
      {existingExplanation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownRenderer content={existingExplanation} />
          </CardContent>
        </Card>
      )}

      {/* Personalized explanation for incorrect answers */}
      {isIncorrect && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Why This Answer?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {personalizedExplanation ? (
              <div className="text-orange-800">
                <MarkdownRenderer content={personalizedExplanation} />
              </div>
            ) : (
              <Button
                onClick={() => generateExplanation("personalized")}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-orange-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Personalized Explanation
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI-Enhanced Explanation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Sparkles className="h-5 w-5" />
            AI-Enhanced Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {!aiExplanation && !hasGenerated ? (
            <div className="text-center py-6">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <p className="text-blue-700 mb-4">Get an AI-powered explanation with key insights and study tips</p>
              <Button
                onClick={() => generateExplanation("standard")}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating AI Explanation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Explanation
                  </>
                )}
              </Button>
            </div>
          ) : aiExplanation ? (
            <div className="space-y-6">
              {/* Main explanation */}
              <div>
                <MarkdownRenderer content={aiExplanation.explanation} className="text-blue-800" />
              </div>

              {/* Key Points */}
              {aiExplanation.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Key Points
                  </h4>
                  <ul className="space-y-2">
                    {aiExplanation.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-blue-700">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Concepts */}
              {aiExplanation.relatedConcepts.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3">Related AWS Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiExplanation.relatedConcepts.map((concept, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Tips */}
              {aiExplanation.studyTips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Study Tips
                  </h4>
                  <ul className="space-y-2">
                    {aiExplanation.studyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-blue-700">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {aiExplanation.commonMistakes && aiExplanation.commonMistakes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Common Mistakes to Avoid
                  </h4>
                  <ul className="space-y-2">
                    {aiExplanation.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2 text-blue-700">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate button */}
              <div className="pt-4 border-t border-blue-200">
                <Button
                  onClick={() => generateExplanation("standard")}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate Explanation
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
