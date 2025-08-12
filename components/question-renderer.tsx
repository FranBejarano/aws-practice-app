"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import MarkdownRenderer from "./markdown-renderer"
import AIExplanationComponent from "./ai-explanation"
import StudyRecommendations from "./study-recommendations"
import { parseQuestionContent, type ParsedQuestion } from "@/lib/markdown"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, Code, ImageIcon } from "lucide-react"

interface QuestionRendererProps {
  question: {
    id: string
    content: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: number
    explanation?: string
    difficulty: "easy" | "medium" | "hard"
    topic: string
    subtopic?: string
  }
  selectedAnswer?: number
  onAnswerSelect?: (answer: number) => void
  showResult?: boolean
  showExplanation?: boolean
  mode?: "study" | "test"
  timeSpent?: number
}

export default function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  showExplanation = false,
  mode = "study",
  timeSpent,
}: QuestionRendererProps) {
  const [parsedQuestion] = useState<ParsedQuestion>(() => parseQuestionContent(question.content))

  const options = [question.option_a, question.option_b, question.option_c, question.option_d]

  const isCorrect = selectedAnswer === question.correct_answer
  const hasAnswered = selectedAnswer !== undefined

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-6">
          {/* Question Header */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline">{question.topic}</Badge>
            {question.subtopic && (
              <Badge variant="outline" className="text-xs">
                {question.subtopic}
              </Badge>
            )}
            {parsedQuestion.codeBlocks.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                Code
              </Badge>
            )}
            {parsedQuestion.hasImages && (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Images
              </Badge>
            )}
            {timeSpent && (
              <Badge variant="outline" className="text-xs ml-auto">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}
              </Badge>
            )}
          </div>

          {/* AWS Services Used */}
          {parsedQuestion.awsServices.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">AWS Services:</div>
              <div className="flex flex-wrap gap-1">
                {parsedQuestion.awsServices.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Question Content */}
          <div className="mb-6">
            <MarkdownRenderer content={question.content} className="text-base leading-relaxed" />
          </div>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectOption = index === question.correct_answer

              let buttonVariant: "default" | "outline" | "secondary" = "outline"
              let buttonClass = ""

              if (showResult && hasAnswered) {
                if (isCorrectOption) {
                  buttonVariant = "default"
                  buttonClass = "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                } else if (isSelected && !isCorrect) {
                  buttonVariant = "outline"
                  buttonClass = "bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                }
              } else if (isSelected) {
                buttonVariant = "default"
                buttonClass = "bg-blue-100 border-blue-300 text-blue-800"
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={cn("w-full justify-start text-left h-auto p-4 whitespace-normal", buttonClass)}
                  onClick={() => onAnswerSelect?.(index)}
                  disabled={showResult && mode === "test"}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className="font-semibold text-sm mt-0.5">{String.fromCharCode(65 + index)}.</span>
                    <div className="flex-1">
                      <MarkdownRenderer content={option} className="text-sm" compact />
                    </div>
                    {showResult && hasAnswered && (
                      <div className="ml-2">
                        {isCorrectOption ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Result Summary */}
          {showResult && hasAnswered && (
            <div
              className={cn(
                "p-4 rounded-lg mb-4",
                isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200",
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={cn("font-semibold", isCorrect ? "text-green-800" : "text-red-800")}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm text-gray-700">
                  The correct answer is <strong>{String.fromCharCode(65 + question.correct_answer)}</strong>.
                </p>
              )}
            </div>
          )}

          {/* Traditional Explanation */}
          {showExplanation && question.explanation && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Explanation</h4>
              <MarkdownRenderer content={question.explanation} className="text-sm text-gray-700" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI-Enhanced Explanations - only show in study mode or when reviewing results */}
      {showExplanation && mode === "study" && (
        <AIExplanationComponent
          questionContent={question.content}
          correctAnswer={question.correct_answer}
          options={options}
          userAnswer={selectedAnswer}
          topic={question.topic}
          difficulty={question.difficulty}
          existingExplanation={question.explanation}
        />
      )}

      {/* Study Recommendations - only show for incorrect answers in study mode */}
      {showExplanation && mode === "study" && hasAnswered && !isCorrect && (
        <StudyRecommendations topic={question.topic} difficulty={question.difficulty} autoGenerate={false} />
      )}
    </div>
  )
}
