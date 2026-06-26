import type { JobPlatform } from '@/shared/types';

export class PlatformDetector {
  static detect(): JobPlatform {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('indeed')) return 'Indeed';
    if (hostname.includes('glassdoor')) return 'Glassdoor';
    return 'Company Career';
  }

  static isSupportedHost(hostname: string): boolean {
    const lower = hostname.toLowerCase();
    return (
      lower.includes('linkedin.com') ||
      lower.includes('indeed.com') ||
      lower.includes('glassdoor.com') ||
      lower.includes('careers.google.com') ||
      lower.includes('careers.apple.com')
    );
  }
}
