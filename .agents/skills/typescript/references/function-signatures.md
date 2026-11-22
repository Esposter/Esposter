# Function Signatures — Overloads, Defaults, Flag Parameters

Read when writing a function's parameters: a second call shape, an options object, a default, or a boolean
flag.

## One or many: two functions, never overloads

**Overloads are banned in authored code.** A function declared with several call signatures is trusted rather than checked: the compiler never verifies that the implementation returns each overload's narrowed type, so each overload is a cast in disguise. The same holds for an interface with two or more call signatures. Each of those is one function with one exact type, and the compiler checks it in full.

When one function takes one value or many and returns a different shape for each, write two:

- The **batch** function takes the array and returns the map, named for the selector it takes (`getPermissionsByRoomId(db, userId, roomIds)` returns `Map<string, bigint>`).
- The **single** function takes one value, calls the batch with a one-element array, and reads its entry (`getPermissions(db, userId, roomId)` returns `bigint`).

```ts
export const getPermissionsByRoomId = async (db: Db, userId: string, roomIds: string[]) => {
  // ...the shared read, producing `roomIdPermissionsMap: Map<string, bigint>`...
  return roomIdPermissionsMap;
};

export const getPermissions = async (db: Db, userId: string, roomId: string) =>
  (await getPermissionsByRoomId(db, userId, [roomId])).get(roomId) ?? 0n;
```

Each is an `export const` arrow, one per file. The names follow the `naming` skill (`references/verb-families.md`), where a `By<Selector>` that separates two reads of the same rows is kept.

**Nullability that only a caller knows becomes a guard at the caller.** A function does not split into a defined-input form and a maybe-undefined one. It takes the widest input it accepts and returns the type that input produces, and the caller narrows it where it reads the result: `v-if="creator"` in a template, or an early return in a script. `apps/web/app/composables/message/room/useCreator.ts` is the example: it returns `ComputedRef<Creator | undefined>`, because a message that names no author has no creator, and each component that reads the creator guards it.

**The exceptions are a declaration file's augmentation and two shapes that cannot be written with one signature.** A `.d.ts` file, a `declare module` block and a `declare function` may declare overloads, because augmenting a third-party API that is already overloaded has to match its shape. `takeOne`'s `TakeOne` interface (`packages/shared/src/models/shared/TakeOne.ts`) types an array's element and a record's value with two signatures, since one conditional signature would need a cast. `UseSubscriptionOptions` (`packages/trpc-nuxt-module/src/runtime/client/models/UseSubscriptionOptions.ts`) reads the first of tRPC's two `subscribe` overloads, which a single signature cannot reach. Each of the two carries one eslint directive stating its reason. Nothing else may.

## Options argument defaults

**Destructure with defaults in the parameter itself** — the most elegant form for an options/config argument. Never a separate `const { x = false } = options;` line, and never `options.x ?? false` at the use site.

```ts
// CORRECT — defaults live in the destructured parameter
export const createThing = ({ overlay = false }: Partial<ThingOptions> = {}): Thing => { ... };

// WRONG — extra line
export const createThing = (options: Partial<ThingOptions> = {}): Thing => {
  const { overlay = false } = options;
  ...
};

// WRONG — default scattered to the use site
export const createThing = (options: Partial<ThingOptions> = {}): Thing => create({ overlay: options.overlay ?? false });
```

- **Applies to any parameter, not just options objects.** A positional optional arg that the body coalesces to a constant belongs in the signature default too — including reactive defaults: `(position = ref({ x: 0, y: 0 })) => …`, never `const p = position ?? ref({ x: 0, y: 0 })` in the body. A parameter default expression is re-evaluated per call, so a fresh `ref`/object/array default is safe (no shared-instance bug).
- **`?? <default>` is only correct when the fallback can't live in the signature** — i.e. the coalesced value is _not_ a parameter: a slot prop the framework types `boolean | null` (`isHovering ?? false`), a nullable API/query result, or a default that depends on another already-bound parameter. When the left side of `??` traces back to an optional parameter, move the default into that parameter instead.

## Boolean flag parameters

Three questions before adding one, in order. Most proposed flags die at the first.

- **Does any caller pass the other value?** If every call site passes the same one, it is not an option — delete it and keep the single behaviour. When every caller of `listFoos(client, prefix, { isDeep })` passes `true`, the default is a path nothing exercises — and an unexercised default is a trap with a countdown on it, not flexibility.
- **Does it change what the function does, or only describe who called it?** A flag the function itself acts on is ordinary. A flag that exists to tell a _distant_ layer something about the caller — this read is a background timer's, not the user's — is only justified when that layer genuinely cannot observe the fact for itself. `errorLink` cannot: it sees a rejection, not who asked for it, and it navigates to the login page on `FORBIDDEN`. Thread that kind through the channel the transport already has (tRPC's per-call `context`), and name the fact (`isBackground`), never the reaction (a no-redirect flag).
- **Is it readable at the call site?** `f(a, b, true)` says nothing at the point a reader meets it. One optional boolean the callee's own name already accounts for may stay positional (`storeCreateFoo(foo, true)` — a store create either appends or prepends, so `isReversed` is the only thing a second argument could be saying); anything less obvious, and anything that would be the second flag, goes in a named options object destructured in the signature ("Options argument defaults", on this page).

Test helpers are held to the same bar: a `seed(name, isAged)` whose two modes are one call each is two helpers pretending to be one — seed the realistic case and let the outlier build its own.

## Return types

- **Prefer inferred return types** — annotate only when (a) the inferred type is too broad and you want a narrower contract (e.g. `ComputedRef<ValidationRule>` instead of `ComputedRef<(value: string) => string | true>`), or (b) the function is a public API boundary. Never annotate for documentation, service functions included.
