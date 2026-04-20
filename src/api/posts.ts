import { request } from './client';

export type Author = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  subscribersCount?: number;
  isVerified?: boolean;
};

export type PostTier = 'free' | 'paid';

export type Post = {
  id: string;
  author: Author;
  title: string;
  body: string;
  preview: string;
  coverUrl: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  tier: PostTier;
  createdAt: string;
};

export type PostsPage = {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type GetPostsParams = {
  cursor?: string;
  tier?: PostTier;
  limit?: number;
  simulateError?: boolean;
};

export const getPosts = (
  token: string,
  params: GetPostsParams,
  retryOn401?: () => Promise<string>,
): Promise<PostsPage> => {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.tier) q.set('tier', params.tier);
  q.set('limit', String(params.limit ?? 10));
  if (params.simulateError) q.set('simulate_error', 'true');
  return request<PostsPage>(`/posts?${q.toString()}`, {
    method: 'GET',
    token,
    retryOn401,
  });
};

export const getPost = (
  token: string,
  id: string,
  retryOn401?: () => Promise<string>,
): Promise<{ post: Post }> =>
  request<{ post: Post }>(`/posts/${id}`, { method: 'GET', token, retryOn401 });

export const togglePostLike = (
  token: string,
  id: string,
  retryOn401?: () => Promise<string>,
): Promise<{ isLiked: boolean; likesCount: number }> =>
  request<{ isLiked: boolean; likesCount: number }>(`/posts/${id}/like`, {
    method: 'POST',
    token,
    retryOn401,
  });
