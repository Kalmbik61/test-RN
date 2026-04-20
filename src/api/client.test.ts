import { request } from './client';
import { ApiError } from './types';

// Mock react-native-get-random-values (required by uuid used in uuid utils)
jest.mock('react-native-get-random-values', () => ({}));

function makeResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

describe('request()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('200 ok — returns data', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(makeResponse(200, { ok: true, data: { x: 1 } }));
    const result = await request('/x', { token: 't' });
    expect(result).toEqual({ x: 1 });
  });

  it('401 → retryOn401 returns fresh token → second 200 → returns data', async () => {
    const retryOn401 = jest.fn().mockResolvedValue('fresh-token');
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeResponse(401, { ok: false, error: { message: 'Unauthorized' } }))
      .mockResolvedValueOnce(makeResponse(200, { ok: true, data: { x: 2 } }));

    const result = await request('/x', { token: 'old-token', retryOn401 });
    expect(result).toEqual({ x: 2 });
    expect(retryOn401).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(2);
  });

  it('401 → retryOn401 → second 401 → throws ApiError UNAUTHORIZED', async () => {
    const retryOn401 = jest.fn().mockResolvedValue('fresh-token');
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeResponse(401, { ok: false, error: { message: 'Unauthorized' } }))
      .mockResolvedValueOnce(makeResponse(401, { ok: false, error: { message: 'Unauthorized' } }));

    await expect(request('/x', { token: 'old-token', retryOn401 })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      retryable: false,
    });
  });

  it('404 → throws ApiError NOT_FOUND retryable=false', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeResponse(404, { ok: false, error: { message: 'Not found' } }));
    let caught: unknown;
    try {
      await request('/x', { token: 't' });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught).toMatchObject({ code: 'NOT_FOUND', retryable: false });
  });

  it('500 → throws ApiError SERVER retryable=true', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeResponse(500, { ok: false, error: { message: 'Internal error' } }));
    await expect(request('/x', { token: 't' })).rejects.toMatchObject({
      code: 'SERVER',
      retryable: true,
    });
  });

  it('timeout → throws ApiError TIMEOUT retryable=true', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn((_, init: RequestInit) => {
      return new Promise((_, reject) => {
        const signal = init?.signal as AbortSignal;
        if (signal) {
          signal.addEventListener('abort', () => {
            const e = new Error('aborted');
            e.name = 'AbortError';
            reject(e);
          });
        }
      });
    }) as jest.Mock;

    const promise = request('/x', { token: 't' });
    jest.advanceTimersByTime(15001);
    // Flush microtasks
    await Promise.resolve();
    await Promise.resolve();

    await expect(promise).rejects.toMatchObject({
      code: 'TIMEOUT',
      retryable: true,
    });
    jest.useRealTimers();
  });

  it('network error → throws ApiError NETWORK', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(request('/x', { token: 't' })).rejects.toMatchObject({
      code: 'NETWORK',
    });
  });
});
