# Function Signatures — Overloads, Defaults, Flag Parameters

Read when writing a function's parameters: a second call shape, an options object, a default, or a boolean
flag.

## Overloads

An overload is a `function` declaration, and that is the one overload form: no arrow overload, no interface of call signatures, no `as`. Write one overload signature per call shape, each with its own precise return, then one implementation with no return annotation, whose parameters accept every shape:

```ts
export function getFoo(db: Db, id: string): Promise<bigint>;
export function getFoo(db: Db, ids: string[]): Promise<Map<string, bigint>>;
export async function getFoo(db: Db, ids: string | string[]) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  // ...shared implementation, producing `result: Map<string, bigint>`...
  return Array.isArray(ids) ? result : (result.get(ids) ?? 0n);
}
```

- The implementation signature is not visible to callers: they see only the overload signatures, so each keeps its precise return.
- The implementation's return is **inferred**, not written out. TypeScript checks each overload against the implementation loosely, so the implementation's union return and each overload's narrower return need no cast between them.
- Use `Array.isArray` to branch; each branch returns its specific type.
- `apps/web/app/composables/dungeons/useDialogMessage.ts` is the example for a mapped-type return, and `apps/web/app/composables/message/room/useCreator.ts` the same shape for a union return.

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
