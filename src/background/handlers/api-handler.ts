import type { InterviewPrep, JobDescription } from '@/shared/types';
import { StorageManager } from '@/shared/utils/storage-manager';
import { ApiClient } from '@/services/api-client';
import { CacheManager } from '@/services/cache-manager';
import { InterviewService } from '@/services/interview-service';

export class ApiHandler {
  private storage: StorageManager;
  private cacheManager: CacheManager;

  constructor(storage?: StorageManager) {
    this.storage = storage ?? new StorageManager();
    this.cacheManager = new CacheManager();
  }

  async analyzeJob(jobId: string): Promise<InterviewPrep> {
    const job = await this.storage.getJob(jobId);
    if (!job) throw new Error('Job not found');

    const settings = await this.storage.getSettings();
    const credentials = await this.storage.getApiCredentials(settings.passphrase);
    if (!credentials) throw new Error('API credentials not configured');

    const apiClient = new ApiClient(credentials.apiKey, credentials.provider);
    const interviewService = new InterviewService(apiClient, settings, this.cacheManager);

    const prep = await interviewService.generateInterviewPrep(job);
    await this.storage.saveAnalysis(prep, job);
    return prep;
  }

  async getPrepMaterials(jobId: string): Promise<InterviewPrep | null> {
    return this.storage.getAnalysis(jobId);
  }

  async analyzeJobDirect(job: JobDescription): Promise<InterviewPrep> {
    await this.storage.saveJob(job);
    return this.analyzeJob(job.id);
  }
}
