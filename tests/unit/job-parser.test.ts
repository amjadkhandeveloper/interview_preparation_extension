import { describe, it, expect } from 'vitest';
import { parsePastedJob, extractSkills } from '@/shared/utils/job-parser';

describe('job-parser', () => {
  it('should parse pasted job with title and description', () => {
    const job = parsePastedJob(
      'Senior Engineer',
      'Acme Corp',
      'We need a Senior Engineer with Python, React, and AWS experience. '.repeat(3)
    );

    expect(job.title).toBe('Senior Engineer');
    expect(job.company).toBe('Acme Corp');
    expect(job.platform).toBe('Company Career');
    expect(job.skills).toContain('Python');
    expect(job.skills).toContain('React');
  });

  it('should require job title', () => {
    expect(() => parsePastedJob('', 'Acme', 'A'.repeat(60))).toThrow('Job title is required');
  });

  it('should require minimum description length', () => {
    expect(() => parsePastedJob('Engineer', 'Acme', 'Too short')).toThrow('too short');
  });

  it('should extract skills from text', () => {
    const skills = extractSkills('Experience with TypeScript, Docker, and Kubernetes required.');
    expect(skills).toContain('TypeScript');
    expect(skills).toContain('Docker');
  });
});
