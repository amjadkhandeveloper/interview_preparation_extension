import type { JobDescription } from '@/shared/types';
import { extractJobFromUrl as extractFromUrl } from '@/shared/utils/tab-extractor';
import { isSupportedJobUrl, normalizeJobUrl } from '@/shared/utils/job-url';

export async function extractJobFromUrl(urlString: string): Promise<JobDescription> {
  const url = normalizeJobUrl(urlString);

  if (!isSupportedJobUrl(url)) {
    throw new Error(
      'Unsupported URL. Paste a job posting link from LinkedIn, Indeed, or Glassdoor.'
    );
  }

  return extractFromUrl(url);
}
