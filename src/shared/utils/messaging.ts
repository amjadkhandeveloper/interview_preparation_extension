import type {
  AnalysisRecord,
  ExtensionMessage,
  ExtensionSettings,
  InterviewPrep,
  JobDescription,
} from '@/shared/types';
import { MessageType } from '@/shared/types';
import { extractJobFromTabId } from '@/shared/utils/tab-extractor';
import { isSupportedJobHost } from '@/shared/utils/job-url';

async function sendMessage<T>(message: ExtensionMessage): Promise<T> {
  let response: { data?: T; error?: string } | undefined;

  try {
    response = await chrome.runtime.sendMessage(message);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    if (messageText.includes('Receiving end does not exist')) {
      throw new Error(
        'Extension background is not ready. Reload the extension at chrome://extensions and try again.',
        { cause: error }
      );
    }
    throw error;
  }

  if (!response) {
    throw new Error(
      'No response from extension background. Reload the extension at chrome://extensions and try again.'
    );
  }

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data as T;
}

export async function saveJob(job: JobDescription): Promise<void> {
  await sendMessage({
    type: MessageType.EXTRACT_JOB,
    payload: job,
    timestamp: Date.now(),
  });
}

export async function analyzeJob(jobId: string): Promise<InterviewPrep> {
  return sendMessage<InterviewPrep>({
    type: MessageType.ANALYZE_JOB,
    payload: jobId,
    timestamp: Date.now(),
  });
}

export async function saveAnalysis(prep: InterviewPrep): Promise<void> {
  await sendMessage({
    type: MessageType.SAVE_ANALYSIS,
    payload: prep,
    timestamp: Date.now(),
  });
}

export async function getHistory(): Promise<AnalysisRecord[]> {
  return sendMessage<AnalysisRecord[]>({
    type: MessageType.GET_HISTORY,
    payload: null,
    timestamp: Date.now(),
  });
}

export async function deleteAnalysis(jobId: string): Promise<void> {
  await sendMessage({
    type: MessageType.DELETE_ANALYSIS,
    payload: jobId,
    timestamp: Date.now(),
  });
}

export async function getSettings(): Promise<ExtensionSettings> {
  return sendMessage<ExtensionSettings>({
    type: MessageType.GET_SETTINGS,
    payload: null,
    timestamp: Date.now(),
  });
}

export async function updateSettings(settings: ExtensionSettings): Promise<void> {
  await sendMessage({
    type: MessageType.UPDATE_SETTINGS,
    payload: settings,
    timestamp: Date.now(),
  });
}

export async function saveCredentials(
  credentials: { provider: ExtensionSettings['provider']; apiKey: string },
  passphrase?: string
): Promise<void> {
  await sendMessage({
    type: MessageType.SAVE_CREDENTIALS,
    payload: { credentials, passphrase },
    timestamp: Date.now(),
  });
}

export async function getCredentialsStatus(): Promise<boolean> {
  const result = await sendMessage<{ configured: boolean }>({
    type: MessageType.GET_CREDENTIALS_STATUS,
    payload: null,
    timestamp: Date.now(),
  });
  return result.configured;
}

export async function exportMarkdown(jobId: string): Promise<void> {
  await sendMessage({
    type: MessageType.EXPORT_MARKDOWN,
    payload: jobId,
    timestamp: Date.now(),
  });
}

export async function extractJobFromTab(tabId: number): Promise<JobDescription> {
  return extractJobFromTabId(tabId);
}

export async function extractJobFromUrl(url: string): Promise<JobDescription> {
  return sendMessage<JobDescription>({
    type: MessageType.EXTRACT_JOB_FROM_URL,
    payload: url,
    timestamp: Date.now(),
  });
}

export async function isSupportedJobTab(): Promise<boolean> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return false;

  try {
    const url = new URL(tab.url);
    return isSupportedJobHost(url.hostname);
  } catch {
    return false;
  }
}

export async function openSidePanel(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await sendMessage({
    type: MessageType.OPEN_SIDE_PANEL,
    payload: { windowId: tab?.windowId },
    timestamp: Date.now(),
  });
}

export async function openAnalyzeTab(): Promise<void> {
  await sendMessage({
    type: MessageType.OPEN_ANALYZE_TAB,
    payload: null,
    timestamp: Date.now(),
  });
}

export { isSupportedJobUrl } from '@/shared/utils/job-url';
