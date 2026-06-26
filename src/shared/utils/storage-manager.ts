import {
  ANALYSIS_KEY_PREFIX,
  JOB_KEY_PREFIX,
  STORAGE_EVICT_THRESHOLD,
  STORAGE_QUOTA_BYTES,
} from '../constants';
import { STORAGE_KEYS } from '../constants';
import type {
  AnalysisIndexEntry,
  AnalysisRecord,
  ApiCredentials,
  EncryptedApiCredentials,
  ExtensionSettings,
  InterviewPrep,
  JobDescription,
} from '../types';
import { decryptApiKey, encryptApiKey } from './crypto-manager';
import { Logger } from './logger';
import { validateSettings } from './validator';

export class StorageManager {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('StorageManager');
  }

  async saveJob(job: JobDescription): Promise<void> {
    await this.ensureStorageCapacity();
    const key = `${JOB_KEY_PREFIX}${job.id}`;
    const data = JSON.stringify(job);

    if (data.length > STORAGE_QUOTA_BYTES) {
      throw new Error('Job data exceeds storage quota');
    }

    await chrome.storage.local.set({ [key]: job });
  }

  async getJob(jobId: string): Promise<JobDescription | null> {
    const result = await chrome.storage.local.get(`${JOB_KEY_PREFIX}${jobId}`);
    return (result[`${JOB_KEY_PREFIX}${jobId}`] as JobDescription) || null;
  }

  async getAllJobs(): Promise<JobDescription[]> {
    const result = await chrome.storage.local.get(null);
    return Object.entries(result)
      .filter(([key]) => key.startsWith(JOB_KEY_PREFIX))
      .map(([, value]) => value as JobDescription);
  }

  async deleteJob(jobId: string): Promise<void> {
    await chrome.storage.local.remove(`${JOB_KEY_PREFIX}${jobId}`);
  }

  async saveAnalysis(prep: InterviewPrep, job: JobDescription): Promise<void> {
    await this.ensureStorageCapacity();
    const key = `${ANALYSIS_KEY_PREFIX}${prep.jobId}`;
    await chrome.storage.local.set({ [key]: prep });

    const index = await this.getAnalysisIndex();
    const entry: AnalysisIndexEntry = {
      jobId: prep.jobId,
      generatedAt: prep.generatedAt,
      title: job.title,
      company: job.company,
    };

    const filtered = index.filter((e) => e.jobId !== prep.jobId);
    filtered.unshift(entry);
    await chrome.storage.local.set({ [STORAGE_KEYS.ANALYSIS_INDEX]: filtered });
  }

  async getAnalysis(jobId: string): Promise<InterviewPrep | null> {
    const result = await chrome.storage.local.get(`${ANALYSIS_KEY_PREFIX}${jobId}`);
    return (result[`${ANALYSIS_KEY_PREFIX}${jobId}`] as InterviewPrep) || null;
  }

  async getAnalysisIndex(): Promise<AnalysisIndexEntry[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ANALYSIS_INDEX);
    return (result[STORAGE_KEYS.ANALYSIS_INDEX] as AnalysisIndexEntry[]) || [];
  }

  async getAllAnalyses(): Promise<AnalysisRecord[]> {
    const index = await this.getAnalysisIndex();
    const records: AnalysisRecord[] = [];

    for (const entry of index) {
      const [prep, job] = await Promise.all([
        this.getAnalysis(entry.jobId),
        this.getJob(entry.jobId),
      ]);

      if (prep && job) {
        records.push({
          jobId: entry.jobId,
          title: entry.title,
          company: entry.company,
          generatedAt: entry.generatedAt,
          prep,
          job,
        });
      }
    }

    return records;
  }

  async deleteAnalysis(jobId: string): Promise<void> {
    await chrome.storage.local.remove(`${ANALYSIS_KEY_PREFIX}${jobId}`);
    await this.deleteJob(jobId);

    const index = await this.getAnalysisIndex();
    await chrome.storage.local.set({
      [STORAGE_KEYS.ANALYSIS_INDEX]: index.filter((e) => e.jobId !== jobId),
    });
  }

  async saveApiCredentials(
    credentials: ApiCredentials,
    passphrase?: string
  ): Promise<void> {
    const { encryptedKey, iv } = await encryptApiKey(credentials.apiKey, passphrase);
    const encrypted: EncryptedApiCredentials = {
      provider: credentials.provider,
      encryptedKey,
      iv,
      encryptedAt: Date.now(),
    };
    await chrome.storage.sync.set({ [STORAGE_KEYS.API_CREDENTIALS]: encrypted });
  }

  async getApiCredentials(passphrase?: string): Promise<ApiCredentials | null> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.API_CREDENTIALS);
    const encrypted = result[STORAGE_KEYS.API_CREDENTIALS] as EncryptedApiCredentials | undefined;
    if (!encrypted) return null;

    const apiKey = await decryptApiKey(encrypted.encryptedKey, encrypted.iv, passphrase);
    return { provider: encrypted.provider, apiKey };
  }

  async hasApiCredentials(): Promise<boolean> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.API_CREDENTIALS);
    return Boolean(result[STORAGE_KEYS.API_CREDENTIALS]);
  }

  async saveSettings(settings: ExtensionSettings): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
  }

  async getSettings(): Promise<ExtensionSettings> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    return validateSettings(result[STORAGE_KEYS.SETTINGS]);
  }

  async getStorageUsage(): Promise<number> {
    return chrome.storage.local.getBytesInUse(null);
  }

  async ensureStorageCapacity(): Promise<void> {
    const usage = await this.getStorageUsage();
    if (usage < STORAGE_QUOTA_BYTES * STORAGE_EVICT_THRESHOLD) return;

    this.logger.warn('Storage approaching quota, evicting oldest analyses');
    const index = await this.getAnalysisIndex();
    const sorted = [...index].sort((a, b) => a.generatedAt - b.generatedAt);

    while (
      sorted.length > 0 &&
      (await this.getStorageUsage()) > STORAGE_QUOTA_BYTES * STORAGE_EVICT_THRESHOLD
    ) {
      const oldest = sorted.shift();
      if (oldest) await this.deleteAnalysis(oldest.jobId);
    }
  }

  async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
    await chrome.storage.sync.remove([STORAGE_KEYS.API_CREDENTIALS, STORAGE_KEYS.SETTINGS]);
  }
}
