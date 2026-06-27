import type {
  BehavioralQuestion,
  ExtensionSettings,
  InterviewPrep,
  JobDescription,
  TechnicalTopic,
} from '@/shared/types';
import { MAX_PROMPT_DESCRIPTION_LENGTH } from '@/shared/constants';
import { Logger } from '@/shared/utils/logger';
import {
  validateBehavioralQuestions,
  validateCompanyResearch,
  validateInterviewPrep,
  validateInterviewProcess,
  validateSalaryInsight,
  validateTechnicalTopics,
} from '@/shared/utils/validator';
import { ApiClient, ApiError } from './api-client';
import { CacheManager } from './cache-manager';

export class InterviewService {
  private apiClient: ApiClient;
  private cacheManager: CacheManager;
  private logger: Logger;
  private settings: ExtensionSettings;

  constructor(apiClient: ApiClient, settings: ExtensionSettings, cacheManager?: CacheManager) {
    this.apiClient = apiClient;
    this.settings = settings;
    this.cacheManager = cacheManager ?? new CacheManager();
    this.logger = new Logger('InterviewService');
  }

  async generateInterviewPrep(job: JobDescription): Promise<InterviewPrep> {
    this.logger.info(`Generating prep materials for: ${job.title} at ${job.company}`);

    try {
      if (this.settings.useConsolidatedPrompt) {
        return await this.generateConsolidated(job);
      }

      const [technicalTopics, behavioralQuestions, companyResearch, interviewProcess, salaryInsights] =
        await Promise.all([
          this.generateTechnicalTopics(job),
          this.generateBehavioralQuestions(job),
          this.generateCompanyResearch(job),
          this.generateInterviewProcess(job),
          this.generateSalaryInsights(job),
        ]);

      return {
        jobId: job.id,
        technicalTopics,
        behavioralQuestions,
        companyResearch,
        salaryInsights,
        interviewProcess,
        generatedAt: Date.now(),
      };
    } catch (error) {
      this.logger.error('Failed to generate interview prep', error);
      throw new InterviewPrepError(formatPrepError(error), error);
    }
  }

  private jobContext(job: JobDescription): string {
    const description = job.description.slice(0, MAX_PROMPT_DESCRIPTION_LENGTH);
    return `Job Title: ${job.title}
Company: ${job.company}
Skills: ${job.skills.join(', ') || 'See description below'}
Requirements:
${job.requirements.join('\n') || 'See description below'}
Responsibilities:
${job.responsibilities.join('\n') || 'See description below'}

Full Job Description:
${description}`;
  }

  private async generateConsolidated(job: JobDescription): Promise<InterviewPrep> {
    const cacheKey = 'consolidated';
    const cached = await this.cacheManager.get(job.id, cacheKey);
    if (cached) {
      const validated = validateInterviewPrep(this.parseJsonResponse(cached), job.id);
      if (validated) return validated;
    }

    const prompt = `Analyze this job and return a complete interview prep plan as JSON.

${this.jobContext(job)}

Return JSON with structure:
{
  "technicalTopics": [{"topic": string, "difficulty": "Beginner|Intermediate|Advanced", "keyPoints": string[], "estimatedPrep": number, "resources": [{"title": string, "url": string, "type": "Article|Video|Documentation|Practice"}]}],
  "behavioralQuestions": [{"question": string, "category": string, "suggestedApproach": string, "starExamples": string[]}],
  "companyResearch": {"companyName": string, "industry": string, "recentNews": [], "productFeatures": string[], "cultureFocus": string[], "interviewFocus": string[]},
  "salaryInsights": {"role": string, "location": string, "range": {"min": number, "max": number}, "marketTrend": string, "negotiationTips": string[]},
  "interviewProcess": {"rounds": [{"round": number, "type": string, "duration": number, "focus": string[]}], "totalDuration": string, "interviewFormat": string[], "tips": string[]}
}`;

    const response = await this.apiClient.generateContent(prompt);
    await this.cacheManager.set(job.id, cacheKey, response);

    const parsed = this.parseJsonResponse<InterviewPrep>(response);
    return {
      jobId: job.id,
      technicalTopics: validateTechnicalTopics(parsed.technicalTopics),
      behavioralQuestions: validateBehavioralQuestions(parsed.behavioralQuestions),
      companyResearch: validateCompanyResearch(parsed.companyResearch, job.company),
      salaryInsights: validateSalaryInsight(parsed.salaryInsights, job.title),
      interviewProcess: validateInterviewProcess(parsed.interviewProcess),
      generatedAt: Date.now(),
    };
  }

  private async generateTechnicalTopics(job: JobDescription): Promise<TechnicalTopic[]> {
    const cacheKey = 'technical';
    const cached = await this.cacheManager.get(job.id, cacheKey);
    if (cached) {
      return validateTechnicalTopics(this.parseJsonResponse(cached));
    }

    const prompt = `Analyze this job posting and identify key technical topics for interview preparation.

${this.jobContext(job)}

Return JSON array only:
[{"topic": string, "difficulty": "Beginner|Intermediate|Advanced", "keyPoints": string[], "estimatedPrep": number}]`;

    const response = await this.apiClient.generateContent(prompt);
    await this.cacheManager.set(job.id, cacheKey, response);

    const topics = validateTechnicalTopics(this.parseJsonResponse(response));
    return topics.map((topic) => ({
      ...topic,
      resources: this.findResources(topic.topic),
    }));
  }

