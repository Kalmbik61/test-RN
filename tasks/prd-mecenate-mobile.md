# PRD: Mecenate Mobile — React Native + Expo тестовое задание

> **v2** (2026-04-20) — обновлено после Eng Review. Изменения: error normalization (FR1.5–1.7), 401-retry (FR3), PaidGate спецификация (FR11), WS lifecycle с AppState и heartbeat (FR21), удалён zustand, добавлены data-flow диаграмма (§7.1.1), минимальный test plan (§7.5), failure modes (§7.6), expo-image для обложек.

## 1. Введение / Обзор

Мобильное приложение на **React Native + Expo (TypeScript)** для просмотра ленты постов авторов («менасинов»), просмотра деталей поста, лайков и комментариев. Backend — `https://k8s.mectest.ru/test-app` (см. `json.json`, OpenAPI 3.0.3). Авторизация — Bearer UUID. Часть постов платная (`tier: paid`), у них пустой `body` и нужен gate.

Цель PRD: дать пошаговый план реализации, по которому Junior-разработчик может собрать приложение «под ключ».

## 2. Цели

- G1. Воспроизвести UI из Figma 1-в-1 для всех заявленных компонентов и экранов.
- G2. Реализовать загрузку ленты, детали поста, лайк (toggle), список и добавление комментариев.
- G3. Поддержать состояния: loading, error («Ошибка загрузки»), empty («Ничего не найдено»), success.
- G4. Поддержать пагинацию (cursor) для ленты и комментариев.
- G5. Поддержать live-обновления через WebSocket: `like_updated`, `comment_added`.
- G6. Сохранять auth UUID локально, генерировать при первом запуске, если отсутствует.

## 3. Пользовательские истории (User Stories)

- US1. Как пользователь, я хочу видеть ленту постов с обложкой, автором, превью, чтобы быстро ориентироваться.
- US2. Как пользователь, я хочу фильтровать ленту по табам (Все / Free / Paid), чтобы выбирать контент.
- US3. Как пользователь, я хочу открыть пост и прочитать полный текст, чтобы изучить материал.
- US4. Как пользователь, я хочу лайкать пост в один тап и видеть мгновенный отклик, чтобы выразить реакцию.
- US5. Как пользователь, я хочу читать комментарии к посту и оставлять свои, чтобы участвовать в обсуждении.
- US6. Как пользователь, я хочу видеть состояние «Ошибка загрузки» с возможностью повторить запрос.
- US7. Как пользователь, я хочу видеть состояние «Ничего не найдено», когда лента пуста.
- US8. Как пользователь, я хочу видеть превью платных постов с замком/CTA, чтобы понять, что контент закрыт.

## 4. Функциональные требования

### 4.1 Авторизация
- FR1. При первом запуске приложение генерирует UUID (`uuid` v4) и сохраняет его в `expo-secure-store` (без `requireAuthentication` — иначе на Android запрашивается биометрия).
- FR2. Все REST/WS-запросы прокидывают заголовок `Authorization: Bearer <uuid>`.
- FR3. На 401 — однократно перегенерировать UUID и повторить запрос. Если повтор тоже 401 — показывать toast «Ошибка авторизации» (защита от 401-loop).

### 4.1.5 Error contract
- FR1.5. Все ошибки REST/WS нормализуются в `ApiError`:
  ```ts
  type ApiError = {
    code: 'NETWORK_ERROR' | 'TIMEOUT' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION' | 'SERVER' | 'UNKNOWN';
    message: string;       // локализованное сообщение для UI
    status?: number;       // HTTP status, если был ответ
    retryable: boolean;    // показывать ли кнопку Retry в ErrorState
  };
  ```
- FR1.6. Все REST-запросы имеют timeout `15s` (через `AbortController`). По истечению — `ApiError { code: 'TIMEOUT', retryable: true }`.
- FR1.7. ErrorState рендерит кнопку «Повторить» только если `retryable === true`.

### 4.2 Лента постов (`GET /posts`)
- FR4. Бесконечная пагинация по `cursor` (`limit=10`, `max=20`).
- FR5. Фильтр-табы `Все / Free / Paid` управляют параметром `tier` (для «Все» параметр опускается).
- FR6. Pull-to-refresh — сбрасывает курсор и перезагружает первую страницу.
- FR7. На пустом ответе — экран **«Ничего не найдено»**.
- FR8. На 500 / network error — экран **«Ошибка загрузки»** с кнопкой «Повторить» (использовать `simulate_error=true` для проверки).

