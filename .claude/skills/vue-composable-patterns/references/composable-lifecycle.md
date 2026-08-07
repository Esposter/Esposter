# Async composable bodies and subscribables

Read when a composable `await`s before registering hooks or watchers, or when wiring a feature's tRPC subscriptions. The always-on cleanup and SSR rules — `onUnmounted` teardown, watches set up in `setup()`, `watchImmediate` as the SSR concern — are in `SKILL.md`.

## Capture the instance before `await`

`<script setup>` top-level `await` is compiled with `withAsyncContext`, so pages/components may freely register hooks and watchers after an `await`. **Composable bodies get no such treatment** — after the first `await` inside an async composable, `getCurrentInstance()` is `null`, lifecycle hooks warn ("no active component instance") and watchers are no longer bound to the component scope.

Pattern (<https://antfu.me/posts/async-with-composition-api> — see `useReadData`, `useGrapesJsEditor`):

```ts
export const useFoo = async () => {
  // https://antfu.me/posts/async-with-composition-api
  const currentInstance = getCurrentInstance();
  const { data: session } = await authClient.useSession(useFetch);
  const { stop, trigger } = watchTriggerable(session, () => {
    /* ... */
  });

  onMounted(() => {
    trigger();
  }, currentInstance);

  // The watcher is registered after an await, so the component scope cannot auto-stop it
  onUnmounted(() => {
    stop();
  }, currentInstance);
};
```

- Capture `getCurrentInstance()` into a `const` **before** the first `await`; pass it as the second argument to every lifecycle hook registered after the await.
- Watchers created after an `await` are not auto-disposed — keep the `stop` handle and call it in `onUnmounted`.
- Subscribable composables use `getOnlineSubscribableContext()` (esbabbler skill), which packages this capture.

## Subscribable composables (`use*Subscribables`)

Composables managing tRPC subscriptions for a feature are named `use{Feature}Subscribables` and live in `composables/<domain>/subscribables/`. They are self-registering (no return value) and called from the aggregating `useSubscribables()`.

```typescript
// composables/<domain>/subscribables/useFooSubscribables.ts
export const useFooSubscribables = () => {
  // calls useOnlineSubscribable, sets up tRPC subscriptions; no return value
};

// composables/<domain>/subscribables/useSubscribables.ts
export const useSubscribables = async () => {
  await useBarSubscribables();
  useFooSubscribables();
};
```

- Name pattern: `use{Feature}Subscribables` — not `...Channel`, not `...Watcher`.
- No return value — self-registering side effects.
- Always call `useOnlineSubscribable` (not a raw `watch`) so subscriptions reconnect after going offline.
