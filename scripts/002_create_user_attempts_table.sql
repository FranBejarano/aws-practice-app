-- Create user_attempts table to track individual question attempts
CREATE TABLE IF NOT EXISTS user_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer INTEGER NOT NULL, -- Index of selected answer (0-3)
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER, -- Time in seconds to answer
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('study', 'test')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_attempts_user_id ON user_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_question_id ON user_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_user_attempts_mode ON user_attempts(mode);
