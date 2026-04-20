import { request } from './client';
import type { Author } from './posts';

export type Comment = {
  id: string;
  postId: string;
  author: Author;
  text: string;
  createdAt: string;
};

export type CommentsPage = {
  comments: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type GetCommentsParams = {
  cursor?: string;
  limit?: number;
};

export const getComments = (
  token: string,
  postId: string,
  params: GetCommentsParams,
  retryOn401?: () => Promise<string>,
): Promise<CommentsPage> => {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  q.set('limit', String(params.limit ?? 20));
  return request<CommentsPage>(`/posts/${postId}/comments?${q.toString()}`, {
    method: 'GET',
    token,
    retryOn401,
  });
};

export const addComment = (
  token: string,
  postId: string,
  text: string,
  retryOn401?: () => Promise<string>,
): Promise<{ comment: Comment }> =>
  request<{ comment: Comment }>(`/posts/${postId}/comments`, {
    method: 'POST',
    token,
    retryOn401,
    body: JSON.stringify({ text }),
  });
