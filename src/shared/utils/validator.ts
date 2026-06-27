import type {
  AiProvider,
  BehavioralQuestion,
  CompanyResearch,
  ExtensionSettings,
  InterviewPrep,
  InterviewProcess,
  JobDescription,
  SalaryInsight,
  TechnicalTopic,
} from '../types';

export function isValidJobDescription(value: unknown): value is JobDescription {
  if (!value || typeof value !== 'object') return false;
  const job = value as JobDescription;
  return (
    typeof job.id === 'string' &&
    typeof job.title === 'string' &&
    typeof job.company === 'string' &&
    typeof job.description === 'string' &&
    Array.isArray(job.skills)
  );
}

export function isValidAiProvider(value: string): value is AiProvider {
  return value === 'OpenAI' || value === 'Anthropic' || value === 'GoogleAI';
}

export function validateSettings(value: unknown): ExtensionSettings {
  const defaults: ExtensionSettings = {
    provider: 'OpenAI',
    useConsolidatedPrompt: true,
  };

  if (!value || typeof value !== 'object') return defaults;

  const settings = value as Partial<ExtensionSettings>;
  return {
    provider: isValidAiProvider(settings.provider ?? '') ? settings.provider! : defaults.provider,
    useConsolidatedPrompt: Boolean(settings.useConsolidatedPrompt),
    passphrase: typeof settings.passphrase === 'string' ? settings.passphrase : undefined,
  };
}

export function validateTechnicalTopics(value: unknown): TechnicalTopic[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is TechnicalTopic => {
      if (!item || typeof item !== 'object') return false;
      const t = item as TechnicalTopic;
      return typeof t.topic === 'string' && Array.isArray(t.keyPoints);
    })
    .map((t) => ({
      topic: t.topic,
      difficulty: t.difficulty ?? 'Intermediate',
      keyPoints: t.keyPoints ?? [],
      resources: Array.isArray(t.resources) ? t.resources : [],
      estimatedPrep: typeof t.estimatedPrep === 'number' ? t.estimatedPrep : 60,
    }));
}

export function validateBehavioralQuestions(value: unknown): BehavioralQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is BehavioralQuestion => {
      if (!item || typeof item !== 'object') return false;
      return typeof (item as BehavioralQuestion).question === 'string';
    })
    .map((q) => ({
      question: q.question,
      category: q.category ?? 'Problem-Solving',
      suggestedApproach: q.suggestedApproach ?? '',
      starExamples: Array.isArray(q.starExamples) ? q.starExamples : [],
    }));
}

export function validateCompanyResearch(value: unknown, company: string): CompanyResearch {
  const fallback: CompanyResearch = {
    companyName: company,
    industry: 'Unknown',
    recentNews: [],
    productFeatures: [],
    cultureFocus: [],
    interviewFocus: [],
  };

  if (!value || typeof value !== 'object') return fallback;
  const r = value as CompanyResearch;
  return {
    companyName: r.companyName ?? company,
    industry: r.industry ?? 'Unknown',
    recentNews: Array.isArray(r.recentNews) ? r.recentNews : [],
    productFeatures: Array.isArray(r.productFeatures) ? r.productFeatures : [],
    cultureFocus: Array.isArray(r.cultureFocus) ? r.cultureFocus : [],
    interviewFocus: Array.isArray(r.interviewFocus) ? r.interviewFocus : [],
  };
}

export function validateInterviewProcess(value: unknown): InterviewProcess {
  const fallback: InterviewProcess = {
    rounds: [],
    totalDuration: 'Unknown',
    interviewFormat: [],
    tips: [],
  };

  if (!value || typeof value !== 'object') return fallback;
  const p = value as InterviewProcess;
  return {
    rounds: Array.isArray(p.rounds) ? p.rounds : [],
    totalDuration: p.totalDuration ?? 'Unknown',
    interviewFormat: Array.isArray(p.interviewFormat) ? p.interviewFormat : [],
    tips: Array.isArray(p.tips) ? p.tips : [],
  };
}

export function validateSalaryInsight(value: unknown, role: string): SalaryInsight {
  const fallback: SalaryInsight = {
    role,
    location: 'Unknown',
    range: { min: 0, max: 0 },
    marketTrend: 'Stable',
    negotiationTips: [],
  };

  if (!value || typeof value !== 'object') return fallback;
  const s = value as SalaryInsight;
  return {
    role: s.role ?? role,
    location: s.location ?? 'Unknown',
    range: {
      min: s.range?.min ?? 0,
      max: s.range?.max ?? 0,
    },
    marketTrend: s.marketTrend ?? 'Stable',
    negotiationTips: Array.isArray(s.negotiationTips) ? s.negotiationTips : [],
  };
}

export function validateInterviewPrep(value: unknown, jobId: string): InterviewPrep | null {
  if (!value || typeof value !== 'object') return null;
  const prep = value as InterviewPrep;
  if (!Array.isArray(prep.technicalTopics)) return null;

  return {
    jobId,
    technicalTopics: validateTechnicalTopics(prep.technicalTopics),
    behavioralQuestions: validateBehavioralQuestions(prep.behavioralQuestions),
    companyResearch: validateCompanyResearch(prep.companyResearch, ''),
    salaryInsights: validateSalaryInsight(prep.salaryInsights, ''),
    interviewProcess: validateInterviewProcess(prep.interviewProcess),
    generatedAt: prep.generatedAt ?? Date.now(),
  };
}

export function validateApiKey(provider: AiProvider, apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false;
  switch (provider) {
    case 'OpenAI':
      return apiKey.startsWith('sk-');
    case 'Anthropic':
      return apiKey.startsWith('sk-ant-');
    case 'GoogleAI':
      return apiKey.length >= 20;
    default:
      return false;
  }
}