### 4.3 Деталь поста (`GET /posts/{id}`)
- FR9. Открывается из карточки ленты по тапу.
- FR10. Показывает обложку, заголовок, автора, лайки/комментарии, полный body.
- FR11. Если `tier=paid` и `body` пустой — рендерим **PaidGate**:
  - В **Feed-карточке**: alert `paid_message` (иконка donate + текст «Контент скрыт пользователем. Доступ откроется после доната» + CTA-кнопка) **поверх skeleton-плейсхолдеров** для title и текста (структура из Figma `1:4476`).
  - В **PostDetail**: тот же alert по центру экрана + skeleton вместо body.
  - Тап CTA → `Alert.alert('Оплата недоступна в демо')` (тестовое не реализует биллинг).
- FR12. На 404 — экран ошибки «Пост не найден» (без Retry, `retryable: false`).

### 4.4 Лайки (`POST /posts/{id}/like`)
- FR13. Тап по сердцу — оптимистичное обновление (toggle `isLiked`, `likesCount±1`).
- FR14. На ошибке — откат и toast.
- FR15. WS-событие `like_updated` синхронизирует кэш ленты/детали для всех открытых постов.

### 4.5 Комментарии (`GET/POST /posts/{id}/comments`)
- FR16. На детали поста — секция комментариев с пагинацией по `cursor` (`limit=20`).
- FR17. Поле ввода (max 500 символов) + кнопка «Отправить» (disabled при пустом тексте).
- FR18. После успешного `POST` — добавить комментарий в начало списка, увеличить `commentsCount`.
- FR19. На 400 (validation) — inline-ошибка под полем.
- FR20. WS-событие `comment_added` инкрементирует счётчик комментариев в карточках ленты и (если открыт) добавляет комментарий в детали.

### 4.6 WebSocket
- FR21. Lifecycle:
  - Подключение — после получения первого UUID.
  - Reconnect с **exponential backoff** (1s → 2s → 4s → 8s → 16s, cap 30s) и max 10 попыток в серии.
  - **AppState integration**: на `background/inactive` — `socket.close()`. На `active` — пересоздать соединение и инвалидировать react-query кэш (`['posts']`) для подтягивания пропущенных событий.
  - **Heartbeat**: пинг (custom JSON `{ type: 'ping' }`) каждые `30s`. Если pong не пришёл за `60s` — закрыть и реконнектить.
- FR22. Поддерживаемые события (с type-guard валидацией payload):
  - `like_updated { postId: string, isLiked: boolean, likesCount: number }`
  - `comment_added { postId: string, comment: Comment }`
  - Невалидный payload — игнорировать + `console.warn`, не падать.
- FR23. Состояние подключения хранится в singleton-модуле `src/api/ws.ts` (без UI-индикатора). Merger колбэков подписывается на события и вызывает `queryClient.setQueryData`.

### 4.7 UI-кит (по Figma)
Реализовать как переиспользуемые компоненты в `src/ui/`:
- FR24. **Tabs** — горизонтальные переключатели (active/inactive).
- FR25. **ItemTabs** — табы для контента (например, Free/Paid).
- FR26. **Buttons** — primary / secondary / disabled (по макету «Кнопки»).
- FR27. **ActionButtons** — иконочные действия (по макету «Кнопки экшенов»).
- FR28. **ChatButtons** — кнопки чата (по макету).
- FR29. **ButtonLink** — текстовая кнопка-ссылка.
- FR30. **Likes** — анимированное сердце + счётчик.
- FR31. **Inputs** — текстовое поле с состояниями default/focused/error.
- FR32. **Comment** — карточка комментария (avatar, name, text, time).
- FR33. **Loader** — индикатор загрузки.
- FR34. **EmptyState** — «Ничего не найдено» (по макету).
- FR35. **ErrorState** — «Ошибка загрузки» с кнопкой Retry.

### 4.8 Экраны
- S1. **Feed** — лента с табами и pull-to-refresh.
- S2. **PostDetail** — деталь поста + комментарии.
- S3. **ErrorState** (внутри Feed/Detail при ошибке).
- S4. **EmptyState** (внутри Feed при пустом результате).

## 5. Не-цели (вне рамок)

- Нет реального логина/регистрации (только генерация UUID).
- Нет редактирования/удаления постов и комментариев.
- Нет подписок и оплаты (paid-посты — заглушка).
- Нет push-уведомлений.
- Нет тёмной темы (если её нет в Figma).
- Нет i18n — UI на русском.
- Нет E2E (Detox/Maestro) — за рамками тестового. Минимальный smoke-набор unit/integration описан в §7.5.

## 6. Дизайнерские решения

