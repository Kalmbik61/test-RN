import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ws } from '@/api/ws';
import { qk } from '@/utils/queryKeys';
import type { Post, PostsPage } from '@/api/posts';
import { hasPendingOwnComment } from '@/features/comments/pendingOwnComments';

type InfinitePostsData = {
  pages: PostsPage[];
  pageParams: unknown[];
};

function patchPostInPages(
  old: InfinitePostsData | undefined,
  postId: string,
  patcher: (post: Post) => Post,
): InfinitePostsData | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) => (p.id === postId ? patcher(p) : p)),
    })),
  };
}

type LikeUpdatedPayload = {
  postId: string;
  isLiked: boolean;
  likesCount: number;
};

type CommentAddedPayload = {
  postId: string;
};

type WsMessage = {
  type?: string;
  payload?: Partial<LikeUpdatedPayload & CommentAddedPayload>;
} & Partial<LikeUpdatedPayload & CommentAddedPayload>;

export function useWsCacheSync(): void {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = ws.on((raw) => {
      const msg = raw as WsMessage | null;
      if (!msg?.type) return;

      const data = msg.payload ?? msg;

      if (msg.type === 'like_updated') {
        const postId = data.postId;
        const isLiked = data.isLiked;
        const likesCount = data.likesCount;
        if (!postId || typeof isLiked !== 'boolean' || typeof likesCount !== 'number') return;

        qc.setQueriesData<InfinitePostsData>(
          { queryKey: ['feed'] },
          (old) => patchPostInPages(old, postId, (p) => ({ ...p, isLiked, likesCount })),
        );

        qc.setQueryData<{ post: Post }>(qk.post(postId), (old) => {
          if (!old) return old;
          return { post: { ...old.post, isLiked, likesCount } };
        });
      }

      if (msg.type === 'comment_added') {
        const postId = data.postId;
        if (!postId) return;
        if (hasPendingOwnComment(postId)) return;
        qc.invalidateQueries({ queryKey: qk.comments(postId) });
      }
    });

    return unsubscribe;
  }, [qc]);
}
