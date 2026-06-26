import { API_ENDPOINTS, API_MAX_RETRIES, API_TIMEOUT_MS, DEFAULT_MODELS } from '@/shared/constants';
import type { AiProvider } from '@/shared/types';
import { Logger } from '@/shared/utils/logger';

export class ApiClient {
  private apiKey: string;
  private provider: AiProvider;
  private logger: Logger;

  constructor(apiKey: string, provider: AiProvider) {
    this.apiKey = apiKey;
    this.provider = provider;
    this.logger = new Logger('ApiClient');
  }

  async generateContent(prompt: string): Promise<string> {
    for (let attempt = 1; attempt <= API_MAX_RETRIES; attempt++) {
      try {
        return await this.makeRequest(prompt);
      } catch (error) {
        if (attempt === API_MAX_RETRIES) {
          this.logger.error(`Failed after ${API_MAX_RETRIES} retries`, error);
          throw error;
        }

        const backoffMs = Math.pow(2, attempt) * 1000;
        this.logger.warn(`Retry ${attempt}/${API_MAX_RETRIES} after ${backoffMs}ms`);
        await this.delay(backoffMs);
      }
    }

    throw new Error('Request failed');
  }

  private async makeRequest(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await this.getProviderRequest(prompt, controller);

      if (!response.ok) {
        throw new ApiError(
          `API Error: ${response.status}`,
          response.status,
          await response.text()
        );
      }

      return await this.extractContent(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async getProviderRequest(
    prompt: string,
    controller: AbortController
  ): Promise<Response> {
    switch (this.provider) {
      case 'OpenAI':
        return this.openAiRequest(prompt, controller);
      case 'Anthropic':
        return this.anthropicRequest(prompt, controller);
      case 'GoogleAI':
        return this.googleAiRequest(prompt, controller);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  private openAiRequest(prompt: string, controller: AbortController): Promise<Response> {
    return fetch(API_ENDPOINTS.OPENAI, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODELS.OpenAI,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });
  }

  private anthropicRequest(prompt: string, controller: AbortController): Promise<Response> {
    return fetch(API_ENDPOINTS.ANTHROPIC, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: DEFAULT_MODELS.Anthropic,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });
  }

  private googleAiRequest(prompt: string, controller: AbortController): Promise<Response> {
    return fetch(`${API_ENDPOINTS.GOOGLE_AI}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: controller.signal,
    });
  }

  private async extractContent(response: Response): Promise<string> {
    const data = await response.json();

    switch (this.provider) {
      case 'OpenAI':
        return data.choices?.[0]?.message?.content || '';
      case 'Anthropic':
        return data.content?.[0]?.text || '';
      case 'GoogleAI':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      default:
        return '';
    }
  }

  async fetchSalaryData(role: string, company: string): Promise<{
    role: string;
    location: string;
    range: { min: number; max: number };
    marketTrend: 'Rising' | 'Stable' | 'Declining';
    negotiationTips: string[];
  }> {
    const prompt = `Estimate salary range for "${role}" at "${company}". Return JSON only:
{"role":"${role}","location":"US average","range":{"min":number,"max":number},"marketTrend":"Stable|Rising|Declining","negotiationTips":["tip1","tip2"]}`;

    try {
      const response = await this.generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {
      // fallback below
    }

    return {
      role,
      location: 'Unknown',
      range: { min: 0, max: 0 },
      marketTrend: 'Stable',
      negotiationTips: ['Research market rates', 'Leverage competing offers'],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class ApiError extends Error {
  statusCode: number;
  responseBody: string;

  constructor(message: string, statusCode: number, responseBody: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}
