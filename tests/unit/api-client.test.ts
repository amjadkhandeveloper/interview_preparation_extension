import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/services/api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call OpenAI API and extract content', async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: '{"result": "ok"}' } }],
        }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const client = new ApiClient('sk-test1234567890', 'OpenAI');
    const result = await client.generateContent('test prompt');

    expect(result).toBe('{"result": "ok"}');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should throw ApiError on failed response', async () => {
    vi.useFakeTimers();

    const mockResponse = {
      ok: false,
      status: 429,
      text: () => Promise.resolve('Rate limited'),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const client = new ApiClient('sk-test1234567890', 'OpenAI');
    const assertion = expect(client.generateContent('test')).rejects.toThrow('API Error: 429');

    await vi.runAllTimersAsync();
    await assertion;

    vi.useRealTimers();
  });
});
