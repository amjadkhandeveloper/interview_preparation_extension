import { SUPPORTED_JOB_HOSTS } from '@/shared/constants';

export function isSupportedJobHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return SUPPORTED_JOB_HOSTS.some(
    (supported) => host === supported || host.endsWith(`.${supported}`)
  );
}

export function isSupportedJobUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString.trim());
    if (url.protocol !== 'https:') return false;
    return isSupportedJobHost(url.hostname);
  } catch {
    return false;
  }
}

export function normalizeJobUrl(urlString: string): string {
  return urlString.trim();
}
