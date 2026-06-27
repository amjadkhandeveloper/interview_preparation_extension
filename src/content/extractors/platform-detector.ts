import type { JobPlatform } from '@/shared/types';
import { SUPPORTED_JOB_HOSTS } from '@/shared/constants';

export class PlatformDetector {
  static detect(): JobPlatform {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('indeed')) return 'Indeed';
    if (hostname.includes('glassdoor')) return 'Glassdoor';
    return 'Company Career';
  }

  static isSupportedHost(hostname: string): boolean {
    const host = hostname.toLowerCase();
    return SUPPORTED_JOB_HOSTS.some(
      (supported) => host === supported || host.endsWith(`.${supported}`)
    );
  }
}
