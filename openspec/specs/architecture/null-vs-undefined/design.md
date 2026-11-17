# Null vs Undefined

App-owned code uses a **single absent-value form**: the domain sentinel where one exists (`""` for strings, `0` for counts with no domain meaning, a schema-carried default), and `undefined` where absence must be distinguishable from every real value. `null` is never written by app-owned code — not as a literal, not as a `| null` union member, not as a `.nullable()` Zod field. Every `null` in the repo therefore belongs to one of the boundary shapes below, and a type that keeps one says which boundary it came from, because the next reader cannot see that from the type.

## Why one sentinel

`undefined` is what the language itself produces for absence — missing object keys, optional parameters, `Array.prototype.find` misses, `Map.get` misses, optional chaining. `null` is a second sentinel carrying no extra meaning, and a codebase holding both forces every consumer to handle two absent forms and reintroduces the `=== null` vs `=== undefined` bug class. The reverse standardisation (all-`null`) is impossible: the language APIs above emit `undefined` unconditionally, so a null-standard codebase keeps both sentinels forever.

## Boundaries keep their shape

External systems own their types, and `null` inside them is left exactly where it lands — there is **no conversion layer** and no boundary-ingress helper. Consume the value where it arrives with the normal tools (`??` onto a sentinel, a truthiness guard) only when the surrounding code actually needs the app-owned shape; otherwise let the boundary type flow through untouched.

Boundary shapes where `null` is expected and stays:

- **Drizzle ORM** — nullable columns (timestamps like `deletedAt`) infer and return `T | null`, and an absent one-to-one relation loaded through `with` is `null` too, which is why `ResourceWithPublication.publication` keeps it. Prefer non-nullable columns with schema-carried sentinels (`.notNull().default(...)`) so the question never arises; only types with no empty value stay nullable.
- **better-auth** — session/user fields such as `user.image` are typed `string | null`.
- **Cloudflare platform types** — a binding's and a queue message's types own their nullable members.
- **DOM and web APIs** — `querySelector`, `localStorage.getItem`, `RegExp.exec` return `T | null`; check with `=== null` or truthiness at the call site.
- **Third-party component props** — the occasional chart prop is typed `T | null`; pass `null` only where the prop type requires it.
- **Persisted JSON blobs** — `JSON.stringify` drops `undefined` keys, so a blob schema that already stores `null` keeps storing it (see [persisted data — latest shape only](../persisted-data-latest-shape-only/design.md)). The spreadsheet cell is the case that matters: `ColumnValue` is `boolean | null | number | string`, where `null` is the empty cell and `""` a cell holding the empty string — they sort, filter and count apart, and a dropped key is not a readable empty cell.

## Optional properties are exact

`exactOptionalPropertyTypes` is on in every program (`packages/configuration/tsconfig.base.json` and the app's generated tsconfigs through `apps/web/configuration/typescript.ts`), so a missing key and a key holding `undefined` are told apart: `field?: T` takes only the first. JavaScript treats the two differently in the places that matter (a spread over defaults, `Object.keys`, `in`, `Object.assign`), and the flag is how the compiler holds the "an absent property is optional" rule rather than prose.

An optional field a value may hand `undefined` says so, `field?: T | undefined`, and three places always do:

- **A `.vue` component's props.** Vue reads a prop bound to `undefined` as absent, and binding `undefined` is the only way a template leaves a prop out, so the distinction the flag draws does not exist for a prop.
- **A type a Zod or tRPC input parses into.** `.optional()` parses to `T | undefined`, and superjson carries an explicit `undefined` across the wire, so clients building `{ key: maybeValue }` keep working. A missing key and an explicit `undefined` never mean different things anywhere, so Zod 4's `.exactOptional()`, which tells them apart, is a lint error: one meaning for "not set" keeps every reader and writer aligned. The exception is a schema mirroring a library's own exact type: tiptap's `JSONContent` lets a node's `attrs` be undefined but never `content`, `marks`, `text` or `type`, because its editor never writes them so, and the note document's schema (`apps/web/shared/models/resource/note/NoteDocument.ts`) says the same key for key. Such a schema is annotated with the type it mirrors, which is what the rule admits. A transform dropping the undefined keys was rejected there: a transform cannot be drawn as JSON Schema, and the page builder draws the text node's form from that schema.
- **A type built as `{ key: maybeValue }` by its callers.**

A value handed to a type that takes no `undefined` for an optional field, a library's or a mapped `Partial<X>`, drops those keys with `omitUndefined` (`packages/shared/src/util/object/omitUndefined.ts`).

Two alternatives were rejected. `.exactOptional()` on every input whose type declares `field?: T` would refuse requests that send `undefined` today, which the type change alone never does. Keeping it for a field where absence and `undefined` differ would give "not set" two spellings, which every reader of that field then has to tell apart. The migration widened every declaration that received `undefined` with TypeScript's own quick fix that adds `undefined` to an optional property, and the flag holds every declaration that did not. Where a value meets a library type, its undefined keys are dropped, which the library reads the same as a missing key. The flag also found the places where the two had been read differently: a cleared room topic sent as a missing key, which the server's update skips, and a game object watching only the configuration keys present at its setup.

## "Not loaded yet" is a flag, never a sentinel

The tempting exception is a read that has to distinguish **"not loaded yet"** from **"loaded, and there is no row"**, since `useQuery` seeds its `data` as `undefined` and that looks like the sentinel being spent. It is not an exception: `useQuery` returns `isPending` alongside `data`, and the pending state is that flag's job. A read whose row is absent answers `undefined` like any other, and the consumer gates on `isPending` rather than inventing a third value:

The consumer gates on `isPending`, and the reader's rule with its component example is `.agents/skills/absent-values/references/null-vs-undefined.md`.

## Not lint-enforced

A gate flagging `null` literals and `| null` type positions makes a false positive of every legitimate boundary site above, and carving them out costs more than the rule catches. The standard falls to review, like the hand-rolled cases in [no polling](../no-polling/design.md).
