# Awaiting a singleton component

Read when a caller has to await something a singleton component finishes, such as a dialog the player steps through or an animation a battle turn runs.

## Awaiting a singleton component: the store owns the resolver

A caller that has to wait for a **singleton component** to finish — a dialog the player steps through, an
animation a battle turn runs — cannot hold its own completion callback: the thing that learns it finished is
that component's event, in another part of the tree. The store between them owns the wait.

Shaped as **one awaitable action plus one completion action**, with the resolver a plain `let` in the store's
setup closure:

```ts
let onComplete: (() => void) | undefined;

const playFoo = async (payload: Foo) =>
  await new Promise<void>(
    getSynchronizedFunction(async (resolve) => {
      onComplete = resolve;
      target.value = payload;
      // The gate the caller waits on, so work that fails resolves it rather than stalling everything behind it
      await getResultAsync(() => start()).match(noop, (error) => {
        console.error(error);
        resolve();
      });
    }),
  );

const completeFoo = () => {
  target.value = undefined;
  const resolve = onComplete;
  onComplete = undefined;
  resolve?.();
};
```

The component binds `@complete="completeFoo()"` and knows nothing about a promise; the caller `await`s
`playFoo(...)` and knows nothing about the component. `useDialogStore`'s queued `onComplete` is the reference
implementation, and `useAttackManagerStore` is the same shape.

**Never export the resolver, and never park it in a module-level mutable.** A `export const ExternalFooStore = {
onComplete: undefined as (() => void) | undefined }` beside the store looks like the smallest possible fix and
is three defects: one holder is shared by every Pinia instance, so on the server one request's callback is
another's; the clearing and the calling move to whichever component happens to emit, where forgetting either
wedges the caller forever; and the file now has two exports whose second is a mechanism rather than a value. A
`let` in the setup closure is per-store-instance, unreachable from outside, and reads in one place.

**A `let` is right here and a `ref` is not.** The resolver is not state anything renders, so making it reactive
buys a dependency nobody wants — and the store's own action is the only reader.