Источник правды — Figma `bAxXrk7TaPN13TZ60yf7uD`. Ноды:
- Kit (1-2665), Tabs (1-2666), ChatButtons (1-2868), Buttons (1-2722), ActionButtons (1-2731), ItemTabs (1-2784), Likes (1-2801), ButtonLink (1-2861), Comment (3-1873), Inputs (1-2842), Loader (1-4538).
- Экраны: General (1-1918), Error (1-2156), Empty (1-2384).

**Действия**:
- Извлечь токены (`get_variable_defs`) → положить в `src/theme/tokens.ts` (colors, typography, spacing, radii).
- Извлечь иконки/изображения как SVG/PNG в `assets/`.
- Шрифты — подключить через `expo-font` (имена шрифтов уточнить из Figma после восстановления доступа).

> ⚠️ На момент написания PRD **MCP-инструменты Figma вернули 403** (файл не в команде разработчика). Перед реализацией user должен либо пригласить `kalmbik61@gmail.com` в команду файла, либо сделать копию в свою команду, либо предоставить export токенов вручную.

## 7. Технические соображения

### 7.1 Стек
- **Expo SDK** (последний стабильный) + TypeScript strict.
- **expo-router** — file-based навигация (`/`, `/post/[id]`).
- **@tanstack/react-query** — кэш, пагинация (`useInfiniteQuery`), оптимистичные обновления.
  - Defaults: `staleTime: 30_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: false`, `retry: (failureCount, err) => err.retryable && failureCount < 2`.
- **expo-secure-store** — хранение UUID.
- **expo-image** — обложки и аватары (`cachePolicy: 'memory-disk'`, `transition: 200`).
- **react-native-svg** — иконки из Figma.
- **react-native-reanimated** — анимация лайка (scale spring).
- **Native `WebSocket`** к `wss://k8s.mectest.ru/test-app/ws` (без socket.io — меньше зависимостей; точный URL уточнить, см. Q2).
- **uuid** (v4) — генерация client-id.
- **AsyncStorage** не используется — всё через SecureStore.

**Состояние:**
- Server state — react-query.
- Auth (UUID) — `AuthContext` поверх SecureStore.
- WS — singleton-модуль `src/api/ws.ts` (без zustand/redux).
- UI-state (активный таб, открытые модалки) — локальный `useState` в компонентах.

### 7.1.1 Data flow

```
[App start]
   ↓
[AuthProvider] ─── SecureStore.uuid (или generate v4)
   │
   └─→ привязывает Authorization header в client.ts
         │
         ├─→ [QueryClient] ── REST: posts, post, comments, like
         │      ↑                                    │
         │      │                                    │ optimistic update
         │      │                                    ↓
         │      │                              [Like UI] ← rollback on ApiError
         │      │
         │      └─── setQueryData ←───┐
         │                            │
         └─→ [WSClient] subscribe ────┤
                ↓                     │
          { like_updated,             │
            comment_added }   ────────┘
                ↓
          AppState 'background' → close
          AppState 'active'      → reconnect + invalidate ['posts']
```

### 7.2 Структура проекта
```
app/                       # expo-router
  _layout.tsx
  index.tsx                # Feed
  post/[id].tsx            # PostDetail
src/
  api/
    client.ts              # fetch wrapper + auth
    posts.ts               # endpoints
    comments.ts
    ws.ts                  # WebSocket
  features/
    feed/                  # FeedList, FeedTabs, useFeedQuery
    post/                  # PostHeader, PostBody, PaidGate
    comments/              # CommentsList, CommentInput
  ui/                      # design system
    Tabs/, Button/, Likes/, Comment/, Input/, Loader/, EmptyState/, ErrorState/
  theme/
    tokens.ts              # из Figma
    typography.ts
  store/
    AuthContext.tsx        # UUID provider + регенерация на 401
  utils/
    formatDate.ts
    queryKeys.ts
```

### 7.3 Контракты
- Все ответы оборачиваются `{ ok, data }` или `{ ok:false, error: { code, message } }` — в `client.ts` нормализуем и кидаем `ApiError`.
- Cursor-пагинация через `useInfiniteQuery` (`getNextPageParam: last => last.data.nextCursor`).

### 7.4 Производительность
- `FlatList` + `keyExtractor`, `getItemLayout` где возможно, `removeClippedSubviews`, `windowSize=10`. (Опционально — `@shopify/flash-list` для лучшего FPS на длинных лентах.)
- Кэш изображений — `expo-image` (`cachePolicy: 'memory-disk'`).
- React-query defaults см. §7.1.

### 7.5 Минимальный test plan
Цель — продемонстрировать понимание тестовой пирамиды без раздувания scope.

