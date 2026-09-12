# Per-rule Notes

Read when one of these rules reports and the fix is not what its message says — an autofix that breaks a signature, a false positive on an overload, a disable that is earned, a rewrite that keeps positional indices. The directive syntax is in `SKILL.md`; this page is the rule-by-rule detail.

## The `require-await` autofix can break a Promise-returning function

`require-await` strips `async` from a function whose body never awaits — and the lint hook applies it to any file you edit, so it lands on code you did not think you were touching. `async` is not only about awaiting: it also wraps a plain return value in a promise. A function annotated `: Promise<T>` that returns a bare `T` on one early-exit path (a no-op outcome returned before any async work) stops compiling the moment the keyword goes, and the error surfaces on the _return_ line, far from the edit that caused it.

Fix it by making that path's value a promise (`return Promise.resolve({ status: … })`) rather than re-adding `async` — the keyword goes straight back out on the next edit of the file. **Typecheck after any lint-hook autofix that touched a signature**; the hook reports success either way.

That fix restores the return type but not the rejection path: without `async`, a throw in the synchronous part of the body escapes at the call site instead of rejecting the returned promise, so a caller that only attaches `.catch()` never sees it. When the function is written to throw for its callers to handle as a rejection, keep `async` and disable `require-await` on it with that reason.

## `typescript/no-useless-default-assignment` (oxlint)

The rule proves a default can never fire from the signature it is written on — and for an overloaded function that
is the **implementation** signature, never the overloads a caller actually sees. So a parameter one overload
declares optional, defaulted in an implementation whose own annotation makes it required, reports as a useless
default. Deleting it is a runtime defect the types no longer describe: the single-argument call indexes by
`undefined`. Take the file-level `/* oxlint-disable typescript/no-useless-default-assignment -- reason */`
(`packages/shared/src/util/array/takeOne.ts`).

## `typescript/method-signature-style` (oxlint)

Interface method signatures must be property signatures (`bar: (x: string) => void`, not `bar(x: string): void`). Two exceptions take a file-level `/* oxlint-disable typescript/method-signature-style -- reason */`:

1. **Built-in interface augmentations needing generic-per-call-site overloads** (`declare global { interface ObjectConstructor { … } }`) — method signatures let each call site pass different type arguments; property signatures don't.
2. **Third-party declaration files with real overloads** (DefinitelyTyped-style `.d.ts`) — overloaded method signatures can't be cleanly converted.

**Overloads in your own code** don't qualify: use call signatures inside an object type — `bar: { (x: string): void; (x: number): string }`.

## `no-restricted-properties` bans (oxlint, `.oxlintrc.json`)

**`expect.any(...)`** is banned in tests — it asserts only the type, not the value. The reasoning covers every `expect.<asymmetric>` matcher, but only `expect.any` is in `no-restricted-properties`: `stringContaining`, `arrayContaining` and `anything` still have sites, and switching a rule on over them buys disables rather than coverage (`sweeps`, "Shrinking beats re-running"). Capture the real argument from the mock's `mock.calls` and assert it exactly (`const [upperDir] = takeOne(vi.mocked(fn).mock.calls);`). When the captured arg is a known shared reference, assert it directly (`toHaveBeenCalledExactlyOnceWith("error", noop)`); when only its type is knowable, use `toBeTypeOf`. `takeOne` and `noop` come from `@esposter/shared`.

**`JSON.parse`** is banned because `jsonDateParse` from `@esposter/shared` is the default parse: plain `JSON.parse` leaves every Date as an ISO string. A type argument on the parse replaces the `as` cast, and belongs on the plain-parse helper of the last bullet rather than on `jsonDateParse` — `parseMachineJson<{ "exit-code"?: number }>(line)`. It is still only a compile-time claim: anything crossing a trust boundary is typed by the schema that validates it (the **zod** skill's `references/boundary-payloads.md`). See `apps/web/content/docs/architecture/serialization.md`.

- Disable it on the line as `oxlint-disable-next-line no-restricted-properties -- <reason>`, only where blanket revival would change wanted runtime behaviour: the parse feeds a Zod schema that validates and coerces the result itself while a free-text field could hold an ISO-shaped string (resource content blobs, drafts), payloads replayed verbatim (dead-letter events), and `jsonDateParse`'s own implementation.
- **Tests do not get a disable** — a test parses with `jsonDateParse` like everything else, unless the model it asserts against types the field as a string.
- **"The data has no dates" is not a reason** — the reviver is then a no-op, so `jsonDateParse` is the shorter correct call and stays correct if a date ever appears. That holds for machine-generated JSON whose string fields are a fixed vocabulary a program writes (versions, rule ids, status keys).
- **It stops holding the moment a string field is free-form text a person names** — a repo-relative path, a symlink target, a script body. The reviver reads shape, not schema, so a file legitimately called `2026-08-05T12:00:00Z` arrives as a `Date` the reading schema's `z.string()` then rejects, failing a whole read over one filename. Those documents parse plainly, through **one named helper per package** that owns the single disable — same rule as the content blobs above: the schema owns coercion, so the parse must not guess.

## `prefer-named-capture-group` (oxlint)

Every capturing group `(...)` must be named `(?<name>...)` — including plain groups inside lookaheads (`(?=...)`, `(?!...)`). `(?:...)` is already non-capturing and needs no name.

**Named groups retain positional indices**, so all existing usages keep working and only `match.groups.name` is new: replacement strings (`"$1"`), callback positional args, `exec(str)?.[1]`, and back-references (`\1`, also `\k<name>`).
