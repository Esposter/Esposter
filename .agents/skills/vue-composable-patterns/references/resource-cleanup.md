# Resource cleanup and the primitives that own it

Read when a composable or component sets up something that outlives a single tick — an interval, a listener, an observer, a pan/zoom surface — or when deciding _when_ to tear one down.

## Every primitive exists because the second copy loses its teardown

A setup/teardown pair written by hand is correct the first time and wrong the third: the pair drifts apart across components, and the copy that lost its `clearInterval` or its `removeEventListener` is the one that fires into a destroyed component. Reach for the primitive.

- **A mount-scoped interval is `useWorkerInterval(callback, intervalMs)`**, never a hand-written `setInterval` in `onMounted` plus a `clearInterval` in `onUnmounted`. It schedules on `worker-timers`, so the interval keeps firing in a backgrounded tab; VueUse's `useIntervalFn` is the main-thread one, correct where throttling is fine. An interval armed by an event rather than by mounting — a recorder starting, a countdown beginning — still owns its own id.
- **Pan and zoom is `usePanZoom`** (`composables/shared/usePanZoom.ts`), never hand-rolled scale/offset refs and pointer handlers. `@panzoom/panzoom` is already a dependency and its options cover the whole surface (`minScale`/`maxScale`, `panOnlyWhenZoomed`, `step`, wheel and pinch). It owns the instance for whichever element its target currently holds, mirrors the scale into a ref so a template can read `isZoomed`, and disposes with the scope; the call site keeps only its own policy — a ctrl-wheel gate, a control strip, a snap back to centre at the fitted size.
- Otherwise prefer a VueUse composable over a manual listener, and clean up in `onUnmounted` whatever is left: intervals, timeouts, animation frames, listeners.

## Unmount is the teardown trigger, not "currently unneeded"

An observer or listener set up once at setup stays for the component's life. Don't add a `watchEffect` that stops and re-creates it as some flag flips.

An `IntersectionObserver` is the clearest case: on a `display: none` element it reports not-intersecting and goes quiet on its own, so `v-show` plus a permanent observer already costs nothing, while the stop/restart version adds a re-observation race for no saving (`Styled/Waypoint.vue`, and the `pagination` skill). Where a resource genuinely must not exist yet, use the composable's own defer option rather than a teardown cycle.

## Call the composable at setup, never inside a callback

A composable invoked from a `watch` handler, an event handler or a `.then` runs outside the component's effect scope, so its `tryOnScopeDispose` cleanup never registers — the timer, listener or observer outlives unmount and fires into a destroyed component, and a fresh one leaks on every invocation.

Instantiate once at setup with the composable's own defer option (`useTimeoutFn(fn, ms, { immediate: false })`) and call the returned `start`/`resume` from the callback.
