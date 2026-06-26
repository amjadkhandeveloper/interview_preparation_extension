import type { ExtensionMessage } from '@/shared/types';
import { MessageType } from '@/shared/types';
import { generateMarkdownExport } from '@/shared/utils/markdown-export';
import { StorageManager } from '@/shared/utils/storage-manager';
import { ApiHandler } from './api-handler';
import { StorageHandler } from './storage-handler';

export class MessageHandler {
  private storageHandler: StorageHandler;
  private apiHandler: ApiHandler;
  private storage: StorageManager;

  constructor() {
    this.storage = new StorageManager();
    this.storageHandler = new StorageHandler(this.storage);
    this.apiHandler = new ApiHandler(this.storage);
  }

  async handle(message: ExtensionMessage): Promise<unknown> {
    switch (message.type) {
      case MessageType.EXTRACT_JOB:
        return this.storageHandler.saveJob(message.payload as Parameters<StorageHandler['saveJob']>[0]);

      case MessageType.ANALYZE_JOB:
        return this.apiHandler.analyzeJob(message.payload as string);

      case MessageType.GET_PREP_MATERIALS:
        return this.apiHandler.getPrepMaterials(message.payload as string);

      case MessageType.SAVE_ANALYSIS: {
        const prep = message.payload as Parameters<StorageHandler['saveAnalysis']>[0];
        return this.storageHandler.saveAnalysis(prep);
      }

      case MessageType.GET_HISTORY:
        return this.storageHandler.getHistory();

      case MessageType.DELETE_ANALYSIS:
        return this.storageHandler.deleteAnalysis(message.payload as string);

      case MessageType.UPDATE_SETTINGS:
        return this.storageHandler.updateSettings(
          message.payload as Parameters<StorageHandler['updateSettings']>[0]
        );

      case MessageType.GET_SETTINGS:
        return this.storageHandler.getSettings();

      case MessageType.SAVE_CREDENTIALS: {
        const { credentials, passphrase } = message.payload as {
          credentials: Parameters<StorageHandler['saveCredentials']>[0];
          passphrase?: string;
        };
        return this.storageHandler.saveCredentials(credentials, passphrase);
      }

      case MessageType.GET_CREDENTIALS_STATUS:
        return this.storageHandler.getCredentialsStatus();

      case MessageType.EXPORT_MARKDOWN:
        return this.handleExportMarkdown(message.payload as string);

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }

  private async handleExportMarkdown(jobId: string): Promise<{ success: boolean; filename: string }> {
    const records = await this.storage.getAllAnalyses();
    const record = records.find((r) => r.jobId === jobId);
    if (!record) throw new Error('Analysis not found');

    const markdown = generateMarkdownExport(record);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const filename = `interview-prep-${record.company.replace(/\s+/g, '-').toLowerCase()}.md`;

    await chrome.downloads.download({ url, filename, saveAs: true });
    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    return { success: true, filename };
  }
}
