import { CONTENT_MESSAGE_EXTRACT } from '@/shared/constants';
import type { JobDescription } from '@/shared/types';

function isConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Receiving end does not exist') ||
    message.includes('Could not establish connection')
  );
}

async function injectContentScript(tabId: number): Promise<void> {
  const scripts = chrome.runtime.getManifest().content_scripts?.[0]?.js;
  if (!scripts?.length) {
    throw new Error('Extension content script not found. Reload the extension and try again.');
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: scripts,
  });
}

async function sendExtractMessage(
  tabId: number
): Promise<{ success: boolean; job?: JobDescription; error?: string } | null> {
  try {
    return await chrome.tabs.sendMessage(tabId, {
      type: CONTENT_MESSAGE_EXTRACT,
      timestamp: Date.now(),
    });
  } catch (error) {
    if (isConnectionError(error)) return null;
    throw error;
  }
}

export async function extractJobFromTabId(tabId: number): Promise<JobDescription> {
  let response = await sendExtractMessage(tabId);

  if (!response) {
    await injectContentScript(tabId);
    response = await sendExtractMessage(tabId);
  }

  if (!response) {
    throw new Error(
      'Could not connect to the job page. Refresh the job posting and try again.'
    );
  }

  if (!response.success || !response.job) {
    throw new Error(
      response.error ||
        'Failed to extract job description. Open the full job detail page and try again.'
    );
  }

  return response.job;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForTabComplete(tabId: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      reject(new Error('Timed out loading the job page. Try Paste JD instead.'));
    }, timeoutMs);

    const onUpdated = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(onUpdated);

    void chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === 'complete') {
        clearTimeout(timeoutId);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve();
      }
    });
  });
}

const TAB_LOAD_TIMEOUT_MS = 45_000;
const SPA_SETTLE_MS = 2500;

export async function extractJobFromUrl(url: string): Promise<JobDescription> {
  const tab = await chrome.tabs.create({ url, active: false });
  if (!tab.id) throw new Error('Failed to open job URL');

  const tabId = tab.id;

  try {
    await waitForTabComplete(tabId, TAB_LOAD_TIMEOUT_MS);
    await delay(SPA_SETTLE_MS);
    return await extractJobFromTabId(tabId);
  } finally {
    await chrome.tabs.remove(tabId).catch(() => undefined);
  }
}
