# Mecenate Mobile

React Native + Expo приложение для платформы Mecenate — лента постов с поддержкой платного контента.

## Стек
- React Native 0.81 + Expo SDK 54
- TypeScript strict
- expo-router (typed routes)
- @tanstack/react-query (cursor pagination, optimistic mutations)
- expo-image, expo-secure-store, react-native-svg

## Требования
- Node 20+
- npm 10+
- iOS Simulator или Android emulator (Expo Go хватит)

## Запуск

```bash
npm install
npx expo start
```

В Expo Dev Tools нажмите `i` (iOS) или `a` (Android).

## Скрипты
- `npm test` — Jest (T1 client, T2 useFeed, T3 Likes)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint (max-warnings=0)

## Архитектура

См. [PRD](tasks/prd-mecenate-mobile.md) и [implementation plan](.omc/plans/implementation-plan.md).

```
app/                  # expo-router screens
  _layout.tsx         # QueryClient + AuthProvider + WsBridge
  index.tsx           # Feed
  post/[id].tsx       # PostDetail
src/
  api/                # client, posts, comments, ws
  features/
    feed/             # useFeed, FeedTabs, PostCard
    post/             # usePost, useToggleLike, PostHeader/Body, PaidGate
    comments/         # useComments, useAddComment, CommentsList, Input
    _app/             # WsBridge, useWsLifecycle, useWsCacheSync
  ui/                 # Button, Tabs, Likes, Input, Loader, Comment, Empty/Error/Skeleton
  store/              # AuthContext (UUID + SecureStore)
  theme/              # tokens, typography
  utils/              # uuid, formatDate, queryKeys
```

## Manual QA-чек-лист

1. ☐ Cold start → Feed первая страница загружается <1.5s.
2. ☐ Скролл вниз → подгружается следующая страница.
3. ☐ Pull-to-refresh обновляет ленту.
4. ☐ Tabs Все/Free/Paid фильтруют корректно.
5. ☐ Тап по free-посту → открывается с body.
6. ☐ Тап по paid-посту → виден PaidGate.
7. ☐ Лайк меняется мгновенно (счётчик +1/-1, сердце toggle).
8. ☐ Лайк в airplane mode → откат + visual ошибка.
9. ☐ Comment > 500 символов — Send disabled, счётчик красный.
10. ☐ Dev simulate_error → ErrorState + Retry работает.

## Open questions

- WS endpoint URL и протокол (Q2 в PRD §9) — сейчас заглушка `wss://k8s.mectest.ru/test-app/ws`.
- Шрифты Figma (Q6) — сейчас Inter из @expo-google-fonts/inter.

## Известные ограничения (вне scope)

- Оплата подписки (только PaidGate UI).
- Push-уведомления.
- Тёмная тема.
- Storybook (заменён dev-screen).
