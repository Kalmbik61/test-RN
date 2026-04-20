import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts, PostsPage, PostTier } from '@/api/posts';
import { useAuth } from '@/store/AuthContext';
import { qk } from '@/utils/queryKeys';

export function useFeed(tier?: PostTier, simulateError?: boolean) {
  const { uuid } = useAuth();

  return useInfiniteQuery<PostsPage, Error>({
    queryKey: qk.feed(tier),
    queryFn: ({ pageParam }) =>
      getPosts(uuid!, { cursor: pageParam as string | undefined, tier, simulateError }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    maxPages: 20,
    enabled: !!uuid,
  });
}
