# План реализации: Mecenate Mobile (RN + Expo)

**Источники:** PRD v2 (`tasks/prd-mecenate-mobile.md`), OpenAPI (`json.json`), context7 docs для `/expo/expo` (SDK 54), `/tanstack/query`, expo-router, expo-image, expo-secure-store.

**Цель:** имплементировать 14 шагов PRD так, чтобы каждый шаг имел измеримые acceptance criteria, конкретные файлы, проверенные паттерны кода и команды верификации.

**Базовое допущение по open questions** (зафиксировано в PRD §9, для движения вперёд):
- Q3 Платформы: iOS + Android (Expo Go хватит для демо).
- Q4 Expo SDK 54 (latest stable, RN 0.81+).
- Q5 EAS Build не требуется, достаточно репо + `npx expo start`.
- Q6 Шрифты: пока inter из `@expo-google-fonts/inter` как fallback, заменим на figma-шрифт после получения экспорта.
- Q2 WS: пока заглушка `wss://k8s.mectest.ru/test-app/ws` с native WebSocket; уточнить у заказчика.

---

## Шаг 0 — Доступ к Figma, экспорт токенов

**Acceptance Criteria**
- AC0.1 Figma file `rNecnqvXoivLBmB206zsPc` доступен через MCP `get_variable_defs`.
- AC0.2 Экспортированы токены: цвета, типографика, радиусы, отступы — записаны в `src/theme/tokens.ts`.
- AC0.3 Получены screenshot/экспорты для оставшихся узлов (likes, inputs, button_link, chat-message, loader, comment, error, empty).

**Файлы**
- `src/theme/tokens.ts` (черновик, заполняется на шаге 3)
- `assets/figma-screens/*.png` (скриншоты от пользователя)

**Действия**
1. Используя `mcp__61154abc...__get_variable_defs` для каждого frame'а собрать токены.
2. Скриншоты сложить в `assets/figma-screens/` для референса.

**Verify**
- `mcp__61154abc...__get_variable_defs` возвращает JSON без 403.

**Risks**
- Лимит Figma MCP Starter Plan → fallback: пользователь шлёт скриншоты вручную (уже договорились).

---

## Шаг 1 — Bootstrap Expo + TypeScript + expo-router

**Acceptance Criteria**
- AC1.1 `npx expo start` → blank screen на iOS Simulator + Android emulator.
- AC1.2 expo-router работает: `app/_layout.tsx` с `<Stack />`, `app/index.tsx` пустой.
- AC1.3 TypeScript strict (`tsc --noEmit` без ошибок).
- AC1.4 Typed routes включены (`experiments.typedRoutes: true` в `app.json`).

**Файлы**
```
package.json
app.json
tsconfig.json
app/_layout.tsx
app/index.tsx
```

**Команды**
```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router react-native-screens react-native-safe-area-context
npx expo install expo-linking expo-constants expo-status-bar
```

**Код-паттерны (context7 — expo-router)**

`app.json` — typed routes:
```json
{
  "expo": {
    "scheme": "mecenate",
    "experiments": { "typedRoutes": true },
    "plugins": ["expo-router"]
  }
}
```

