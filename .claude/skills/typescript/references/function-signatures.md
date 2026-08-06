# Function Signatures — Overloads, Defaults, Flag Parameters

## Arrow function overloads

Use call signature syntax on the variable type — never `function` declarations for overloads:

```ts
interface GetPermissions {
  (db: Db, userId: string, roomId: string): Promise<bigint>;
  (db: Db, userId: string, roomIds: string[]): Promise<Map<string, bigint>>;
}

export const getPermissions: GetPermissions = async (db, userId, roomIds: string | string[]) => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  // ...shared implementation...
  if (Array.isArray(roomIds)) return result; // Map branch
  return result.get(roomIds) ?? fallback; // scalar branch
};
```

- Overload signatures go on the `const`'s **type annotation**, not repeated in the body.
- Implementation parameter types must be the **union** of all overload variants.
- Use `Array.isArray` to branch; each branch returns its specific type.

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

- **Does any caller pass the other value?** If every call site passes the same one, it is not an option — delete it and keep the single behaviour. `listBlobNames(client, prefix, { isDeep: true })` was passed `true` by every caller in the repo, so the default was a path nothing exercised: a hierarchy listing over a prefix with no trailing delimiter resolves to **zero** blobs and reports a full directory as successfully empty. An unexercised default is a trap with a countdown on it, not flexibility.
- **Does it change what the function does, or only describe who called it?** A flag the function itself acts on is ordinary. A flag that exists to tell a _distant_ layer something about the caller — this read is a background timer's, not the user's — is only justified when that layer genuinely cannot observe the fact for itself. `errorLink` cannot: it sees a rejection, not who asked for it, and it navigates to the login page on `FORBIDDEN`. Thread that kind through the channel the transport already has (tRPC's per-call `context`), and name the fact (`isBackground`), never the reaction (`isNoRedirect`).
- **Is it readable at the call site?** `f(a, b, true)` says nothing at the point a reader meets it. One optional boolean whose meaning is obvious from the callee's name may stay positional (`storeCreateMessage(message, true)` — optimistic); anything less obvious, and anything that would be the second flag, goes in a named options object destructured in the signature (see above).

Test helpers are held to the same bar: a `seed(name, isAged)` whose two modes are one call each is two helpers pretending to be one — seed the realistic case and let the outlier build its own.
