import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment } from '@/api/comments';
import type { Comment, CommentsPage } from '@/api/comments';
import { useAuth } from '@/store/AuthContext';
import { qk } from '@/utils/queryKeys';

type InfiniteCommentsData = {
  pages: CommentsPage[];
  pageParams: (string | undefined)[];
};

const ME_AUTHOR = {
  id: 'me',
  username: 'me',
  displayName: 'Вы',
  avatarUrl: '',
};

export function useAddComment(postId: string) {
  const { uuid, regenerate } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => addComment(uuid!, postId, text, regenerate),

    onMutate: async (text: string) => {
      await qc.cancelQueries({ queryKey: qk.comments(postId) });

      const prev = qc.getQueryData<InfiniteCommentsData>(qk.comments(postId));

      const tempId = `tmp-${Date.now()}`;
      const optimistic: Comment = {
        id: tempId,
        postId,
        author: ME_AUTHOR,
        text,
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<InfiniteCommentsData>(qk.comments(postId), (old) => {
        if (!old) {
          return {
            pages: [{ comments: [optimistic], nextCursor: null, hasMore: false }],
            pageParams: [undefined],
          };
        }
        const [first, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            { ...first, comments: [optimistic, ...first.comments] },
            ...rest,
          ],
        };
      });

      return { prev };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData<InfiniteCommentsData>(qk.comments(postId), ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.comments(postId) });
    },
  });
}
