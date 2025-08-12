-- Create test_results table to store practice test results
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Number of correct answers
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score::DECIMAL / total_questions::DECIMAL) * 100, 2)) STORED,
  time_taken INTEGER NOT NULL, -- Total time in seconds
  test_type VARCHAR(50) DEFAULT 'practice' CHECK (test_type IN ('practice', 'timed', 'topic_specific')),
  topics_covered TEXT[], -- Array of topics included in test
  questions_data JSONB, -- Store question IDs and user answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_score ON test_results(score);
CREATE INDEX IF NOT EXISTS idx_test_results_percentage ON test_results(percentage);
