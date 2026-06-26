export const STORAGE_KEYS = {
  ANALYSIS_INDEX: 'meta_analysis_index',
  API_CREDENTIALS: 'api_credentials',
  SETTINGS: 'settings',
  ENCRYPTION_SALT: 'meta_encryption_salt',
  CACHE_PREFIX: 'cache_',
} as const;

export const JOB_KEY_PREFIX = 'job_';
export const ANALYSIS_KEY_PREFIX = 'analysis_';

export const STORAGE_QUOTA_BYTES = 10 * 1024 * 1024;
export const STORAGE_EVICT_THRESHOLD = 0.9;
export const MAX_DESCRIPTION_LENGTH = 50_000;
export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const API_MAX_RETRIES = 3;
export const API_TIMEOUT_MS = 30_000;

export const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
  GOOGLE_AI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
} as const;

export const DEFAULT_MODELS = {
  OpenAI: 'gpt-4o-mini',
  Anthropic: 'claude-sonnet-4-20250514',
  GoogleAI: 'gemini-2.0-flash',
} as const;

export const SKILL_KEYWORDS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'Kotlin',
  'Swift',
  'React',
  'Vue',
  'Angular',
  'Flutter',
  'Jetpack',
  'AWS',
  'GCP',
  'Azure',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Firebase',
  'REST',
  'GraphQL',
  'gRPC',
  'Agile',
  'Scrum',
  'CI/CD',
  'Git',
  'Node.js',
  'Go',
  'Rust',
  'C++',
  'C#',
  '.NET',
  'Spring',
  'Django',
  'FastAPI',
  'Terraform',
  'Linux',
  'SQL',
  'NoSQL',
  'Kafka',
  'Spark',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
] as const;

export const SUPPORTED_JOB_HOSTS = [
  'linkedin.com',
  'indeed.com',
  'glassdoor.com',
  'careers.google.com',
  'careers.apple.com',
] as const;

export const CONTENT_MESSAGE_EXTRACT = 'EXTRACT_JOB' as const;
