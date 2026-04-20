import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ws } from '@/api/ws';
import { qk } from '@/utils/queryKeys';
import type { Post, PostsPage } from '@/api/posts';

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
  type: string;
  payload: LikeUpdatedPayload | CommentAddedPayload;
};

export function useWsCacheSync(): void {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = ws.on((raw) => {
      const msg = raw as WsMessage | null;
      if (!msg?.type) return;

      if (msg.type === 'like_updated') {
        const { postId, isLiked, likesCount } = msg.payload as LikeUpdatedPayload;

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
        const { postId } = msg.payload as CommentAddedPayload;
        qc.invalidateQueries({ queryKey: qk.comments(postId) });
      }
    });

    return unsubscribe;
  }, [qc]);
}
