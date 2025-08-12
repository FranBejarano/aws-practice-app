"use client"

import { useEffect, useState } from "react"
import { processMarkdown, highlightAWSServices } from "@/lib/markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
  highlightAWS?: boolean
  compact?: boolean
}

export default function MarkdownRenderer({
  content,
  className,
  highlightAWS = true,
  compact = false,
}: MarkdownRendererProps) {
  const [processedContent, setProcessedContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function process() {
      setIsLoading(true)
      try {
        let processed = await processMarkdown(content)

        if (highlightAWS) {
          processed = highlightAWSServices(processed)
        }

        setProcessedContent(processed)
      } catch (error) {
        console.error("Error processing markdown:", error)
        setProcessedContent(content)
      } finally {
        setIsLoading(false)
      }
    }

    if (content) {
      process()
    }
  }, [content, highlightAWS])

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        compact ? "prose-compact" : "",
        "prose-headings:text-gray-900 prose-p:text-gray-700",
        "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-gray-900 prose-pre:text-gray-100",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
