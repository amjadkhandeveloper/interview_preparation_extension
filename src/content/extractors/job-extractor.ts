import { MAX_DESCRIPTION_LENGTH } from '@/shared/constants';
import type { JobDescription, JobPlatform } from '@/shared/types';
import { buildJobDescription } from '@/shared/utils/job-parser';
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

    return buildJobDescription({
      title,
      company: company || 'Unknown',
      description: description.trim().slice(0, MAX_DESCRIPTION_LENGTH),
      url: window.location.href,
      platform,
    });
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
}
