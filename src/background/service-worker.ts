import type { ExtensionMessage } from '@/shared/types';
import { MessageHandler } from './handlers/message-handler';
import { registerSidePanelListeners } from './side-panel';

const messageHandler = new MessageHandler();

registerSidePanelListeners();

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onMessage.addListener(
  (request: ExtensionMessage, _sender, sendResponse: (response: unknown) => void) => {
    messageHandler
      .handle(request)
      .then((data) => sendResponse({ data }))
      .catch((error: Error) => sendResponse({ error: error.message }));

    return true;
  }
);
