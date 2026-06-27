export async function openSidePanelInBackground(windowId?: number): Promise<void> {
  if (windowId !== undefined) {
    await chrome.sidePanel.open({ windowId });
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.windowId !== undefined) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return;
  }

  const window = await chrome.windows.getLastFocused();
  if (window.id !== undefined) {
    await chrome.sidePanel.open({ windowId: window.id });
  }
}

export async function openAnalyzeTabInBackground(): Promise<void> {
  await chrome.tabs.create({
    url: chrome.runtime.getURL('src/analyze/analyze.html'),
  });
}

function getSidePanelPath(): string {
  const path = chrome.runtime.getManifest().side_panel?.default_path;
  if (!path) {
    throw new Error('Side panel path is not configured in manifest.json');
  }
  return path;
}

async function enableSidePanelForTab(tabId: number): Promise<void> {
  await chrome.sidePanel.setOptions({
    tabId,
    path: getSidePanelPath(),
    enabled: true,
  });
}

export async function initializeSidePanel(): Promise<void> {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs
      .filter((tab) => tab.id && tab.url && !tab.url.startsWith('chrome://'))
      .map((tab) => enableSidePanelForTab(tab.id!))
  );
}

export function registerSidePanelListeners(): void {
  void initializeSidePanel();

  chrome.runtime.onInstalled.addListener(() => {
    void initializeSidePanel();
  });

  chrome.runtime.onStartup.addListener(() => {
    void initializeSidePanel();
  });

  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status !== 'complete' || !tab.url) return;
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

    void enableSidePanelForTab(tabId);
  });
}
