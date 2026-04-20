import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/AuthContext';
import { getPost } from '@/api/posts';
import { qk } from '@/utils/queryKeys';

export function usePost(id: string) {
  const { uuid, regenerate } = useAuth();
  return useQuery({
    queryKey: qk.post(id),
    enabled: !!uuid && !!id,
    queryFn: () => getPost(uuid!, id, regenerate),
    select: (d) => d.post,
  });
}
