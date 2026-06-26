import { MAX_DESCRIPTION_LENGTH, SKILL_KEYWORDS } from '@/shared/constants';
import type { JobDescription, JobPlatform } from '@/shared/types';
import { PlatformDetector } from './platform-detector';

export class JobExtractor {
  static extractFromPage(): JobDescription | null {
    const platform = PlatformDetector.detect();

    switch (platform) {
      case 'LinkedIn':
        return this.extractLinkedInJob();
      case 'Indeed':
        return this.extractIndeedJob();
      case 'Glassdoor':
        return this.extractGlassdoorJob();
      default:
        return this.extractGenericJob();
    }
  }

  private static extractLinkedInJob(): JobDescription | null {
    try {
      const title = this.findTextBySelectors([
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title',
        '[class*="job-title"] h1',
        'h1.t-24',
        'h2[class*="title"]',
      ]);

      const company = this.findTextBySelectors([
        '.job-details-jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name a',
        '[class*="company-name"] a',
        'a[href*="/company/"]',
      ]);

      const description = this.findTextBySelectors([
        '#job-details',
        '.jobs-description__content',
        '[class*="description"]',
        '[class*="show-more-less-html"]',
      ]);

      return this.buildJob(title, company, description, 'LinkedIn');
    } catch (error) {
      console.error('LinkedIn extraction failed:', error);
      return null;
    }
  }

  private static extractIndeedJob(): JobDescription | null {
    try {
      const title = this.findTextBySelectors([
        '[data-testid="jobsearch-JobInfoHeader-title"]',
        '.jobsearch-JobInfoHeader-title',
        'h1.jobsearch-JobInfoHeader-title',
      ]);

      const company = this.findTextBySelectors([
        '[data-testid="inlineHeader-companyName"]',
        '.jobsearch-InlineCompanyRating a',
      ]) ?? this.findAttributeBySelectors(['[data-company-name]'], 'data-company-name');

      const description = this.findTextBySelectors([
        '#jobDescriptionText',
        '[id="jobDescriptionText"]',
        '.jobsearch-jobDescriptionText',
      ]);

      return this.buildJob(title, company, description, 'Indeed');
    } catch (error) {
      console.error('Indeed extraction failed:', error);
      return null;
    }
  }

  private static extractGlassdoorJob(): JobDescription | null {
    try {
      const title = this.findTextBySelectors([
        '[data-test="job-title"]',
        'h1[class*="JobDetails"]',
        'h1',
      ]);

      const company = this.findTextBySelectors([
        '[data-test="employer-name"]',
        '[class*="employerName"]',
      ]);

      const description = this.findTextBySelectors([
        '[class*="JobDetails_jobDescription"]',
        '[data-test="description"]',
        '.desc',
      ]);

      return this.buildJob(title, company, description, 'Glassdoor');
    } catch (error) {
      console.error('Glassdoor extraction failed:', error);
      return null;
    }
  }

  private static extractGenericJob(): JobDescription | null {
    const title = this.findTextBySelectors([
      'h1',
      '[class*="job-title"]',
      '[data-job-title]',
    ]);

    const company = this.findTextBySelectors(['[class*="company"]', '[data-company]']);

    const description = this.findTextBySelectors([
      '[class*="description"]',
      'main',
      'article',
    ]);

    return this.buildJob(title, company, description, 'Company Career');
  }

  private static buildJob(
    title: string | null,
    company: string | null,
    description: string | null,
    platform: JobPlatform
  ): JobDescription | null {
    if (!title || !description) {
      console.warn('Incomplete job extraction');
      return null;
    }

    const trimmedDescription = description.trim().slice(0, MAX_DESCRIPTION_LENGTH);

    return {
      id: this.generateId(),
      title: title.trim(),
      company: company?.trim() || 'Unknown',
      description: trimmedDescription,
      url: window.location.href,
      platform,
      extractedAt: Date.now(),
      skills: this.extractSkills(trimmedDescription),
      responsibilities: this.extractResponsibilities(trimmedDescription),
      requirements: this.extractRequirements(trimmedDescription),
    };
  }

  private static extractSkills(text: string): string[] {
    const foundSkills = new Set<string>();
    const lowerText = text.toLowerCase();

    for (const skill of SKILL_KEYWORDS) {
      if (new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&').toLowerCase()}\\b`, 'i').test(lowerText)) {
        foundSkills.add(skill);
      }
    }

    return Array.from(foundSkills).sort();
  }

  private static extractResponsibilities(text: string): string[] {
    const lines = text.split('\n').filter((line) => line.trim().length > 20);
    return lines
      .filter((line) => /^[-•*]|^(\d+\.)/.test(line.trim()))
      .map((line) => line.replace(/^[-•*\d.]+\s*/, '').trim())
      .slice(0, 10);
  }

  private static extractRequirements(text: string): string[] {
    const requirementSection = text.split(/requirements|qualifications|must have|desired|prefer/i)[1];

    if (!requirementSection) return [];

    return requirementSection
      .split('\n')
      .filter((line) => /^[-•*]|^(\d+\.)/.test(line.trim()))
      .map((line) => line.replace(/^[-•*\d.]+\s*/, '').trim())
      .slice(0, 10);
  }

  private static findTextBySelectors(selectors: string[]): string | null {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent;
      }
    }
    return null;
  }

  private static findAttributeBySelectors(
    selectors: string[],
    attribute: string
  ): string | null {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const value = el?.getAttribute(attribute)?.trim();
      if (value) return value;
    }
    return null;
  }

  private static generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
