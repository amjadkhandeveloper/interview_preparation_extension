import { describe, it, expect } from 'vitest';
import {
  isValidJobDescription,
  validateApiKey,
  validateTechnicalTopics,
  validateSettings,
} from '@/shared/utils/validator';

describe('validator', () => {
  it('should validate job description', () => {
    const valid = {
      id: 'job_1',
      title: 'Engineer',
      company: 'Acme',
      description: 'desc',
      url: 'https://example.com',
      platform: 'LinkedIn' as const,
      extractedAt: Date.now(),
      skills: ['Python'],
      responsibilities: [],
      requirements: [],
    };

    expect(isValidJobDescription(valid)).toBe(true);
    expect(isValidJobDescription(null)).toBe(false);
  });

  it('should validate API keys by provider', () => {
    expect(validateApiKey('OpenAI', 'sk-abc1234567890')).toBe(true);
    expect(validateApiKey('OpenAI', 'invalid')).toBe(false);
    expect(validateApiKey('Anthropic', 'sk-ant-abc1234567890')).toBe(true);
    expect(validateApiKey('GoogleAI', 'AIzaSyD1234567890abcdefghijklmnop')).toBe(true);
  });

  it('should validate technical topics array', () => {
    const topics = validateTechnicalTopics([
      { topic: 'React', keyPoints: ['Hooks', 'State'] },
    ]);
    expect(topics).toHaveLength(1);
    expect(topics[0]?.difficulty).toBe('Intermediate');
  });

  it('should return default settings for invalid input', () => {
    const settings = validateSettings(null);
    expect(settings.provider).toBe('OpenAI');
    expect(settings.useConsolidatedPrompt).toBe(true);
  });
});
