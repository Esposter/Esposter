---
name: test-values
description: Esposter test values — the one canonical literal for every kind of value a test writes (strings "" and " ", numbers 0 / 0.1 / -1, booleans as a pair, the nonexistent id -1, a real id from crypto.randomUUID(), a field's own name as its value, filesystem names TEST_FILENAME / TEST_DIR), dates and times computed from the epoch (new Date(0), a later one offset by a Temporal duration, an ISO string only as toISOString() of one, never a typed date literal), the three checks every string literal passes before it goes in, the shared-data rule (declare once at describe scope, import what production owns, the base-plus-spread and create* shapes, let for rebuilt-per-test state) — and a Settled list rejecting typed "1970-01-01" and "2026-…" literals, semantic names like "room-1" or "logo.png", and invented prose bodies. Apply when writing or reviewing any literal, fixture, id, date, path or helper argument in a .test.ts, .test-d.ts or .bench.ts file.
---

# Test Values

The values a test writes. The `testing` skill owns the suite's structure, assertions and mocking; this skill owns
every literal in it, because a value chosen per file is the thing that drifts — one suite's `"2026-09-13"` beside
another's `"1970-01-01"` beside a third's `new Date()` — and the drift is what makes a reviewer stop to ask
whether the value means something. A canonical value means nothing, and says so.

## Settled — do not re-propose

- **A typed date or time literal** — `"1970-01-01"`, `"2026-09-13T00:57:05Z"`, `new Date("1970-01-02")`. Each file spells the epoch its own way, and a format read off one string (date-only, seconds, milliseconds, offset) is asserted against another's. The epoch is computed, never typed ("Dates and times").
- **A semantic name for a value the code never reads** — `"room-1"`, `"test-id"`, `"logo.png"`, `"helper.cjs"`, `"nested"`. It reads as meaning something, and the next reader has to check whether it does ("Every string literal passes one of three checks").
- **Prose as a body, title or note** — an invented sentence a human would type. The code matches a substring or stores a blob; the sentence is decoration and is what gets copied into the next suite as if it mattered.
- **A per-file copy of a value production owns** — a sentinel, marker, prefix, filename or sizing formula restated in the suite. It stays green while asserting the wrong thing after the source moves ("Import what production owns").

## Canonical values

- **Strings**: `""` is the base value, `" "` the different one; `"a"` only where a space trims to `""`. Object keys likewise — never semantic names.
- **Numbers**: integer `0`, decimal `0.1`, negative `-1`, `Number.NaN` as `String(Number.NaN)` where a string is needed. **Booleans** always as the pair `"true"`/`"false"` in one case.
- **Ids**: the nonexistent one is `"-1"` (or `-1` as a number). A real one is `crypto.randomUUID()` at `describe` scope, never a spelled uuid or a `"room-1"`.
- **Entity fields** use the field name as the value: `const name = "name"`.
- **Filesystem names**: `TEST_FILENAME = "a"` and `TEST_DIR = "/a"` from the nearest `constants.test.ts`, for every path a test writes. Extension only where the code under test reads it (`` `${TEST_FILENAME}.cjs` ``); a second coexisting path is the same name nested (`` `${TEST_FILENAME}/${TEST_FILENAME}.ts` ``), and a flat file beside that directory carries an extension because a bare `a` and a directory `a` collide. A real on-disk name production owns (`pnpm-lock.yaml`, `dist/index.js`) stays its real name. A package with no filesystem tests declares neither constant.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal. Idempotency is always `"[functionName] is idempotent"`.

## Dates and times

**Every date is computed from the epoch; none is typed.**

- A `Date` is `new Date(0)`. A later one is the epoch plus a Temporal duration — `new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"))` — never a second literal, and never a raw millisecond count (`feedback_temporal_durations`).
- A string is `.toISOString()` of one of those, so the format is the platform's and identical in every file. A date-only string is `.toISOString().slice(0, 10)` of it, with the `slice` read as "the date part" — a helper the suite declares once when it is used twice.
- Two values that must sort declare both at `describe` scope (`const epoch = new Date(0)`, `const nextDay = …`) and the test reads which is later from the names.
- `Date.now()` in the code under test is pinned, never awaited around: `vi.useFakeTimers({ now: 0 })` in `beforeEach` (the `testing` skill's timers page), so `createdAt` is asserted with `toStrictEqual(new Date(0))` and never `toBeInstanceOf(Date)`, which passes against a value written a day late.
- The one exception is a **date the code reads by its shape** — a parser's input, a format table's expected output, a coercion fixture — where the value _is_ the thing under test and a specific calendar date is the point. That value is still one `describe`-scope constant, and the test name says what about its shape is being read.

## Every string literal passes one of three checks

It is the value under test, or a canonical value above, or an existing `describe`-scope constant or helper in the
file. Anything else is decoration the code never inspects and does not go in. A token the code does inspect is
hoisted with its body so the two cannot drift: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``.

## Shared data — declare once, import what production owns

- **Never repeat a literal or object.** Anything two tests (or two rows of a bulk insert) use is one `describe`-scope `const`; a value used once stays inline — no single-use extraction.
- **Near-identical objects** are a `base*` const plus spread and override; **repeated arguments** spread the constant part; **uniform bulk inserts** `.map()` over the varying key.
- **Envelopes** are a `create*` helper taking only the varying payload (`createEvent({ … } satisfies PayloadType)`); **entity fixtures** are a `create*` helper annotated with the whole entity type, every field spelled out, plus a `Partial<T>` overrides parameter spread last — a new required column then fails at the fixture rather than in whichever suite reads it.
- **Import what production owns.** A sentinel, cmdline marker, temp-file prefix, cache filename, env-var key or sizing formula the source declares is imported from it; module-private, it is exported to the nearest `constants.ts`; taken as a parameter, the real constant is still what is passed. Numbers too: compute from the imported constant or assert the observable form (`Buffer.byteLength(JSON.stringify(chunk))`), never a mirrored formula. Only a test-only value with no production counterpart stays a `*.test` constant.
- **A literal a sibling test uses inline is an undeclared constant**: grep before adding a fixture, hoist it, converge those call sites in the same edit.
- **Scope**: runtime-independent values (uuids, literals, static objects) are `describe`-scope `const`; state rebuilt per test (a mock DB, a wrapper to unmount, a store) is a `let` in the `describe` callback initialised in `beforeEach`, read by helpers rather than passed to them. An input that merely differs between tests stays a parameter, never a `let` assigned before each call.
