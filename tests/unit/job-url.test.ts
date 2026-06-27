import { describe, it, expect } from 'vitest';
import { isSupportedJobUrl } from '@/shared/utils/job-url';

describe('job-url', () => {
  it('accepts supported job posting URLs', () => {
    expect(isSupportedJobUrl('https://www.linkedin.com/jobs/view/123')).toBe(true);
    expect(isSupportedJobUrl('https://in.linkedin.com/jobs/view/123')).toBe(true);
    expect(isSupportedJobUrl('https://www.indeed.com/viewjob?jk=abc')).toBe(true);
    expect(isSupportedJobUrl('https://www.glassdoor.com/job-listing/x')).toBe(true);
  });

  it('rejects unsupported URLs', () => {
    expect(isSupportedJobUrl('http://www.linkedin.com/jobs/view/123')).toBe(false);
    expect(isSupportedJobUrl('https://example.com/jobs/1')).toBe(false);
    expect(isSupportedJobUrl('not-a-url')).toBe(false);
  });
});
