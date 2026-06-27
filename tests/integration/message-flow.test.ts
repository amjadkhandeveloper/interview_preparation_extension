import { describe, it, expect } from 'vitest';
import { MessageType } from '@/shared/types';
import { MessageHandler } from '@/background/handlers/message-handler';

describe('MessageHandler integration', () => {
  it('should route GET_SETTINGS message', async () => {
    const handler = new MessageHandler();
    const result = await handler.handle({
      type: MessageType.GET_SETTINGS,
      payload: null,
      timestamp: Date.now(),
    });

    expect(result).toEqual({ provider: 'OpenAI', useConsolidatedPrompt: true });
  });

  it('should throw for unknown message type', async () => {
    const handler = new MessageHandler();

    await expect(
      handler.handle({
        type: 'UNKNOWN' as MessageType,
        payload: null,
        timestamp: Date.now(),
      })
    ).rejects.toThrow('Unknown message type');
  });
});
