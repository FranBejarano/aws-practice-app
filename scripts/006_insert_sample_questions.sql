-- Insert sample AWS Cloud Practitioner questions
INSERT INTO questions (content, correct_answer, option_a, option_b, option_c, option_d, explanation, difficulty, topic, subtopic) VALUES
(
  'Which AWS service provides a fully managed NoSQL database?',
  1,
  'Amazon RDS',
  'Amazon DynamoDB',
  'Amazon Redshift',
  'Amazon ElastiCache',
  'Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. Amazon RDS is for relational databases, Redshift is a data warehouse, and ElastiCache is an in-memory caching service.',
  'easy',
  'Database',
  'NoSQL'
),
(
  'What is the AWS Well-Architected Framework pillar that focuses on the ability to recover from failures?',
  2,
  'Performance Efficiency',
  'Cost Optimization',
  'Reliability',
  'Security',
  'The Reliability pillar focuses on the ability of a system to recover from infrastructure or service disruptions, dynamically acquire computing resources to meet demand, and mitigate disruptions such as misconfigurations or transient network issues.',
  'medium',
  'Well-Architected Framework',
  'Reliability'
),
(
  'Which AWS service would you use to distribute content globally with low latency?',
  0,
  'Amazon CloudFront',
  'Amazon S3',
  'Amazon EC2',
  'Amazon Route 53',
  'Amazon CloudFront is a content delivery network (CDN) service that delivers data, videos, applications, and APIs to customers globally with low latency and high transfer speeds.',
  'easy',
  'Content Delivery',
  'CDN'
),
(
  'What is the maximum execution time for an AWS Lambda function?',
  3,
  '5 minutes',
  '10 minutes',
  '30 minutes',
  '15 minutes',
  'AWS Lambda functions can run for a maximum of 15 minutes (900 seconds). This timeout can be configured when creating or updating the function.',
  'medium',
  'Compute',
  'Serverless'
),
(
  'Which AWS service provides managed Kubernetes?',
  1,
  'Amazon ECS',
  'Amazon EKS',
  'AWS Fargate',
  'Amazon EC2',
  'Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install and operate your own Kubernetes control plane.',
  'medium',
  'Containers',
  'Kubernetes'
);
