/**
 * T2 — useFeed smoke tests
 * Using direct fetch mock instead of MSW + renderHook to avoid RN polyfill complexity.
 * Tests the getPosts fetcher that useFeed delegates to.
 */
import { getPosts } from '@/api/posts';
import { ApiError } from '@/api/types';

jest.mock('react-native-get-random-values', () => ({}));

function makeResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

describe('getPosts fetcher (useFeed integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('happy path — returns 2 posts', async () => {
    const posts = [
      { id: '1', title: 'Post 1', tier: 'free', likesCount: 0, isLiked: false },
      { id: '2', title: 'Post 2', tier: 'paid', likesCount: 5, isLiked: true },
    ];
    global.fetch = jest.fn().mockResolvedValueOnce(
      makeResponse(200, {
        ok: true,
        data: { posts, nextCursor: null, hasMore: false },
      }),
    );

    const result = await getPosts('uuid-test', {});
    expect(result.posts).toHaveLength(2);
    expect(result.hasMore).toBe(false);
  });

  it('empty feed — returns empty array', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      makeResponse(200, {
        ok: true,
        data: { posts: [], nextCursor: null, hasMore: false },
      }),
    );

    const result = await getPosts('uuid-test', {});
    expect(result.posts).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });

  it('simulate_error — server 500 → throws ApiError SERVER', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      makeResponse(500, { ok: false, error: { message: 'Internal error' } }),
    );

    let caught: unknown;
    try {
      await getPosts('uuid-test', { simulateError: true });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).code).toBe('SERVER');
  });
});
