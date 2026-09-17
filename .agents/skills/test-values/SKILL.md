---
name: test-values
description: Apply when writing or reviewing any literal, fixture, id, date, path or helper argument in a .test.ts, .test-d.ts or .bench.ts file. Esposter test values — every literal the least value that still distinguishes what the test reads, one canonical literal per kind ("" and " ", 0 / 0.1 / -1, the nonexistent id -1, crypto.randomUUID(), a field's own name as its value, TEST_FILENAME / TEST_DIR), every date computed from the epoch and never typed, the three checks a string literal passes, and shared data declared once with what production owns imported.
---

# Test Values

The values a test writes. The `testing` skill owns the suite's structure, assertions and mocking; this skill owns
every literal in it, because a value chosen per file is the thing that drifts — one suite's typed calendar date
beside another's typed epoch beside a third's `new Date()` — and the drift is what makes a reviewer stop to ask
whether the value means something. A canonical value means nothing, and says so.

## Settled — do not re-propose

- **A typed date or time literal** — `"1970-01-01"`, a `"YYYY-MM-DDTHH:mm:ssZ"` stamp of some real year, `new Date("1970-01-02")`. Each file spells the epoch its own way, and a format read off one string (date-only, seconds, milliseconds, offset) is asserted against another's. The epoch is computed, never typed ("Dates and times").
- **A calendar date from any year but 1970** — a fixture dated the year the test was written, a "recent" date, a date picked for its month name. Only the epoch has a meaning a reader can name; every other date reads as data someone chose, and the reader checks why. A shape test that needs its parts to differ stays in the epoch's own days ("Dates and times").
- **A semantic name for a value the code never reads** — `"room-1"`, `"test-id"`, `"logo.png"`, `"helper.cjs"`, `"nested"`. It reads as meaning something, and the next reader has to check whether it does ("Every string literal passes one of three checks").
- **Prose as a body, title or note** — an invented sentence a human would type. The code matches a substring or stores a blob; the sentence is decoration and is what gets copied into the next suite as if it mattered.
- **A per-file copy of a value production owns** — a sentinel, marker, prefix, filename or sizing formula restated in the suite. It stays green while asserting the wrong thing after the source moves ("Import what production owns").
- **A realistic corpus of exported artifacts** — a folder of real maps, captured payloads or documents, one fixture per production case. Realism is not coverage: such a corpus carries a handful of distinguishable shapes between all its files, so nearly every one of them re-parses the branches an earlier one already reached, and the corpus and its committed snapshots cost orders of magnitude more repository and runtime than the shapes do ("Fixture corpora").
- **Loosening the assertion because the output is not minimal** — parsing a rendered block to read three attributes out of it, or a `toContain` over a markup string. A static output is `toStrictEqual`ed whole, like a snapshot; when that expectation reads as data someone chose — an anchor carrying padding, a font and a radius the case never reads — the producer is what is over-specified, and it is trimmed to what the behaviour owes (the href, the label, the one colour a constant names) until the whole output is the least value.

## The goal: the least value that still distinguishes

Every value a test writes is the least one that tells apart what the test reads, and nothing more. That is the
whole reason `""` comes before `" "`, `0` before `1`, the epoch before any other instant, and `"a"` before a
word: the least value carries no part the reader has to explain, so whatever is _not_ least is exactly the part
under test. When a case needs two values to differ — a sort, a reformat, a day against a month — one of them
moves, by one step, in the one part the case reads (`""` against `" "`, the epoch against its next day, month
`13` on the first day rather than a thirteenth month on some other day). Anything further from the least than
the case needs reads as data someone chose, and the reader stops to ask why. The canonical values below are
that rule applied per kind; "Dates and times" is it applied to the one kind with many parts.

## Canonical values

- **Strings**: `""` is the base value, `" "` the different one; `"a"` only where a space trims to `""`. Object keys likewise — never semantic names.
- **Numbers**: integer `0`, decimal `0.1`, negative `-1`, `Number.NaN` as `String(Number.NaN)` where a string is needed. **Booleans** always as the pair `"true"`/`"false"` in one case.
- **Ids**: the nonexistent one is `"-1"` (or `-1` as a number). A real one is `crypto.randomUUID()`, never a spelled uuid or a `"room-1"`; it is a `describe`-scope `const` once a second line reads it, and stays inline where only one does ("Shared data").
- **Entity fields** use the field name as the value: `const name = "name"`.
- **Filesystem names**: `TEST_FILENAME = "a"` and `TEST_DIR = "/a"` from the nearest `constants.test.ts`, for every path a test writes. Extension only where the code under test reads it (`` `${TEST_FILENAME}.cjs` ``); a second coexisting path is the same name nested (`` `${TEST_FILENAME}/${TEST_FILENAME}.ts` ``), and a flat file beside that directory carries an extension because a bare `a` and a directory `a` collide. A real on-disk name production owns (`pnpm-lock.yaml`, `dist/index.js`) stays its real name. A package with no filesystem tests declares neither constant.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal. Idempotency is always `"[functionName] is idempotent"`.

## Fixture corpora

A corpus of files — maps, payloads, documents — is the same rule applied to a folder: **one file per shape the code
under test can tell apart**, and each file the least content that carries its shape. The shape is what the parser
branches on and what the assertion reads (an element, an attribute, a value it switches on, the _absence_ of one);
everything else is another copy of a case already there. Name each file after the shape it carries
(`emptyObjectLayer.tmx`), not after where it came from, so a reader knows what deleting it would lose, and
canonicalize the values inside it like any other literal — a name the code never reads is `""`, a number it never
reads is `0`, and only what the code branches on keeps a real value.

Prove it rather than eyeballing it: take the union of (parent element, element, attribute, branched-on value) over
the old corpus and over the new one, and keep the trim only when nothing is lost and nothing is invented. The parent
is in the record because a relationship is a branch too — a node the code reaches only by recursing into its
container is a different shape from the same node at the top level — and a flat vocabulary reads the two as one.

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
