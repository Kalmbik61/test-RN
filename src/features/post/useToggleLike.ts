import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { togglePostLike } from '@/api/posts';
import { useAuth } from '@/store/AuthContext';
import { qk } from '@/utils/queryKeys';
import type { PostsPage } from '@/api/posts';

type FeedSnapshot = [QueryKey, unknown][];
type PostDetailSnapshot = unknown;

type MutationContext = {
  feedPages: FeedSnapshot;
  postDetail: PostDetailSnapshot;
};

export function useToggleLike(postId: string) {
  const { uuid, regenerate } = useAuth();
  const qc = useQueryClient();

  return useMutation<{ isLiked: boolean; likesCount: number }, Error, void, MutationContext>({
    mutationFn: () => togglePostLike(uuid!, postId, regenerate),

    onMutate: async (): Promise<MutationContext> => {
      await qc.cancelQueries({ queryKey: ['feed'] });
      await qc.cancelQueries({ queryKey: qk.post(postId) });

      const feedPages = qc.getQueriesData<{ pages: PostsPage[] }>({ queryKey: ['feed'] }) as FeedSnapshot;
      const postDetail = qc.getQueryData(qk.post(postId));

      // Optimistic patch — all feed pages
      qc.setQueriesData<{ pages: PostsPage[]; pageParams: unknown[] }>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((p) =>
                p.id === postId
                  ? { ...p, isLiked: !p.isLiked, likesCount: p.likesCount + (p.isLiked ? -1 : 1) }
                  : p,
              ),
            })),
          };
        },
      );

      // Optimistic patch — post detail
      qc.setQueryData<{ post: PostsPage['posts'][number] }>(
        qk.post(postId),
        (old) => {
          if (!old) return old;
          const post = old.post;
          return {
            post: {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.likesCount + (post.isLiked ? -1 : 1),
            },
          };
        },
      );

      return { feedPages, postDetail };
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      (ctx.feedPages as FeedSnapshot).forEach(([key, value]) => qc.setQueryData(key, value));
      if (ctx.postDetail !== undefined) {
        qc.setQueryData(qk.post(postId), ctx.postDetail);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: qk.post(postId) });
    },
  });
}
