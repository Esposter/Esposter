# Reading the auth session

Read when a component, composable, store or middleware needs the signed-in user.

The two call forms differ in access shape as well as in what they support, so picking one is picking how every read of it is written.

**Async SSR-relevant context** — component `<script setup>`, async composable, route middleware:

```ts
const { data: session } = await useAuthSession(); // session.value?.user.id
```

`useAuthSession` hands better-auth Nuxt's SSR-aware `useFetch`, so the session populates during SSR and hydration; it is the one place that adapter is written, so a call site never passes a fetch of its own. The destructure is what flips the access shape.

**Synchronous context** — Pinia setup stores, synchronous composables, a component rendered once per row:

```ts
const session = useSessionData(); // session.value?.user.id
```

It reads back the payload entry the root's `useAuthSession` wrote (`AsyncDataKey.AuthSession`), so the server's render and the client's first render see the same session, with no request and no async boundary. Same access shape as the awaited form.

**Never `authClient.useSession()` with no fetcher.** better-auth's synchronous atom is empty on the server and filled in the browser before hydration ends, so whatever it gates renders differently on the two sides (`selector-ban/no-restricted-syntax` reports it; `openspec/specs/architecture/hydration/design.md`). Suites still sign a user in through the mocked `useSession` (`setupSession`): `app/test/setup.ts` bridges `useSessionData` to it.

`useAuthSession` returns a promise, so it can only be called where you can `await`. Don't make a synchronous composable `async` just to reach the first form unless it genuinely runs during SSR.
