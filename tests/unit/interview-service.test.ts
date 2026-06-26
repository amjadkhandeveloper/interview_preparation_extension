import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InterviewService } from '@/services/interview-service';
import { ApiClient } from '@/services/api-client';
import { CacheManager } from '@/services/cache-manager';
import type { JobDescription } from '@/shared/types';

describe('InterviewService', () => {
  let service: InterviewService;
  let apiClientMock: {
    generateContent: ReturnType<typeof vi.fn>;
    fetchSalaryData: ReturnType<typeof vi.fn>;
  };
  let cacheMock: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let mockJob: JobDescription;

  beforeEach(() => {
    apiClientMock = {
      generateContent: vi.fn(),
      fetchSalaryData: vi.fn(),
    };
    cacheMock = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    service = new InterviewService(
      apiClientMock as unknown as ApiClient,
      { provider: 'OpenAI', useConsolidatedPrompt: false },
      cacheMock as unknown as CacheManager
    );

    mockJob = {
      id: 'job_1',
      title: 'Senior Full Stack Engineer',
      company: 'Google',
      description: 'Build scalable systems...',
      url: 'https://example.com',
      platform: 'LinkedIn',
      extractedAt: Date.now(),
      skills: ['TypeScript', 'React', 'Node.js'],
      responsibilities: ['Lead projects', 'Mentor juniors'],
      requirements: ['5+ years experience', 'System design knowledge'],
    };
  });

  it('should generate technical topics from job skills', async () => {
    apiClientMock.generateContent.mockResolvedValue(
      JSON.stringify([
        {
          topic: 'System Design',
          difficulty: 'Advanced',
          keyPoints: ['Scalability', 'Database Design'],
          estimatedPrep: 480,
        },
      ])
    );
    apiClientMock.fetchSalaryData.mockResolvedValue({
      role: mockJob.title,
      location: 'US',
      range: { min: 150000, max: 250000 },
      marketTrend: 'Stable',
      negotiationTips: ['Research rates'],
    });

    const prep = await service.generateInterviewPrep(mockJob);

    expect(prep.technicalTopics).toHaveLength(1);
    expect(prep.technicalTopics[0]?.topic).toBe('System Design');
    expect(apiClientMock.generateContent).toHaveBeenCalled();
  });

  it('should infer seniority level from job title', () => {
    expect(service.inferSeniorityLevel('Principal Engineer')).toBe('Senior');
    expect(service.inferSeniorityLevel('Junior Developer')).toBe('Junior');
    expect(service.inferSeniorityLevel('Software Engineer')).toBe('Mid-Level');
  });

  it('should handle API errors gracefully', async () => {
    apiClientMock.generateContent.mockRejectedValue(new Error('API Rate Limited'));

    await expect(service.generateInterviewPrep(mockJob)).rejects.toThrow();
  });
});
