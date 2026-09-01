# Observing the browser from a composable

Read when a composable reads scroll position, connectivity, or anything else that only exists in a browser. This page holds the whole rule; `SKILL.md` keeps the composable-authoring rules these compose with.

## Scroll Position — Observe It, Never Measure It

- **"Is this element in view" is `useElementVisibility` over a sentinel, never a scroll-offset threshold.** `useScroll`'s `x`/`y` are written by scroll events alone, and nothing re-measures when the observed element changes — so a container that remounts (a route change, a keyed swap) inherits the offset of the container that was torn down and keeps reporting it until the user scrolls the new one. That stale "the reader is far up the list" is the affordance that reappears after the click that already satisfied it. `useElementVisibility` re-observes whenever its target or root changes, and the observer's first callback reports the truth.
- **A zero-height sentinel gets its tolerance from `rootMargin`, and the tolerance is a reactive quantity the reader already owns** — the scroll container's own height for "within a screen" — not a tuned pixel constant that is wrong on a phone and wrong again on a tall monitor. One wheel notch off the edge is not a change of state. `rootMargin` takes a getter, so the observer re-observes when the container resizes.
- **`initialValue` faces the answer that costs nothing when wrong.** An observer reports a frame after it is created, so an affordance that defaults to "something is off screen" flashes on every mount.
- **A position answer that more than one surface reads is one predicate in the store**, computed from the observed state, not a measurement each surface takes for itself — and it is only half the answer when the loaded window is paginated: the end of the list is not the end of the data while a "has more" cursor is set.

## Online/Offline Detection

- **Always `useOnline()` from VueUse** — never `navigator.onLine` directly, nor a `checkIsServer()` + `navigator.onLine` guard. It returns a reactive `Ref<boolean>` updated on `online`/`offline` events and is SSR-safe (defaults to `true` on the server).
- For subscribables (tRPC subscriptions, WebSocket connections) use `useOnlineSubscribable` (`composables/shared/`), which combines `useOnline()` + `onMounted` + `watchImmediate` + `onUnmounted` cleanup.

## Browser-Only Composables (SSR Safety)

Regular `watch`/`watchDeep` are SSR-safe — they don't fire until the source changes (client-side only). Set them up directly in `setup()`, **not** inside `onMounted`: Vue scopes them to the component and disposes them on unmount, so no manual `WatchHandle[]` + `onUnmounted` cleanup.

**`watchImmediate` is the SSR concern** — it runs the callback during `setup()` (on the server). If the callback touches browser APIs, use `watchTriggerable` + `onMounted` to defer the first execution (as `useOnlineSubscribable` does):

```ts
const { trigger } = watchTriggerable(source, (value) => {
  // Browser-only logic
});
onMounted(async () => {
  await trigger();
});
```
