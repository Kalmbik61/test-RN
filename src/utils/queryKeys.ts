export const qk = {
  feed: (tier?: 'free' | 'paid') => ['feed', tier] as const,
  post: (id: string) => ['post', id] as const,
  comments: (postId: string) => ['comments', postId] as const,
};
