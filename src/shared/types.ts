export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  url: string;
  platform: JobPlatform;
  extractedAt: number;
  skills: string[];
  responsibilities: string[];
  requirements: string[];
}

export interface InterviewPrep {
  jobId: string;
  technicalTopics: TechnicalTopic[];
  behavioralQuestions: BehavioralQuestion[];
  companyResearch: CompanyResearch;
  salaryInsights: SalaryInsight;
  interviewProcess: InterviewProcess;
  generatedAt: number;
}

export interface TechnicalTopic {
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyPoints: string[];
  resources: Resource[];
  estimatedPrep: number;
}

export interface BehavioralQuestion {
  question: string;
  category: 'Leadership' | 'Teamwork' | 'Conflict' | 'Problem-Solving' | 'Growth';
  suggestedApproach: string;
  starExamples: string[];
}

export interface CompanyResearch {
  companyName: string;
  industry: string;
  recentNews: NewsItem[];
  productFeatures: string[];
  cultureFocus: string[];
  interviewFocus: string[];
}

export interface SalaryInsight {
  role: string;
  location: string;
  range: { min: number; max: number };
  marketTrend: 'Rising' | 'Stable' | 'Declining';
  negotiationTips: string[];
}

export interface InterviewProcess {
  rounds: InterviewRound[];
  totalDuration: string;
  interviewFormat: (
    | 'Phone Screen'
    | 'Technical'
    | 'System Design'
    | 'Behavioral'
    | 'Panel'
  )[];
  tips: string[];
}

export interface InterviewRound {
  round: number;
  type: string;
  duration: number;
  focus: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'Article' | 'Video' | 'Documentation' | 'Practice';
}

export interface NewsItem {
  title: string;
  date: string;
  source: string;
  url: string;
}

export type JobPlatform = 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Company Career';

export type AiProvider = 'OpenAI' | 'Anthropic' | 'GoogleAI';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  timestamp: number;
}

export enum MessageType {
  EXTRACT_JOB = 'EXTRACT_JOB',
  ANALYZE_JOB = 'ANALYZE_JOB',
  GET_PREP_MATERIALS = 'GET_PREP_MATERIALS',
  SAVE_ANALYSIS = 'SAVE_ANALYSIS',
  GET_HISTORY = 'GET_HISTORY',
  DELETE_ANALYSIS = 'DELETE_ANALYSIS',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  GET_SETTINGS = 'GET_SETTINGS',
  SAVE_CREDENTIALS = 'SAVE_CREDENTIALS',
  GET_CREDENTIALS_STATUS = 'GET_CREDENTIALS_STATUS',
  EXPORT_MARKDOWN = 'EXPORT_MARKDOWN',
  OPEN_SIDE_PANEL = 'OPEN_SIDE_PANEL',
  OPEN_ANALYZE_TAB = 'OPEN_ANALYZE_TAB',
  EXTRACT_JOB_FROM_URL = 'EXTRACT_JOB_FROM_URL',
}

export interface EncryptedApiCredentials {
  provider: AiProvider;
  encryptedKey: string;
  iv: string;
  encryptedAt: number;
}

export interface ApiCredentials {
  provider: AiProvider;
  apiKey: string;
}

export interface ExtensionSettings {
  provider: AiProvider;
  useConsolidatedPrompt: boolean;
  passphrase?: string;
}

export interface AnalysisRecord {
  jobId: string;
  title: string;
  company: string;
  generatedAt: number;
  prep: InterviewPrep;
  job: JobDescription;
}

export interface AnalysisIndexEntry {
  jobId: string;
  generatedAt: number;
  title: string;
  company: string;
}

export interface ContentExtractResponse {
  success: boolean;
  job?: JobDescription;
  error?: string;
}

export interface MessageResponse<T = unknown> {
  data?: T;
  error?: string;
}
