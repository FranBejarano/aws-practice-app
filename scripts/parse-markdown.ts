import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface Question {
  id: number;
  question: string;
  options: { letter: string; text: string }[];
  correct: string[];
  type: "single" | "multiple";
}

interface Exam {
  examTitle: string;
  questions: Question[];
}

// Parse options line like "- A. Option text"
function parseOption(line: string) {
  const match = line.match(/^-?\s*([A-Z])\.\s*(.*)/);
  return match ? { letter: match[1], text: match[2] } : null;
}

// Parse a single markdown exam
function parseExam(content: string): Exam {
  const lines = content.split("\n");
  const examTitle = lines[0].replace(/^#\s*/, "").trim();
  const questions: Question[] = [];

  let current: Partial<Question> = {};
  let options: { letter: string; text: string }[] = [];

  for (const lineRaw of lines.slice(1)) {
    const line = lineRaw.trim();
    const qMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (qMatch) {
      if (current.question) {
        current.options = options;
        current.type = (current.correct?.length ?? 0) > 1 ? "multiple" : "single";
        questions.push(current as Question);
      }
      current = { id: parseInt(qMatch[1]), question: qMatch[2].trim(), correct: [] };
      options = [];
      continue;
    }

    const option = parseOption(line);
    if (option) {
      options.push(option);
      continue;
    }

    if (/^Correct answer:/i.test(line)) {
      current.correct = line.replace(/^Correct answer:\s*/i, "").split(",").map(s => s.trim());
    }
  }

  if (current.question) {
    current.options = options;
    current.type = (current.correct?.length ?? 0) > 1 ? "multiple" : "single";
    questions.push(current as Question);
  }

  return { examTitle, questions };
}

// Main function
function main() {
  const inputDir = path.join(fileURLToPath(new URL("../public/mdExams", import.meta.url)));
  const outputDir = path.join(fileURLToPath(new URL("../public/jsonExams", import.meta.url)));

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const manifest: { file: string; title: string; questionCount: number }[] = [];

  fs.readdirSync(inputDir)
    .filter(f => f.endsWith(".md"))
    .forEach(file => {
      const content = fs.readFileSync(path.join(inputDir, file), "utf-8");
      const exam = parseExam(content);

      const outFile = file.replace(/\.md$/, ".json");
      fs.writeFileSync(path.join(outputDir, outFile), JSON.stringify(exam, null, 2));

      console.log(`✅ Parsed ${file}`);
      manifest.push({ file: outFile, title: exam.examTitle, questionCount: exam.questions.length });
    });

  // Write manifest.json for React app
  fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`📄 Created manifest with ${manifest.length} exams`);
}

main();
