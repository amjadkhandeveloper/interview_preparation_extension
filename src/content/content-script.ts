import { CONTENT_MESSAGE_EXTRACT } from '@/shared/constants';
import type { ContentExtractResponse } from '@/shared/types';
import { JobExtractor } from './extractors/job-extractor';

const CONTENT_SCRIPT_KEY = '__interviewPrepContentScriptLoaded';
const globalScope = globalThis as unknown as Record<string, boolean>;

if (!globalScope[CONTENT_SCRIPT_KEY]) {
  globalScope[CONTENT_SCRIPT_KEY] = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === CONTENT_MESSAGE_EXTRACT) {
      const job = JobExtractor.extractFromPage();
      const response: ContentExtractResponse = job
        ? { success: true, job }
        : { success: false, error: 'Could not extract job from this page' };
      sendResponse(response);
      return true;
    }
    return false;
  });
}