  private async generateBehavioralQuestions(job: JobDescription): Promise<BehavioralQuestion[]> {
    const cacheKey = 'behavioral';
    const cached = await this.cacheManager.get(job.id, cacheKey);
    if (cached) {
      return validateBehavioralQuestions(this.parseJsonResponse(cached));
    }

    const prompt = `Generate 5 behavioral interview questions for this role.

${this.jobContext(job)}

Return JSON array only:
[{"question": string, "category": "Leadership|Teamwork|Conflict|Problem-Solving|Growth", "suggestedApproach": string, "starExamples": string[]}]`;

    const response = await this.apiClient.generateContent(prompt);
    await this.cacheManager.set(job.id, cacheKey, response);
    return validateBehavioralQuestions(this.parseJsonResponse(response));
  }

  private async generateCompanyResearch(job: JobDescription) {
    const cacheKey = 'company';
    const cached = await this.cacheManager.get(job.id, cacheKey);
    if (cached) {
      return validateCompanyResearch(this.parseJsonResponse(cached), job.company);
    }

    const prompt = `Research company "${job.company}" for interview prep. Return JSON only:
{"companyName": string, "industry": string, "recentNews": [{"title": string, "date": string, "source": string, "url": string}], "productFeatures": string[], "cultureFocus": string[], "interviewFocus": string[]}`;

    const response = await this.apiClient.generateContent(prompt);
    await this.cacheManager.set(job.id, cacheKey, response);
    return validateCompanyResearch(this.parseJsonResponse(response), job.company);
  }

  private async generateInterviewProcess(job: JobDescription) {
    const cacheKey = 'process';
    const cached = await this.cacheManager.get(job.id, cacheKey);
    if (cached) {
      return validateInterviewProcess(this.parseJsonResponse(cached));
    }

    const prompt = `Describe typical interview process for ${job.title} at ${job.company} (${this.inferSeniorityLevel(job.title)} level).

Return JSON only:
{"rounds": [{"round": number, "type": string, "duration": number, "focus": string[]}], "totalDuration": string, "interviewFormat": string[], "tips": string[]}`;

    const response = await this.apiClient.generateContent(prompt);
    await this.cacheManager.set(job.id, cacheKey, response);
    return validateInterviewProcess(this.parseJsonResponse(response));
  }

  private async generateSalaryInsights(job: JobDescription) {
    try {
      const data = await this.apiClient.fetchSalaryData(job.title, job.company);
      return validateSalaryInsight(data, job.title);
    } catch (error) {
      this.logger.warn('Failed to fetch salary data', error);
      return validateSalaryInsight(null, job.title);
    }
  }

  private findResources(topic: string): TechnicalTopic['resources'] {
    const commonResources: Record<string, TechnicalTopic['resources']> = {
      'System Design': [
        {
          title: 'System Design Primer',
          type: 'Article',
          url: 'https://github.com/donnemartin/system-design-primer',
        },
      ],
      'Data Structures': [
        { title: 'LeetCode', type: 'Practice', url: 'https://leetcode.com' },
      ],
    };

    return commonResources[topic] || [];
  }

  inferSeniorityLevel(title: string): string {
    const seniorKeywords = ['senior', 'lead', 'principal', 'architect'];
    const juniorKeywords = ['junior', 'entry', 'graduate', 'intern'];

    const lowerTitle = title.toLowerCase();

    if (seniorKeywords.some((kw) => lowerTitle.includes(kw))) return 'Senior';
    if (juniorKeywords.some((kw) => lowerTitle.includes(kw))) return 'Junior';
    return 'Mid-Level';
  }

  private parseJsonResponse<T>(response: string): T {
    const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No valid JSON found in response');
    return JSON.parse(jsonMatch[0]) as T;
  }
}

export class InterviewPrepError extends Error {
  originalError: unknown;

  constructor(message: string, originalError: unknown) {
    super(message);
    this.name = 'InterviewPrepError';
    this.originalError = originalError;
  }
}

function formatPrepError(error: unknown): string {
  if (error instanceof ApiError) {
    try {
      const body = JSON.parse(error.responseBody) as {
        error?: { message?: string };
        message?: string;
      };
      const detail = body.error?.message || body.message;
      if (detail) return `AI API error (${error.statusCode}): ${detail}`;
    } catch {
      // use raw body below
    }
    return `AI API error (${error.statusCode}): ${error.responseBody.slice(0, 200)}`;
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      return 'Request timed out. Try enabling "Use consolidated prompt" in Settings.';
    }
    return error.message;
  }

  return 'Interview prep generation failed';
}
