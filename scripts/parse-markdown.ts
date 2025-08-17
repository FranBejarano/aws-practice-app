// src/scripts/parseMarkdownToJson.ts
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import 'dotenv/config';

// Check for API key early with a clear error
if (!process.env.OPENAI_API_KEY) {
  console.error(`
❌ ERROR: Missing OpenAI API key.

Please create a file named ".env" in your project root with:
OPENAI_API_KEY=sk-your-key-here

Or set the environment variable manually before running:
  Linux/Mac: OPENAI_API_KEY=sk-your-key npx tsx scripts/parse-markdown.ts
  Windows PowerShell: $env:OPENAI_API_KEY="sk-your-key"; npx tsx scripts/parse-markdown.ts
`);
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const mdFolder = path.join(__dirname, "../questions-md");
const outputFile = path.join(__dirname, "../questions.json");

async function generateExplanation(question: string, options: string[], correct: string) {
  const prompt = `
You are an AWS certification trainer. Given the following question and answer options, 
explain why the correct answer(s) is right and why the other options are wrong. 
Write in an educational but concise tone.

Question:
${question}

Options:
${options.map(o => `- ${o}`).join("\n")}

Correct answer(s): ${correct}

Format the output EXACTLY as:
"Correct answer: ${correct}. <Your explanation here>"
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5
  });

  return completion.choices[0].message.content?.trim() || "";
}

async function parseMarkdown() {
  const files = fs.readdirSync(mdFolder).filter(f => f.endsWith(".md"));
  let allQuestions: any[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(mdFolder, file), "utf-8");
    const questionBlocks = content.split(/\n(?=\d+\.\s)/g);

    for (const block of questionBlocks) {
      const questionMatch = block.match(/^\d+\.\s(.+?)\n\s+-/s);
      if (!questionMatch) continue;

      const questionText = questionMatch[1].trim();

      const optionMatches = [...block.matchAll(/-\s([A-E])\.\s(.+)/g)];
      const options = optionMatches.map(m => `${m[1]}. ${m[2].trim()}`);

      const correctMatch = block.match(/Correct answer:\s*(.+)/i);
      if (!correctMatch) continue;

      const correctAnswer = correctMatch[1].trim();

      const explanation = await generateExplanation(questionText, options, correctAnswer);

      allQuestions.push({
        question: questionText,
        options,
        correct: correctAnswer,
        explanation
      });
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2), "utf-8");
  console.log(`✅ Parsed ${allQuestions.length} questions. Saved to ${outputFile}`);
}

parseMarkdown().catch(err => console.error(err));