`app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Verify**
- `npx tsc --noEmit` → 0 errors.
- `npx expo start` → app loads.

---

## Шаг 2 — ESLint + Prettier + абсолютные пути

**Acceptance Criteria**
- AC2.1 `eslint .` проходит (preset: `eslint-config-expo` + `plugin:@typescript-eslint`).
- AC2.2 Импорт `@/api/client` работает (alias `@/* → src/*`).
- AC2.3 Prettier формат: 2 spaces, single quotes, trailing commas `all`, semi.

**Файлы**
```
.eslintrc.cjs
.prettierrc
tsconfig.json (paths)
babel.config.js (module-resolver)
```

**`tsconfig.json`**
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**`babel.config.js`**
```js
module.exports = (api) => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [['module-resolver', { root: ['./'], alias: { '@': './src' } }]],
  };
};
```

**Verify**
- `npx eslint .` → 0 errors.
- `import { foo } from '@/api/client'` резолвится (test через `tsc`).

---

## Шаг 3 — Theme tokens + шрифты

**Acceptance Criteria**
- AC3.1 `src/theme/tokens.ts` экспортирует `colors`, `spacing`, `radii`, `typography`.
- AC3.2 Шрифты загружаются через `useFonts` из `@expo-google-fonts/inter` (заглушка до figma-шрифтов).
- AC3.3 Splash не уходит до загрузки шрифтов (`SplashScreen.preventAutoHideAsync()`).

**Файлы**
```
src/theme/tokens.ts
src/theme/typography.ts
app/_layout.tsx (font loading)
```

**Код**

`src/theme/tokens.ts`:
```ts
export const colors = {
  bg: '#FFFFFF',
  text: '#0A0A0A',
  muted: '#8E8E93',
  primary: '#FF4D6D', // подставить из Figma
  border: '#E5E5EA',
  danger: '#FF3B30',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radii = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
```

`app/_layout.tsx` обновить:
```tsx
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

**Verify**
- На запуске виден кастомный шрифт.
- `import { colors } from '@/theme/tokens'` работает.

---

## Шаг 4 — API client + AuthContext

**Acceptance Criteria**
- AC4.1 `src/api/client.ts` нормализует все ответы в `ApiError | T`.
- AC4.2 Timeout 15s через `AbortController`.
- AC4.3 401 → `regenerateUuid()` + retry once; повторный 401 → throw `ApiError.UNAUTHORIZED, retryable=false`.
- AC4.4 UUID хранится в `expo-secure-store` под ключом `mecenate.uuid`.
- AC4.5 `AuthContext` отдаёт `uuid` (Promise<string>) + `regenerate()`.
- AC4.6 Тест T1 (`client.test.ts`) зелёный: 200, 4xx, 5xx, timeout, network → корректные `ApiError`.

**Файлы**
```
src/api/client.ts
src/api/types.ts
src/api/posts.ts
src/api/comments.ts
src/store/AuthContext.tsx
src/utils/uuid.ts
src/api/client.test.ts
```

**Деп-ы**
```bash
npx expo install expo-secure-store
npm i react-native-get-random-values uuid
npm i -D msw whatwg-fetch
```

**Код**

`src/utils/uuid.ts`:
```ts
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
export const newUuid = () => uuidv4();
```

`src/api/types.ts`:
```ts
export type ApiErrorCode =
  | 'TIMEOUT' | 'NETWORK' | 'SERVER' | 'NOT_FOUND'
  | 'UNAUTHORIZED' | 'VALIDATION' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status?: number,
    public retryable: boolean = false,
  ) { super(message); }
}
```

`src/api/client.ts` (ключевые куски):
```ts
import { ApiError } from './types';

const BASE_URL = 'https://k8s.mectest.ru/test-app';
const TIMEOUT_MS = 15_000;

type Opts = RequestInit & { token: string; retryOn401?: () => Promise<string> };

export async function request<T>(path: string, opts: Opts): Promise<T> {
  const { token, retryOn401, ...init } = opts;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (e: any) {
    clearTimeout(t);
    if (e?.name === 'AbortError') throw new ApiError('TIMEOUT', 'Request timed out', undefined, true);
    throw new ApiError('NETWORK', e?.message ?? 'Network error', undefined, true);
  }
  clearTimeout(t);

  if (res.status === 401 && retryOn401) {
    const fresh = await retryOn401();
    return request<T>(path, { ...opts, token: fresh, retryOn401: undefined });
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const code = mapStatus(res.status);
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    throw new ApiError(code, msg, res.status, code === 'SERVER' || code === 'TIMEOUT');
  }
  return json.data as T;
}

function mapStatus(s: number): ApiErrorCode {
  if (s === 401) return 'UNAUTHORIZED';
  if (s === 404) return 'NOT_FOUND';
  if (s === 400) return 'VALIDATION';
  if (s >= 500) return 'SERVER';
  return 'UNKNOWN';
}
```

`src/store/AuthContext.tsx`:
```tsx
import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { newUuid } from '@/utils/uuid';

const KEY = 'mecenate.uuid';

type Ctx = { uuid: string | null; regenerate: () => Promise<string> };
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(KEY);
      if (stored) setUuid(stored);
      else {
        const fresh = newUuid();
        await SecureStore.setItemAsync(KEY, fresh);
        setUuid(fresh);
      }
    })();
  }, []);

  const regenerate = async () => {
    const fresh = newUuid();
    await SecureStore.setItemAsync(KEY, fresh);
    setUuid(fresh);
    return fresh;
  };

  return <AuthCtx.Provider value={{ uuid, regenerate }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
};
```

`src/api/posts.ts`:
```ts
import { request } from './client';

export type Post = { id: string; author: Author; title: string; body: string; preview: string;
  coverUrl: string; likesCount: number; commentsCount: number; isLiked: boolean;
  tier: 'free'|'paid'; createdAt: string };
export type Author = { id: string; username: string; displayName: string; avatarUrl: string;
  bio?: string; subscribersCount?: number; isVerified?: boolean };

export const getPosts = (token: string, params: { cursor?: string; tier?: 'free'|'paid'; limit?: number }, retryOn401?: () => Promise<string>) => {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  if (params.tier) q.set('tier', params.tier);
  q.set('limit', String(params.limit ?? 10));
  return request<{ posts: Post[]; nextCursor: string | null; hasMore: boolean }>(`/posts?${q}`, { method: 'GET', token, retryOn401 });
};

export const getPost = (token: string, id: string, retryOn401?: () => Promise<string>) =>
  request<{ post: Post }>(`/posts/${id}`, { method: 'GET', token, retryOn401 });

export const togglePostLike = (token: string, id: string, retryOn401?: () => Promise<string>) =>
  request<{ isLiked: boolean; likesCount: number }>(`/posts/${id}/like`, { method: 'POST', token, retryOn401 });
```

**Verify**
- `npx jest src/api/client.test.ts` → 5/5 проходит (mock fetch + msw).

**Risks**
- WS не поддерживает Bearer header → отдельный auth via query string, см. шаг 11.

---

## Шаг 5 — UI Kit

**Acceptance Criteria**
- AC5.1 8 компонентов в `src/ui/`: `Button`, `Tabs`, `Likes`, `Input`, `Loader`, `Comment`, `EmptyState`, `ErrorState`.
- AC5.2 Каждый принимает `style?: ViewStyle` для override и не хардкодит цвета — берёт из `theme/tokens`.
- AC5.3 Dev-screen `app/(dev)/uikit.tsx` рендерит все варианты (states: default/pressed/disabled).
- AC5.4 Все pressable элементы имеют `accessibilityRole="button"` + `accessibilityLabel`.

**Файлы**
```
src/ui/Button/Button.tsx
src/ui/Tabs/Tabs.tsx
src/ui/Likes/Likes.tsx
src/ui/Input/Input.tsx
src/ui/Loader/Loader.tsx
src/ui/Comment/Comment.tsx
src/ui/EmptyState/EmptyState.tsx
src/ui/ErrorState/ErrorState.tsx
src/ui/index.ts (re-exports)
app/(dev)/uikit.tsx
```

**Ключевой паттерн (Likes — будет переиспользован для optimistic toggle):**
```tsx
type Props = { count: number; isLiked: boolean; disabled?: boolean; onToggle: () => void };
export function Likes({ count, isLiked, disabled, onToggle }: Props) {
  return (
    <Pressable onPress={onToggle} disabled={disabled}
      accessibilityRole="button" accessibilityLabel={isLiked ? 'Unlike' : 'Like'}
      hitSlop={12} style={styles.row}>
      <HeartIcon filled={isLiked} />
      <Text style={styles.count}>{formatCount(count)}</Text>
    </Pressable>
  );
}
```

**Verify**
- Открыть `/uikit` в dev-сборке, визуально пройтись по компонентам.

---

## Шаг 6 — Feed экран + useInfiniteQuery + табы + pull-to-refresh

**Acceptance Criteria**
- AC6.1 `GET /posts?limit=10` грузится при mount, рендерится в FlatList.
- AC6.2 Скролл к концу → подгружает next page через `nextCursor`.
- AC6.3 Tabs `Free | Paid` фильтруют через `?tier=`.
- AC6.4 Pull-to-refresh инвалидирует query.
- AC6.5 Performance: `windowSize=10`, `removeClippedSubviews`, `keyExtractor`.

**Деп-ы**
```bash
npm i @tanstack/react-query
npx expo install expo-image
```

**Файлы**
```
app/_layout.tsx (QueryClientProvider + AuthProvider)
app/index.tsx (FeedScreen)
src/features/feed/FeedList.tsx
src/features/feed/FeedTabs.tsx
src/features/feed/useFeed.ts
src/utils/queryKeys.ts
```

**Код-паттерны (context7 — @tanstack/query)**

`src/utils/queryKeys.ts`:
```ts
export const qk = {
  feed: (tier?: 'free'|'paid') => ['feed', tier] as const,
  post: (id: string) => ['post', id] as const,
  comments: (postId: string) => ['comments', postId] as const,
};
```

`src/features/feed/useFeed.ts`:
```ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/AuthContext';
import { getPosts } from '@/api/posts';
import { qk } from '@/utils/queryKeys';

export function useFeed(tier?: 'free'|'paid') {
  const { uuid, regenerate } = useAuth();
  return useInfiniteQuery({
    queryKey: qk.feed(tier),
    enabled: !!uuid,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getPosts(uuid!, { cursor: pageParam, tier, limit: 10 }, regenerate),
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor ?? undefined : undefined),
    maxPages: 20, // защита от бесконечного роста кэша
  });
}
```

`app/index.tsx` (skeleton):
```tsx
const flat = useMemo(() => data?.pages.flatMap(p => p.posts) ?? [], [data]);
return (
  <FlatList
    data={flat}
    keyExtractor={(p) => p.id}
    renderItem={({ item }) => <PostCard post={item} onPress={() => router.push(`/post/${item.id}`)} />}
    onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
    onEndReachedThreshold={0.4}
    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    ListHeaderComponent={<FeedTabs tier={tier} onChange={setTier} />}
    ListEmptyComponent={isLoading ? <Loader /> : <EmptyState />}
    windowSize={10}
    removeClippedSubviews
  />
);
```

`app/_layout.tsx` оборачиваем:
```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, gcTime: 5*60_000, retry: 1 } },
});
// ...
<QueryClientProvider client={queryClient}>
  <AuthProvider><Stack /></AuthProvider>
</QueryClientProvider>
```

**Verify**
- Скролл подгружает страницы (видно в network).
- Переключение табов делает новый запрос с `tier=`.
- Pull-to-refresh обновляет список.

---

## Шаг 7 — EmptyState + ErrorState в Feed

**Acceptance Criteria**
- AC7.1 Пустая лента → `EmptyState` (текст + иконка).
- AC7.2 `?simulate_error=true` (через dev-toggle) → `ErrorState` с кнопкой Retry.
- AC7.3 Retry перезапускает `refetch()`.
- AC7.4 На 404 (PostDetail) — ErrorState без Retry, кнопка «Назад».

**Файлы (изменения)**
- `app/index.tsx` — обработка `error` из `useFeed`.
- `src/features/feed/useFeed.ts` — поддержка `simulateError` flag (dev only).

**Verify**
- Toggle через `__DEV__`-кнопку → ErrorState виден; tap Retry → загрузка.

---

## Шаг 8 — PostDetail (header, body, paid-gate)

**Acceptance Criteria**
- AC8.1 Тап по PostCard → `router.push(\`/post/\${id}\`)`.
- AC8.2 Header: avatar (expo-image, BlurHash placeholder, `transition=300`), displayName, isVerified badge, `formatDate(createdAt)`.
- AC8.3 Body: для `tier=free` показывает `body`. Для `tier=paid` + пустого `body` → `<PaidGate />` (skeleton + alert «Доступно по подписке»).
- AC8.4 Cover image — `cachePolicy='memory-disk'`, `contentFit='cover'`.

**Файлы**
```
app/post/[id].tsx
src/features/post/PostHeader.tsx
src/features/post/PostBody.tsx
src/features/post/PaidGate.tsx
src/features/post/usePost.ts
src/utils/formatDate.ts
```

**Код**

`src/features/post/usePost.ts`:
```ts
export function usePost(id: string) {
  const { uuid, regenerate } = useAuth();
  return useQuery({
    queryKey: qk.post(id),
    enabled: !!uuid && !!id,
    queryFn: () => getPost(uuid!, id, regenerate),
    select: (d) => d.post,
  });
}
```

`PaidGate.tsx`:
```tsx
export function PaidGate() {
  return (
    <View style={styles.gate}>
      <View style={styles.skeleton} />
      <Text style={styles.title}>Доступно по подписке</Text>
      <Text style={styles.sub}>Поддержите автора, чтобы прочитать полный пост.</Text>
    </View>
  );
}
```

**Verify**
- Тап по free-посту → видно body.
- Тап по paid-посту (`tier=paid`, body=='') → PaidGate.

---

## Шаг 9 — Лайки (оптимистичный toggle)

**Acceptance Criteria**
- AC9.1 Тап по сердцу — мгновенно меняет UI (count ±1, isLiked toggle) до response.
- AC9.2 На ошибке — rollback + toast «Не удалось».
- AC9.3 Двойной тап не дёргает API дважды (`disabled` пока pending).
- AC9.4 Изменения видны и в Feed, и в PostDetail (single source — react-query cache).

**Файлы**
```
src/features/post/useToggleLike.ts
src/features/feed/PostCard.tsx (использует Likes)
src/features/post/PostHeader.tsx (использует Likes)
src/ui/Toast/Toast.tsx (минимальный)
```

**Код-паттерн (context7 — useMutation optimistic)**

`src/features/post/useToggleLike.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostLike } from '@/api/posts';
import { useAuth } from '@/store/AuthContext';
import { qk } from '@/utils/queryKeys';

type Snapshot = { feedPages?: any; postDetail?: any };

export function useToggleLike(postId: string) {
  const { uuid, regenerate } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => togglePostLike(uuid!, postId, regenerate),

    onMutate: async (): Promise<Snapshot> => {
      await qc.cancelQueries({ queryKey: ['feed'] });
      await qc.cancelQueries({ queryKey: qk.post(postId) });

      const feedPages = qc.getQueriesData({ queryKey: ['feed'] });
      const postDetail = qc.getQueryData(qk.post(postId));

      // Optimistic patch — feed pages
      qc.setQueriesData({ queryKey: ['feed'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((p: any) =>
              p.id === postId
                ? { ...p, isLiked: !p.isLiked, likesCount: p.likesCount + (p.isLiked ? -1 : 1) }
                : p,
            ),
          })),
        };
      });

      // Optimistic patch — post detail
      qc.setQueryData(qk.post(postId), (old: any) => {
        if (!old) return old;
        const post = old.post;
        return { post: { ...post, isLiked: !post.isLiked, likesCount: post.likesCount + (post.isLiked ? -1 : 1) } };
      });

      return { feedPages, postDetail };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.feedPages?.forEach(([k, v]: any) => qc.setQueryData(k, v));
      if (ctx?.postDetail) qc.setQueryData(qk.post(postId), ctx.postDetail);
      // toast
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: qk.post(postId) });
    },
  });
}
```

**Verify**
- T3 (`Likes.test.tsx`) — toggle + disabled.
- Manual: убить wifi → лайкнуть → видно rollback.

---

## Шаг 10 — Comments (список + ввод + добавление)

**Acceptance Criteria**
- AC10.1 На PostDetail внизу — секция Comments с infinite scroll.
- AC10.2 Input `<= 500 chars` (счётчик), кнопка Send disabled на пустой/превышении.
- AC10.3 На submit — оптимистично добавляем comment в топ списка (temp id), rollback на ошибке.
- AC10.4 KeyboardAvoidingView для iOS.

**Файлы**
```
src/features/comments/CommentsList.tsx
src/features/comments/CommentInput.tsx
src/features/comments/useComments.ts
src/features/comments/useAddComment.ts
src/api/comments.ts
```

**Код**

`src/api/comments.ts`:
```ts
export type Comment = { id: string; postId: string; author: Author; text: string; createdAt: string };

export const getComments = (token, postId, params: { cursor?: string; limit?: number }, retry?) => {
  const q = new URLSearchParams();
  if (params.cursor) q.set('cursor', params.cursor);
  q.set('limit', String(params.limit ?? 20));
  return request<{ comments: Comment[]; nextCursor: string | null; hasMore: boolean }>(
    `/posts/${postId}/comments?${q}`, { method: 'GET', token, retryOn401: retry });
};

export const addComment = (token, postId, text: string, retry?) =>
  request<{ comment: Comment }>(`/posts/${postId}/comments`,
    { method: 'POST', token, retryOn401: retry, body: JSON.stringify({ text }) });
```

`useAddComment.ts` — оптимистично:
```ts
return useMutation({
  mutationFn: (text: string) => addComment(uuid!, postId, text, regenerate),
  onMutate: async (text) => {
    await qc.cancelQueries({ queryKey: qk.comments(postId) });
    const prev = qc.getQueryData<any>(qk.comments(postId));
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Comment = { id: tempId, postId, author: meAsAuthor(), text, createdAt: new Date().toISOString() };
    qc.setQueryData(qk.comments(postId), (old: any) => {
      if (!old) return { pages: [{ comments: [optimistic], nextCursor: null, hasMore: false }] };
      const [first, ...rest] = old.pages;
      return { ...old, pages: [{ ...first, comments: [optimistic, ...first.comments] }, ...rest] };
    });
    return { prev };
  },
  onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(qk.comments(postId), ctx.prev),
  onSettled: () => qc.invalidateQueries({ queryKey: qk.comments(postId) }),
});
```

**Verify**
- Отправить comment → виден сразу в топе.
- 400 на 501 char → inline error.

---

## Шаг 11 — WebSocket (client + AppState + heartbeat + cache sync)

**Acceptance Criteria**
- AC11.1 `src/api/ws.ts` — singleton с методами `connect()`, `disconnect()`, `on(event, handler)`.
- AC11.2 Heartbeat: ping каждые 30s, ожидаем pong; при отсутствии pong 60s — reconnect.
- AC11.3 Exponential backoff: 1→2→4→8→16s, cap 30s, max 10 attempts; на 11-й — пауза до AppState `active`.
- AC11.4 AppState `background` → `disconnect()`; `active` → `connect()`.
- AC11.5 Event `like_updated` → `qc.setQueryData` patches feed + post detail.
- AC11.6 Event `comment_added` → `qc.invalidateQueries(qk.comments(postId))`.

**Файлы**
```
src/api/ws.ts
src/features/_app/useWsLifecycle.ts (AppState + connect)
src/features/_app/useWsCacheSync.ts (event → cache)
```

**Код-скелет**

`src/api/ws.ts`:
```ts
type Listener = (msg: any) => void;
const WS_URL = 'wss://k8s.mectest.ru/test-app/ws'; // TODO: уточнить у заказчика

class WsClient {
  private ws?: WebSocket;
  private listeners = new Set<Listener>();
  private retries = 0;
  private heartbeatTimer?: any;
  private pongTimer?: any;
  private token?: string;

  connect(token: string) {
    this.token = token;
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(`${WS_URL}?token=${token}`);
    this.ws.onopen = () => { this.retries = 0; this.startHeartbeat(); };
    this.ws.onmessage = (e) => {
      const msg = safeParse(e.data);
      if (msg?.type === 'pong') { this.armPongTimeout(); return; }
      this.listeners.forEach(l => l(msg));
    };
    this.ws.onclose = () => this.scheduleReconnect();
    this.ws.onerror = () => this.ws?.close();
  }

  private startHeartbeat() {
    this.armPongTimeout();
    this.heartbeatTimer = setInterval(() => {
      this.ws?.send(JSON.stringify({ type: 'ping' }));
    }, 30_000);
  }

  private armPongTimeout() {
    clearTimeout(this.pongTimer);
    this.pongTimer = setTimeout(() => this.ws?.close(), 60_000);
  }

  private scheduleReconnect() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.pongTimer);
    if (this.retries >= 10) return; // ждём AppState
    const delay = Math.min(30_000, 1000 * Math.pow(2, this.retries++));
    setTimeout(() => this.token && this.connect(this.token), delay);
  }

  disconnect() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.pongTimer);
    this.ws?.close();
    this.ws = undefined;
    this.retries = 0;
  }

  on(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l); }
}

export const ws = new WsClient();
```

`useWsLifecycle.ts`:
```ts
export function useWsLifecycle() {
  const { uuid } = useAuth();
  useEffect(() => {
    if (!uuid) return;
    ws.connect(uuid);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') ws.connect(uuid);
      else if (s === 'background') ws.disconnect();
    });
    return () => { sub.remove(); ws.disconnect(); };
  }, [uuid]);
}
```

`useWsCacheSync.ts`:
```ts
export function useWsCacheSync() {
  const qc = useQueryClient();
  useEffect(() => ws.on((msg) => {
    if (msg?.type === 'like_updated') {
      const { postId, isLiked, likesCount } = msg.payload;
      qc.setQueriesData({ queryKey: ['feed'] }, (old: any) =>
        patchPostInPages(old, postId, p => ({ ...p, isLiked, likesCount })));
      qc.setQueryData(qk.post(postId), (old: any) =>
        old && { post: { ...old.post, isLiked, likesCount } });
    }
    if (msg?.type === 'comment_added') {
      qc.invalidateQueries({ queryKey: qk.comments(msg.payload.postId) });
    }
  }), [qc]);
}
```

Подключаем оба хука в `app/_layout.tsx` внутри providers.

**Verify**
- Лайкнуть пост (генерирует `like_updated` через 1-3s) → в Feed/Detail counter обновился.
- Включить airplane mode → нет краша; выключить → восстанавливается.

**Risks**
- WS endpoint неподтверждён → если 1006/refused → клиент молча уходит в reconnect-loop, REST продолжает работать; залогировать в `__DEV__`.

---

## Шаг 12 — Тесты T1–T3

**Acceptance Criteria**
- AC12.1 `npx jest` → green.
- AC12.2 Coverage focal: client.ts (>=80%), useFeed.ts (happy + empty + error), Likes (toggle + disabled).

**Деп-ы**
```bash
npm i -D jest jest-expo @testing-library/react-native @testing-library/jest-native msw
```

**Файлы**
```
jest.config.js
src/api/client.test.ts                   # T1
src/features/feed/useFeed.test.ts        # T2
src/ui/Likes/Likes.test.tsx              # T3
src/test/msw-server.ts                   # MSW setup
```

**`jest.config.js`**
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEach: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@unimodules/.*|expo-modules-core|@tanstack/.*)',
  ],
};
```

**T1 (`client.test.ts`) — выборка случаев:**
```ts
import { request } from './client';
import { ApiError } from './types';

describe('request', () => {
  it('200 ok → возвращает data', async () => { /* fetch mock { ok:true, data:{x:1} } */ });
  it('401 → retryOn401 вызывается, повторный 401 → ApiError UNAUTHORIZED', async () => {});
  it('404 → ApiError NOT_FOUND, retryable=false', async () => {});
  it('500 → ApiError SERVER, retryable=true', async () => {});
  it('timeout → ApiError TIMEOUT, retryable=true', async () => {
    jest.useFakeTimers();
    const p = request('/x', { method:'GET', token:'t' });
    jest.advanceTimersByTime(15_001);
    await expect(p).rejects.toBeInstanceOf(ApiError);
  });
});
```

**Verify**
- `npx jest` → 0 fails.

---

## Шаг 13 — Polish: skeletons, edge-cases, a11y

**Acceptance Criteria**
- AC13.1 Skeleton-плейсхолдеры для Feed (3-5 cards) и PostDetail (header + body lines).
- AC13.2 Все Pressable с `accessibilityLabel` (RU тексты).
- AC13.3 Картинки — `alt` через `accessibilityLabel`.
- AC13.4 Empty/error/loading состояния покрыты для всех 3 экранов (Feed, PostDetail, Comments).
- AC13.5 Manual QA-чек-лист (10 пунктов) пройден.

**Файлы (новое + правки)**
```
src/ui/Skeleton/Skeleton.tsx
src/features/feed/FeedSkeleton.tsx
src/features/post/PostSkeleton.tsx
README.md (черновик чек-листа)
```

**QA-чек-лист (войдёт в README):**
1. Cold start → видна Feed первая страница за <1.5s.
2. Скролл → подгружает страницу 2.
3. Pull-to-refresh обновляет.
4. Tabs free/paid фильтруют.
5. Тап по free-посту → видно body.
6. Тап по paid-посту → PaidGate.
7. Лайк меняется мгновенно (включая counter).
8. Лайк с airplane mode → откатывается + toast.
9. Comment > 500 → inline error.
10. simulate_error → ErrorState + Retry работает.

---

## Шаг 14 — README + .env.example

**Acceptance Criteria**
- AC14.1 `README.md`: краткое описание, требования (node, expo CLI), `npm install && npx expo start`, `npm test`, `npm run lint`.
- AC14.2 Раздел «Архитектура» — ссылка на PRD + диаграмма из §7.1.1.
- AC14.3 Раздел «Manual QA» — чек-лист из шага 13.
- AC14.4 `.env.example` (если решим вынести BASE_URL/WS_URL) — placeholder значения, без секретов.
- AC14.5 Финальный коммит «feat: mecenate mobile MVP».

**Файлы**
```
README.md
.env.example
```

**Verify**
- `npm install && npx expo start` на чистом клоне поднимает приложение.

---

## Сводная карта файлов (что появится в репо к финалу)

```
app/
  _layout.tsx
  index.tsx
  post/[id].tsx
  (dev)/uikit.tsx
