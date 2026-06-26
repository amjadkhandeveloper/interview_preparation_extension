import type {
  AnalysisRecord,
  ExtensionMessage,
  ExtensionSettings,
  InterviewPrep,
  JobDescription,
} from '@/shared/types';
import { MessageType } from '@/shared/types';

async function sendMessage<T>(message: ExtensionMessage): Promise<T> {
  const response = await chrome.runtime.sendMessage(message);
  if (response?.error) {
    throw new Error(response.error);
  }
  return response?.data as T;
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
  const response = await chrome.tabs.sendMessage(tabId, {
    type: 'EXTRACT_JOB',
    timestamp: Date.now(),
  });

  if (!response?.success || !response.job) {
    throw new Error(response?.error || 'Failed to extract job description');
  }

  return response.job;
}

export async function isSupportedJobTab(): Promise<boolean> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return false;

  try {
    const url = new URL(tab.url);
    const host = url.hostname.toLowerCase();
    return (
      host.includes('linkedin.com') ||
      host.includes('indeed.com') ||
      host.includes('glassdoor.com') ||
      host.includes('careers.google.com') ||
      host.includes('careers.apple.com')
    );
  } catch {
    return false;
  }
}
