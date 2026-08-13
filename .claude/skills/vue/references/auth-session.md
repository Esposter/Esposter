# Reading the auth session

Read when a component, composable, store or middleware needs the signed-in user.

The two call forms differ in access shape as well as in what they support, so picking one is picking how every read of it is written.

**Async SSR-relevant context** — component `<script setup>`, async composable, route middleware:

```ts
const { data: session } = await authClient.useSession(useFetch); // session.value?.user.id
```

better-auth fetches through Nuxt's SSR-aware `useFetch`, so the session populates during SSR and hydration. The destructure is what flips the access shape.

**Synchronous / client-only context** — Pinia setup stores, synchronous composables:

```ts
const session = authClient.useSession(); // session.value.data?.user.id
```

Not awaited, no `useFetch`; returns a reactive ref. Required wherever you can't `await`, and fine for client-only features (subscriptions, IndexedDB cache, WebRTC, action handlers) that never need the session at SSR time.

`useFetch` returns a promise, so it can only be passed where you can `await`. Don't make a synchronous composable `async` just to reach the first form unless it genuinely runs during SSR.
