import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface AIExplanationRequest {
  questionContent: string
  correctAnswer: number
  options: string[]
  userAnswer?: number
  topic: string
  difficulty: "easy" | "medium" | "hard"
  existingExplanation?: string
}

export interface AIExplanation {
  explanation: string
  keyPoints: string[]
  relatedConcepts: string[]
  studyTips: string[]
  commonMistakes?: string[]
}

// Generate AI-powered explanation for a question
export async function generateAIExplanation(request: AIExplanationRequest): Promise<AIExplanation | null> {
  try {
    const prompt = createExplanationPrompt(request)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return parseAIResponse(text)
  } catch (error) {
    console.error("Error generating AI explanation:", error)
    return null
  }
}

// Generate personalized explanation based on user's incorrect answer
export async function generatePersonalizedExplanation(request: AIExplanationRequest): Promise<string | null> {
  if (request.userAnswer === undefined || request.userAnswer === request.correctAnswer) {
    return null
  }

  try {
    const prompt = createPersonalizedPrompt(request)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error("Error generating personalized explanation:", error)
    return null
  }
}

// Generate study recommendations based on question topic and difficulty
export async function generateStudyRecommendations(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  userPerformance?: { correct: number; total: number },
): Promise<string[] | null> {
  try {
    const performanceContext = userPerformance
      ? `The user has answered ${userPerformance.correct} out of ${userPerformance.total} questions correctly in this topic (${((userPerformance.correct / userPerformance.total) * 100).toFixed(1)}% accuracy).`
      : ""

    const prompt = `As an AWS Cloud Practitioner certification expert, provide 3-5 specific study recommendations for the topic "${topic}" at ${difficulty} difficulty level.

${performanceContext}

Focus on:
- Specific AWS services and features to study
- Hands-on practice suggestions
- Key documentation or resources
- Common exam scenarios

Provide recommendations as a JSON array of strings.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.6,
      maxTokens: 400,
    })

    try {
      return JSON.parse(text)
    } catch {
      // If JSON parsing fails, split by lines and clean up
      return text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .slice(0, 5)
    }
  } catch (error) {
    console.error("Error generating study recommendations:", error)
    return null
  }
}

// Create explanation prompt
function createExplanationPrompt(request: AIExplanationRequest): string {
  const optionsText = request.options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join("\n")

  const correctAnswerLetter = String.fromCharCode(65 + request.correctAnswer)

  return `As an AWS Cloud Practitioner certification expert, provide a comprehensive explanation for this question:

QUESTION:
${request.questionContent}

OPTIONS:
${optionsText}

CORRECT ANSWER: ${correctAnswerLetter}
TOPIC: ${request.topic}
DIFFICULTY: ${request.difficulty}

${request.existingExplanation ? `EXISTING EXPLANATION: ${request.existingExplanation}` : ""}

Please provide a detailed explanation in the following JSON format:
{
  "explanation": "Detailed explanation of why the correct answer is right and others are wrong",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "relatedConcepts": ["Related AWS concept 1", "Related AWS concept 2"],
  "studyTips": ["Study tip 1", "Study tip 2"],
  "commonMistakes": ["Common mistake 1", "Common mistake 2"]
}

Focus on:
- Clear explanation of AWS concepts
- Why the correct answer is right
- Why other options are incorrect
- Practical examples and use cases
- Common misconceptions to avoid`
}

// Create personalized prompt for incorrect answers
function createPersonalizedPrompt(request: AIExplanationRequest): string {
  const userAnswerLetter = String.fromCharCode(65 + request.userAnswer!)
  const correctAnswerLetter = String.fromCharCode(65 + request.correctAnswer)

  return `The user selected answer ${userAnswerLetter} but the correct answer is ${correctAnswerLetter}.

Question: ${request.questionContent}

Provide a brief, personalized explanation (2-3 sentences) that:
1. Acknowledges why answer ${userAnswerLetter} might seem appealing
2. Explains the key difference that makes ${correctAnswerLetter} correct
3. Helps the user remember this for future questions

Keep it encouraging and educational.`
}

// Parse AI response into structured format
function parseAIResponse(text: string): AIExplanation {
  try {
    const parsed = JSON.parse(text)
    return {
      explanation: parsed.explanation || text,
      keyPoints: parsed.keyPoints || [],
      relatedConcepts: parsed.relatedConcepts || [],
      studyTips: parsed.studyTips || [],
      commonMistakes: parsed.commonMistakes || [],
    }
  } catch {
    // If JSON parsing fails, return a basic structure
    return {
      explanation: text,
      keyPoints: [],
      relatedConcepts: [],
      studyTips: [],
      commonMistakes: [],
    }
  }
}

// Generate explanation for multiple questions (batch processing)
export async function generateBatchExplanations(requests: AIExplanationRequest[]): Promise<(AIExplanation | null)[]> {
  const results = await Promise.allSettled(requests.map((request) => generateAIExplanation(request)))

  return results.map((result) => (result.status === "fulfilled" ? result.value : null))
}
