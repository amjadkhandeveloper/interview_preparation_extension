import { CACHE_TTL_MS, STORAGE_KEYS } from '@/shared/constants';
import { Logger } from '@/shared/utils/logger';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

export class CacheManager {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('CacheManager');
  }

  private cacheKey(jobId: string, promptType: string): string {
    return `${STORAGE_KEYS.CACHE_PREFIX}${jobId}_${promptType}`;
  }

  async get(jobId: string, promptType: string): Promise<string | null> {
    const key = this.cacheKey(jobId, promptType);
    const result = await chrome.storage.local.get(key);
    const entry = result[key] as CacheEntry | undefined;

    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await chrome.storage.local.remove(key);
      return null;
    }

    return entry.value;
  }

  async set(jobId: string, promptType: string, value: string): Promise<void> {
    const key = this.cacheKey(jobId, promptType);
    const entry: CacheEntry = {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    await chrome.storage.local.set({ [key]: entry });
    this.logger.info(`Cached response for ${promptType}`);
  }

  async invalidate(jobId: string): Promise<void> {
    const all = await chrome.storage.local.get(null);
    const keys = Object.keys(all).filter(
      (k) => k.startsWith(STORAGE_KEYS.CACHE_PREFIX) && k.includes(jobId)
    );
    if (keys.length > 0) {
      await chrome.storage.local.remove(keys);
    }
  }
}
