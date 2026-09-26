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

- **A typed date or time literal** — `"1970-01-01"`, a `"YYYY-MM-DDTHH:mm:ssZ"` stamp of some real year, `new Date("1970-01-02")`. Each file spells the epoch its own way, and a format read off one string (date-only, seconds, milliseconds, offset) is asserted against another's. The epoch is computed, never typed (`references/dates-and-times.md`).
- **Exporting the epoch from `@esposter/shared`.** `new Date(0)` and `Temporal.Instant.fromEpochMilliseconds(0)` are already the computed spelling, and the one verbose one — the plain date — is read by `genshin-persona` alone, which a workspace import cannot reach (its plugin cache runs a frozen `npm ci`; `apps/web/content/docs/infra/claude-interface/persona-plugin.md`). An export no reachable package names is what `scripts/src/workspace/sharedExportConsumers.test.ts` reports, so each package that reads a plain-date epoch declares it once (`references/dates-and-times.md`); two reachable packages doing so is the trigger to hoist it.
- **A calendar date from any year but 1970** — a fixture dated the year the test was written, a "recent" date, a date picked for its month name. Only the epoch has a meaning a reader can name; every other date reads as data someone chose, and the reader checks why. A shape test that needs its parts to differ stays in the epoch's own days (`references/dates-and-times.md`).
- **A semantic name for a value the code never reads** — `"room-1"`, `"test-id"`, `"logo.png"`, `"helper.cjs"`, `"nested"`. It reads as meaning something, and the next reader has to check whether it does ("Every string literal passes one of three checks", below).
- **Prose as a body, title or note** — an invented sentence a human would type. The code matches a substring or stores a blob; the sentence is decoration and is what gets copied into the next suite as if it mattered.
- **A per-file copy of a value production owns** — a sentinel, marker, prefix, filename or sizing formula restated in the suite. It stays green while asserting the wrong thing after the source moves (`references/shared-data.md`).
- **A realistic corpus of exported artifacts** — a folder of real maps, captured payloads or documents, one fixture per production case. Realism is not coverage: such a corpus carries a handful of distinguishable shapes between all its files, so nearly every one of them re-parses the branches an earlier one already reached, and the corpus and its committed snapshots cost orders of magnitude more repository and runtime than the shapes do (`references/fixture-corpora.md`).
- **A lint rule for a mocked error's message.** Two rejections a case tells apart are `"a"` and `"b"`, `unicorn/error-message` already owns the empty one, and a message the code classifies keeps the shape it reads, so what makes a message prose is a judgement about the case rather than a shape of the literal — the `test-values` sweep reads it (`references/canonical-values.md`).
- **Loosening the assertion because the output is not minimal** — parsing a rendered block to read three attributes out of it, or a `toContain` over a markup string. A static output is `toStrictEqual`ed whole, like a snapshot; when that expectation reads as data someone chose — an anchor carrying padding, a font and a radius the case never reads — the producer is what is over-specified, and it is trimmed to what the behaviour owes (the href, the label, the one colour a constant names) until the whole output is the least value.

## The goal: the least value that still distinguishes

Every value a test writes is the least one that tells apart what the test reads; when a case needs two to differ, one moves by one step in the one part the case reads, and a value whose source is under test keeps a decoy one step away (`references/least-value.md`).

## Canonical values

- **Strings** `""`, then `" "`; `"a"` only where a space trims away. **Numbers** `0`, `0.1`, `-1`. **Booleans** as the pair `"true"`/`"false"`.
- **Ids**: the nonexistent one is `"-1"`, a real one `crypto.randomUUID()`. **Entity fields** take the field's name as the value.
- **Paths** are `TEST_FILENAME` / `TEST_DIR` from the nearest `constants.test.ts`; **a mock's error** is `new Error(" ")`; **a value a parser reads by shape** stays whole with its skipped parts canonical.
- Each kind in full, with the exceptions: `references/canonical-values.md`.

## Fixture corpora

One file per shape the code under test can tell apart, each the least content that carries it, named after its shape (`references/fixture-corpora.md`).

## Dates and times

**Every date is computed from the epoch; none is typed** — `new Date(0)`, a later one the epoch plus a Temporal duration, the clock pinned with `vi.useFakeTimers({ now: 0 })`. The typed half is `test-values/no-typed-date`; every form and the shape exception are `references/dates-and-times.md`.

## Every string literal passes one of three checks

It is the value under test, or a canonical value, or an existing `describe`-scope constant or helper in the
file. Anything else is decoration the code never inspects and does not go in. A token the code does inspect is
hoisted with its body so the two cannot drift: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``.

## Shared data — declare once, import what production owns

- **Never repeat a literal or object** — two readers make it one `describe`-scope `const`; a value used once stays inline.
- **Import what production owns** — a sentinel, marker, prefix, filename or formula the source declares is imported, never mirrored.
- **Grep before adding a fixture**: a literal a sibling uses inline is an undeclared constant.
- `base*` plus spread for near-identical objects, `create*` helpers for envelopes and entities, and per-test state as a `let` set in `beforeEach`: `references/shared-data.md`.

## Reference pages

- `references/least-value.md` — when a case needs two values to differ, or a value seems to need more than the canonical one.
- `references/canonical-values.md` — when a literal's canonical form is not settled by the one-line list: paths, thrown errors, parsed values, padded streams, descriptions.
- `references/fixture-corpora.md` — when a suite reads a folder of fixture files, or a corpus is being trimmed.
- `references/dates-and-times.md` — when a test writes a `Date`, a `Temporal` value or a date string, or the code reads the clock.
- `references/shared-data.md` — when a value is shared between tests, a fixture helper is built, or production already declares the value.
