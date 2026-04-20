import { useInfiniteQuery } from '@tanstack/react-query';
import { getComments } from '@/api/comments';
import { useAuth } from '@/store/AuthContext';
import { qk } from '@/utils/queryKeys';

export function useComments(postId: string) {
  const { uuid, regenerate } = useAuth();

  return useInfiniteQuery({
    queryKey: qk.comments(postId),
    enabled: !!uuid && !!postId,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getComments(uuid!, postId, { cursor: pageParam, limit: 20 }, regenerate),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
