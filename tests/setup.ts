import { vi } from 'vitest';

const storageData: Record<string, unknown> = {};

const chromeMock = {
  runtime: {
    id: 'test-extension-id',
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    openOptionsPage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | null) => {
        if (keys === null) {
          return Promise.resolve({ ...storageData });
        }
        const keyList = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const key of keyList) {
          if (storageData[key] !== undefined) result[key] = storageData[key];
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        for (const key of keyList) delete storageData[key];
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(storageData).forEach((k) => delete storageData[k]);
        return Promise.resolve();
      }),
      getBytesInUse: vi.fn(() => Promise.resolve(0)),
    },
    sync: {
      get: vi.fn((keys: string | string[]) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const key of keyList) {
          if (storageData[key] !== undefined) result[key] = storageData[key];
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        for (const key of keyList) delete storageData[key];
        return Promise.resolve();
      }),
    },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  downloads: {
    download: vi.fn(() => Promise.resolve(1)),
  },
};

vi.stubGlobal('chrome', chromeMock);

export { chromeMock, storageData };
