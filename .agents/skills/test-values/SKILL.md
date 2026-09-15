---
name: test-values
description: Esposter test values — the goal every literal serves (the least value that still distinguishes what the test reads, which is why "" precedes " " and the epoch precedes every other instant, and a differing value moves one step in the one part under test), the one canonical literal for every kind of value a test writes (strings "" and " ", numbers 0 / 0.1 / -1, booleans as a pair, the nonexistent id -1, a real id from crypto.randomUUID(), a field's own name as its value, filesystem names TEST_FILENAME / TEST_DIR), dates and times computed from the epoch (new Date(0), a later one offset by a Temporal duration, an ISO string only as toISOString() of one, never a typed date literal), the three checks every string literal passes before it goes in, the shared-data rule (declare once at describe scope, import what production owns, the base-plus-spread and create* shapes, let for rebuilt-per-test state) — and a Settled list rejecting typed "1970-01-01" literals and calendar dates from any year but the epoch's, semantic names like "room-1" or "logo.png", invented prose bodies, and loosening an assertion because the producer's output is not minimal — the output is strict-equalled whole and the producer is trimmed. Apply when writing or reviewing any literal, fixture, id, date, path or helper argument in a .test.ts, .test-d.ts or .bench.ts file.
---

# Test Values

The values a test writes. The `testing` skill owns the suite's structure, assertions and mocking; this skill owns
every literal in it, because a value chosen per file is the thing that drifts — one suite's typed calendar date
beside another's typed epoch beside a third's `new Date()` — and the drift is what makes a reviewer stop to ask
whether the value means something. A canonical value means nothing, and says so.

## The goal: the least value that still distinguishes

Every value a test writes is the least one that tells apart what the test reads, and nothing more. That is the
whole reason `""` comes before `" "`, `0` before `1`, the epoch before any other instant, and `"a"` before a
word: the least value carries no part the reader has to explain, so whatever is _not_ least is exactly the part
under test. When a case needs two values to differ — a sort, a reformat, a day against a month — one of them
moves, by one step, in the one part the case reads (`""` against `" "`, the epoch against its next day, month
`13` on the first day rather than a thirteenth month on some other day). Anything further from the least than
the case needs reads as data someone chose, and the reader stops to ask why. The canonical values below are
that rule applied per kind; "Dates and times" is it applied to the one kind with many parts.

## Settled — do not re-propose

- **A typed date or time literal** — `"1970-01-01"`, a `"YYYY-MM-DDTHH:mm:ssZ"` stamp of some real year, `new Date("1970-01-02")`. Each file spells the epoch its own way, and a format read off one string (date-only, seconds, milliseconds, offset) is asserted against another's. The epoch is computed, never typed ("Dates and times").
- **A calendar date from any year but 1970** — a fixture dated the year the test was written, a "recent" date, a date picked for its month name. Only the epoch has a meaning a reader can name; every other date reads as data someone chose, and the reader checks why. A shape test that needs its parts to differ stays in the epoch's own days ("Dates and times").
- **A semantic name for a value the code never reads** — `"room-1"`, `"test-id"`, `"logo.png"`, `"helper.cjs"`, `"nested"`. It reads as meaning something, and the next reader has to check whether it does ("Every string literal passes one of three checks").
- **Prose as a body, title or note** — an invented sentence a human would type. The code matches a substring or stores a blob; the sentence is decoration and is what gets copied into the next suite as if it mattered.
- **A per-file copy of a value production owns** — a sentinel, marker, prefix, filename or sizing formula restated in the suite. It stays green while asserting the wrong thing after the source moves ("Import what production owns").
- **Loosening the assertion because the output is not minimal** — parsing a rendered block to read three attributes out of it, or a `toContain` over a markup string. A static output is `toStrictEqual`ed whole, like a snapshot; when that expectation reads as data someone chose — an anchor carrying padding, a font and a radius the case never reads — the producer is what is over-specified, and it is trimmed to what the behaviour owes (the href, the label, the one colour a constant names) until the whole output is the least value.

## Canonical values

- **Strings**: `""` is the base value, `" "` the different one; `"a"` only where a space trims to `""`. Object keys likewise — never semantic names.
- **Numbers**: integer `0`, decimal `0.1`, negative `-1`, `Number.NaN` as `String(Number.NaN)` where a string is needed. **Booleans** always as the pair `"true"`/`"false"` in one case.
- **Ids**: the nonexistent one is `"-1"` (or `-1` as a number). A real one is `crypto.randomUUID()` at `describe` scope, never a spelled uuid or a `"room-1"`.
- **Entity fields** use the field name as the value: `const name = "name"`.
- **Filesystem names**: `TEST_FILENAME = "a"` and `TEST_DIR = "/a"` from the nearest `constants.test.ts`, for every path a test writes. Extension only where the code under test reads it (`` `${TEST_FILENAME}.cjs` ``); a second coexisting path is the same name nested (`` `${TEST_FILENAME}/${TEST_FILENAME}.ts` ``), and a flat file beside that directory carries an extension because a bare `a` and a directory `a` collide. A real on-disk name production owns (`pnpm-lock.yaml`, `dist/index.js`) stays its real name. A package with no filesystem tests declares neither constant.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal. Idempotency is always `"[functionName] is idempotent"`.

## Dates and times

**Every date is computed from the epoch; none is typed.**

- A `Date` is `new Date(0)`. A later one is the epoch plus a Temporal duration — `new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"))` — never a second literal, and never a raw millisecond count (the `naming` skill, `references/numbers-and-time.md`).
- A string is `.toISOString()` of one of those, so the format is the platform's and identical in every file. A date-only string is `.toISOString().slice(0, 10)` of it, with the `slice` read as "the date part" — a helper the suite declares once when it is used twice.
- Two values that must sort declare both at `describe` scope (`const epoch = new Date(0)`, `const nextDay = …`) and the test reads which is later from the names.
- `Date.now()` in the code under test is pinned, never awaited around: `vi.useFakeTimers({ now: 0 })` in `beforeEach` (the `testing` skill's timers page), so `createdAt` is asserted with `toStrictEqual(new Date(0))` and never `toBeInstanceOf(Date)`, which passes against a value written a day late. The one date a pinned clock does not reach is a column the database defaults (`defaultNow()`): the mock database keeps its own clock, in the host's zone, so that field is asserted against the row read back (`takenAt: resourceVersion.createdAt`) and the object still whole.
- The one exception is a **date the code reads by its shape** — a parser's input, a format table's expected output, a coercion fixture — where the value _is_ the thing under test and a specific calendar date is the point. That value is still one `describe`-scope constant in the epoch's own year, and the test name says what about its shape is being read. **Only the part under test moves, by the smallest step**: a month the calendar lacks is `"1970-13-01"`, not a thirteenth month on some other day; a formatter that must tell day from month and `H` from `h` takes the epoch's second day and first afternoon hour from local parts, every other part zero (`new Date(1970, 0, 2, 13)`); a reformat over data moves its second row one day past the epoch. Never another year, and never a bigger step than the case needs.

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