**Unit (jest + jest-expo):**
- T1. `src/api/client.test.ts` — нормализация ошибок: `200 ok`, `4xx`, `5xx`, `timeout`, `network` → корректный `ApiError.code`/`retryable`.

**Integration (jest + msw):**
- T2. `src/features/feed/useFeed.test.ts` — happy path, пустая лента → empty, `simulate_error=true` → ErrorState с retry.

**Component (react-native-testing-library):**
- T3. `src/ui/Likes/Likes.test.tsx` — toggle + disabled state.

**Manual QA-чек-лист (в README.md):** 10 пунктов покрывающих 4 user flows × 3 состояния (см. §8 Failure modes ниже).

## 7.6 Failure modes (как падаем и что показываем)

| Codepath | Failure | Handling | UX |
|----------|---------|----------|-----|
| GET /posts | timeout 15s | `ApiError.TIMEOUT, retryable=true` | ErrorState + Retry |
| GET /posts | 500 (`simulate_error=true`) | `ApiError.SERVER, retryable=true` | ErrorState + Retry |
| GET /posts | empty list | — | EmptyState |
| GET /posts/{id} | 404 | `ApiError.NOT_FOUND, retryable=false` | ErrorState без Retry, кнопка «Назад» |
| POST /like | 500 | rollback optimistic + toast | счётчик возвращается, toast «Не удалось» |
| POST /like | network drop после optimistic | rollback по таймауту 15s | как выше |
| POST /comments | 400 (>500 chars) | inline error под полем | подсветка input |
| WS connection dead | нет pong 60s | reconnect | прозрачно для UI |
| WS reconnect failed (10 попыток) | пауза до next AppState change | прозрачно, react-query продолжает работать через REST | — |
| Image load fail | `expo-image` показывает placeholder | — | серый бэк + иконка |

## 8. Метрики успеха

- M1. Все экраны и компоненты pixel-close к Figma (≤2px дельта).
- M2. Лента грузит первую страницу <1.5s на хорошем соединении.
- M3. Лайк visually отвечает <16ms (оптимистично).
- M4. Все 3 негативных сценария отрабатывают (`401`, `500`, empty).
- M5. WS-события визуально применяются <1s после события.

## 9. Открытые вопросы

- Q1. **Доступ к Figma**: добавить `kalmbik61@gmail.com` в команду / расшарить файл / переложить в `services's team`?
- Q2. WS endpoint: точный URL и протокол (socket.io vs native WS)? В `json.json` не описан.
- Q3. Какие платформы тестировать: iOS only, Android only, обе?
- Q4. Минимальные требования к версии Expo SDK / RN?
- Q5. Нужно ли деплоить EAS Build / нужен только репо?
- Q6. Шрифты в Figma — лицензия, какие именно (Inter, SF Pro, кастомный)?

---

## План пошаговой реализации

| Шаг | Действие | Verify |
|-----|----------|--------|
| 0 | Получить доступ к Figma, экспортировать токены | get_variable_defs работает |
| 1 | `npx create-expo-app` + TypeScript template, expo-router | `npx expo start` → blank app |
| 2 | Настроить ESLint/Prettier, абсолютные пути (`@/*`) | tsc passes |
| 3 | Подключить шрифты, прописать `src/theme/tokens.ts` | Тема импортируется |
| 4 | Реализовать `src/api/client.ts` (timeout 15s, ApiError normalization) + `AuthContext` (uuid + secure-store, 401-retry) | curl-эквивалент возвращает 200; T1 проходит |
| 5 | Реализовать UI-Кит (`Button`, `Tabs`, `Input`, `Loader`, `Likes`, `Comment`, `EmptyState`, `ErrorState`) | Storybook-страница / dev-screen рендерит все варианты |
| 6 | Экран **Feed** + `useInfiniteQuery` + табы + pull-to-refresh | Скролл подгружает страницы |
| 7 | Экраны **Empty** и **Error** intergrated в Feed | Триггерится `simulate_error=true` |
| 8 | Экран **PostDetail** (header, body, paid-gate) | Открывается по тапу |
| 9 | Лайк (оптимистичный) | Сердце меняется мгновенно |
| 10 | Комментарии (список + ввод + добавление) | Новый коммент появляется в топе |
| 11 | WebSocket: client + AppState pause/resume + heartbeat + dispatch в react-query cache | Лайк с другого клиента обновляет UI; убийство сети не вешает приложение |
| 12 | Минимальные тесты T1–T3 | `jest` зелёный |
| 13 | Polish: skeleton/loaders, edge-cases, a11y labels | Manual QA по чек-листу |
| 14 | README: инструкция запуска + Manual QA-чек-лист + .env.example | `npm run start` поднимает Expo |
