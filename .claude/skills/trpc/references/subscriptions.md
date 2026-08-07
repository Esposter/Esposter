# Subscription procedures

Read when adding a subscription procedure, or deciding whether the caller of a mutation also updates its own store.

## Room-scoped subscriptions — `getRoomEventSubscription`

The shared single-room subscription shape (member check + `roomIdSchema` input + forward `[data, device]` events matching the input room to everyone except the emitting device) is `getRoomEventSubscription(emitter, eventName, getRoomId)` in `server/trpc/procedure/room/`. A subscription whose body would only filter by room id and same-device MUST use it:

```ts
onCreateFoo: getRoomEventSubscription(fooEventEmitter, "createFoo", ({ partitionKey }) => partitionKey),
```

- Event map shape must be `[[Data, Device]]`; yield types stay exact per event via `TEventMap[TKey][0][0]` indexed access.
- **Deliberately NOT abstracted**: multi-room (room/userToRoom), callSession, typing/moderation/achievement subscriptions — their bodies differ in destructure, device-id construction and yield, so a builder would need as many lambdas as the body has lines. Don't force them in.

## Register the listener before the first `await`

In subscription generators, `on(emitter, event, { signal })` from `node:events` MUST be assigned to a `const` **before** any `await`. The `for await (const x of on(...))` form is NOT equivalent when an `await` precedes it — `on()` only runs when the `for await` line is reached, so synchronously-emitting mutations can fire during that `await` and be missed.

```ts
// CORRECT — listener registered synchronously before control is yielded
async function* ({ ctx, input, signal }) {
  const events = on(fooEventEmitter, "fooChanged", { signal });
  await requireFoo(ctx.db, input);
  for await (const [data] of events) { ... }
}

// WRONG — listener registered after requireFoo resolves
async function* ({ ctx, input, signal }) {
  await requireFoo(ctx.db, input);
  for await (const [data] of on(fooEventEmitter, "fooChanged", { signal })) { ... }
}
```

In tests, `Promise.all([iterator.next(), mutation()])` exposes this: the mutation runs synchronously after its middleware, emitting while the generator is still blocked on the validation `await`. `node:events` `on()` buffering only saves you if the listener was registered at emit time.

## No redundant store update after a mutation the subscription already covers

When a mutation emits to an event emitter and the subscription fires for **all** connected clients (including the caller — no `getIsSameDevice` filter), the subscription's `onData` handler is the single source of truth. Do NOT also call the `store*` action after the mutation returns.

| Subscription filters caller? | After-mutation store call needed?           |
| ---------------------------- | ------------------------------------------- |
| No (no caller filter)        | ❌ Remove — subscription handles it         |
| Yes (`getIsSameDevice`)      | ✅ Required — subscription skips the caller |

When adding a new subscription: decide once which pattern it uses, then be consistent — never mix both.
