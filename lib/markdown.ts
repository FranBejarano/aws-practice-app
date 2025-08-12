import remarkGfm from "remark-gfm"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypePrism from "rehype-prism-plus"
import rehypeSanitize from "rehype-sanitize"

// AWS service names and keywords for highlighting
export const AWS_SERVICES = [
  "EC2",
  "S3",
  "RDS",
  "Lambda",
  "CloudFront",
  "Route 53",
  "VPC",
  "IAM",
  "CloudWatch",
  "CloudTrail",
  "EBS",
  "EFS",
  "DynamoDB",
  "ElastiCache",
  "Redshift",
  "EMR",
  "Kinesis",
  "SQS",
  "SNS",
  "SES",
  "API Gateway",
  "CloudFormation",
  "Elastic Beanstalk",
  "ECS",
  "EKS",
  "Fargate",
  "Auto Scaling",
  "Load Balancer",
  "ALB",
  "NLB",
  "CLB",
  "WAF",
  "Shield",
  "GuardDuty",
  "Inspector",
  "Macie",
  "Config",
  "Systems Manager",
  "Secrets Manager",
  "Parameter Store",
  "KMS",
  "Certificate Manager",
  "Direct Connect",
  "VPN",
  "Transit Gateway",
  "PrivateLink",
]

// Process markdown content with AWS-specific enhancements
export async function processMarkdown(content: string): Promise<string> {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm) // GitHub Flavored Markdown
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeSanitize) // Sanitize HTML for security
      .use(rehypePrism, {
        // Enable syntax highlighting for common languages
        ignoreMissing: true,
        showLineNumbers: false,
      })
      .use(rehypeStringify)
      .process(content)

    return String(result)
  } catch (error) {
    console.error("Error processing markdown:", error)
    return content // Return original content if processing fails
  }
}

// Extract and highlight AWS services in text
export function highlightAWSServices(text: string): string {
  let highlightedText = text

  AWS_SERVICES.forEach((service) => {
    const regex = new RegExp(`\\b${service}\\b`, "gi")
    highlightedText = highlightedText.replace(regex, `<span class="aws-service">${service}</span>`)
  })

  return highlightedText
}

// Parse question content and extract metadata
export interface ParsedQuestion {
  content: string
  codeBlocks: string[]
  awsServices: string[]
  hasImages: boolean
  complexity: "low" | "medium" | "high"
}

export function parseQuestionContent(markdown: string): ParsedQuestion {
  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = markdown.match(codeBlockRegex) || []

  const awsServices = AWS_SERVICES.filter((service) => new RegExp(`\\b${service}\\b`, "i").test(markdown))

  const hasImages = /!\[.*?\]$$.*?$$/.test(markdown)

  // Determine complexity based on content
  let complexity: "low" | "medium" | "high" = "low"
  if (codeBlocks.length > 0 || awsServices.length > 3) {
    complexity = "medium"
  }
  if (codeBlocks.length > 1 || awsServices.length > 5 || hasImages) {
    complexity = "high"
  }

  return {
    content: markdown,
    codeBlocks,
    awsServices,
    hasImages,
    complexity,
  }
}

// Clean and format markdown for display
export function cleanMarkdown(content: string): string {
  return content
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
    .replace(/\t/g, "  ") // Convert tabs to spaces
}