src/
  api/{client.ts, types.ts, posts.ts, comments.ts, ws.ts, client.test.ts}
  features/
    feed/{FeedList, FeedTabs, PostCard, FeedSkeleton, useFeed, useFeed.test}
    post/{PostHeader, PostBody, PaidGate, PostSkeleton, usePost, useToggleLike}
    comments/{CommentsList, CommentInput, useComments, useAddComment}
    _app/{useWsLifecycle, useWsCacheSync}
  ui/{Button, Tabs, Likes(+test), Input, Loader, Comment, EmptyState, ErrorState, Skeleton, Toast}
  store/AuthContext.tsx
  theme/{tokens, typography}
  utils/{uuid, formatDate, queryKeys}
  test/msw-server.ts
README.md
.env.example
jest.config.js
```

---

## Risks & Mitigations (объединено с §7.6 PRD)

| Risk | Mitigation |
|------|------------|
| WS endpoint неизвестен | Заглушка `wss://.../ws`, при ошибке — silent reconnect + REST продолжает работу. Уточнить у заказчика (Q2). |
| Figma rate-limit | Скриншоты от пользователя (договорено). |
| Шрифты не получены | Inter из `@expo-google-fonts/inter` как fallback (Q6). |
| 401-loop при сломанном токене | Retry один раз; на 2-й 401 — `ApiError UNAUTHORIZED, retryable=false`, UI ErrorState. |
| Кэш растёт бесконечно при долгом скролле | `maxPages: 20` в `useInfiniteQuery`. |
| Optimistic rollback не отрабатывает на background | `onSettled` всегда invalidates — финальная правда придёт от сервера. |
| WS reconnect-storm | Exponential backoff cap 30s, max 10, потом ждём AppState. |
| EAS не нужен, но вдруг попросят | Add `eas.json` в шаге 14 (1 строка). |

---

## Verification Pipeline (до коммита)

```bash
npx tsc --noEmit            # типы
npx eslint .                # линт
npx jest                    # T1-T3
npx expo start              # ручная QA по чек-листу
```

---

## Что вне scope (фиксируем)

- Оплата подписки (только PaidGate UI).
- Push-уведомления.
- Аналитика / телеметрия.
- Деплой EAS Build (по умолчанию).
- Storybook (заменён dev-screen `/uikit`).
- Тёмная тема (если её нет в Figma).

---

## Открытые вопросы (заблокированы, но не критичны для старта)

- Q2 WS endpoint — двигаемся с заглушкой, корректируем при ответе заказчика.
- Q6 Шрифты — Inter fallback.
- Остальные (Q1, Q3, Q4, Q5) — закрыты допущениями выше.
