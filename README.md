# AWS Cloud Practitioner Certification Practice App

A comprehensive practice application for AWS Cloud Practitioner certification exam preparation, built with Next.js, TypeScript, Supabase, and AI-powered explanations.

## Features

- **Study Mode**: Interactive question practice with immediate feedback and explanations
- **Test Mode**: Timed exam simulation matching the real AWS certification experience
- **AI Explanations**: Context-aware explanations and study recommendations powered by AI
- **Progress Tracking**: Comprehensive analytics and performance tracking by topic
- **Markdown Support**: Rich question formatting with syntax highlighting for AWS code examples
- **Responsive Design**: Mobile-first design with accessibility features
- **User Authentication**: Secure authentication with Supabase

## Prerequisites

Before running this project locally, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Git installed

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd aws-practice-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   
   \`\`\`env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Database Configuration (automatically provided by Supabase)
   POSTGRES_URL=your_postgres_connection_string
   POSTGRES_PRISMA_URL=your_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=your_postgres_database
   POSTGRES_HOST=your_postgres_host
   
   # App Configuration
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   \`\`\`

## Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com) and create a new project
   - Copy your project URL and anon key to the environment variables

2. **Run Database Migrations**
   
   Execute the SQL scripts in order in your Supabase SQL editor:
   
   \`\`\`sql
   -- Run these scripts in your Supabase SQL editor in order:
   -- 1. scripts/001_create_questions_table.sql
   -- 2. scripts/002_create_user_attempts_table.sql
   -- 3. scripts/003_create_study_sessions_table.sql
   -- 4. scripts/004_create_test_results_table.sql
   -- 5. scripts/005_create_user_profiles_table.sql
   -- 6. scripts/006_insert_sample_questions.sql
   \`\`\`

3. **Configure Authentication**
   
   In your Supabase dashboard:
   - Go to Authentication > Settings
   - Add `http://localhost:3000/dashboard` to the redirect URLs
   - Enable email confirmation if desired

## Running the Development Server

1. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── study/            # Study mode interface
│   ├── test/             # Test mode interface
│   └── api/              # API routes
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── study-interface.tsx
│   ├── test-interface.tsx
│   └── question-renderer.tsx
├── lib/                  # Utility functions
│   ├── supabase/         # Supabase client configuration
│   ├── database.ts       # Database operations
│   ├── markdown.ts       # Markdown parsing utilities
│   └── ai-explanations.ts # AI explanation system
└── scripts/              # Database migration scripts
\`\`\`

## Usage

1. **Sign Up**: Create a new account or sign in with existing credentials
2. **Study Mode**: Practice questions with immediate feedback and explanations
3. **Test Mode**: Take timed practice exams that simulate the real AWS certification
4. **Dashboard**: Track your progress, view test history, and analyze performance
5. **AI Explanations**: Get detailed, context-aware explanations for questions

## Key Features

### Study Mode
- Browse questions by topic and difficulty
- Get immediate feedback on answers
- View detailed explanations with AWS service highlights
- Track study session progress
- AI-powered additional explanations

### Test Mode
- Timed 90-minute practice exams
- 65 questions randomly selected from the database
- Question flagging and navigation
- Comprehensive results with topic breakdown
- Detailed answer review after completion

### Dashboard
- Performance analytics by topic
- Test history and trends
- Study session tracking
- Progress visualization
- Personalized study recommendations

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Markdown**: react-markdown with syntax highlighting
- **AI**: Vercel AI SDK for explanations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information about the problem
3. Include steps to reproduce the issue and your environment details

## Acknowledgments

- AWS for providing comprehensive documentation and exam guides
- Supabase for the excellent backend-as-a-service platform
- The Next.js and React communities for amazing tools and resources
