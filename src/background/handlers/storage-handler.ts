import type {
  AnalysisRecord,
  ApiCredentials,
  ExtensionSettings,
  InterviewPrep,
  JobDescription,
} from '@/shared/types';
import { StorageManager } from '@/shared/utils/storage-manager';

export class StorageHandler {
  constructor(private storage: StorageManager) {}

  async saveJob(job: JobDescription): Promise<{ success: boolean }> {
    await this.storage.saveJob(job);
    return { success: true };
  }

  async saveAnalysis(prep: InterviewPrep, job?: JobDescription): Promise<{ success: boolean }> {
    const jobData = job ?? (await this.storage.getJob(prep.jobId));
    if (!jobData) throw new Error('Job not found for analysis');
    await this.storage.saveAnalysis(prep, jobData);
    return { success: true };
  }

  async getHistory(): Promise<AnalysisRecord[]> {
    return this.storage.getAllAnalyses();
  }

  async deleteAnalysis(jobId: string): Promise<{ success: boolean }> {
    await this.storage.deleteAnalysis(jobId);
    return { success: true };
  }

  async updateSettings(settings: ExtensionSettings): Promise<{ success: boolean }> {
    await this.storage.saveSettings(settings);
    return { success: true };
  }

  async getSettings(): Promise<ExtensionSettings> {
    return this.storage.getSettings();
  }

  async saveCredentials(
    credentials: ApiCredentials,
    passphrase?: string
  ): Promise<{ success: boolean }> {
    await this.storage.saveApiCredentials(credentials, passphrase);
    return { success: true };
  }

  async getCredentialsStatus(): Promise<{ configured: boolean }> {
    const configured = await this.storage.hasApiCredentials();
    return { configured };
  }
}
