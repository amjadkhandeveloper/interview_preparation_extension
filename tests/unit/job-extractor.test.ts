import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JobExtractor } from '@/content/extractors/job-extractor';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): void {
  const html = readFileSync(resolve(__dirname, `../fixtures/${name}`), 'utf-8');
  document.documentElement.innerHTML = html;
  Object.defineProperty(window, 'location', {
    value: { href: 'https://www.linkedin.com/jobs/view/123', hostname: 'www.linkedin.com' },
    writable: true,
  });
}

describe('JobExtractor', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
  });

  it('should extract LinkedIn job details from fixture', () => {
    loadFixture('linkedin-job.html');
    const job = JobExtractor.extractFromPage();

    expect(job).not.toBeNull();
    expect(job?.title).toBe('Senior Software Engineer');
    expect(job?.company).toBe('Acme Corp');
    expect(job?.platform).toBe('LinkedIn');
    expect(job?.skills).toContain('Python');
    expect(job?.skills).toContain('React');
  });

  it('should extract Indeed job details from fixture', () => {
    const html = readFileSync(resolve(__dirname, '../fixtures/indeed-job.html'), 'utf-8');
    document.documentElement.innerHTML = html;
    Object.defineProperty(window, 'location', {
      value: { href: 'https://www.indeed.com/viewjob?jk=123', hostname: 'www.indeed.com' },
      writable: true,
    });

    const job = JobExtractor.extractFromPage();

    expect(job).not.toBeNull();
    expect(job?.title).toBe('Full Stack Developer');
    expect(job?.company).toBe('TechStart Inc');
    expect(job?.platform).toBe('Indeed');
    expect(job?.skills).toContain('React');
  });
});
