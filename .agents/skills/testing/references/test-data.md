# Test data

Read when choosing the values a test asserts on, or when two suites need the same fixture. This page holds the whole rule; `SKILL.md` keeps the structure and assertion rules the data is used under.

## Shared Test Data (DRY)

- **Never repeat a literal or object**: anything used by 2+ tests (or 2+ rows of a bulk insert) is declared **once** at `describe` scope and referenced. Hard rule — but no single-use extraction; a value used once stays inline.
- **Never re-declare what production owns — import it.** A sentinel, cmdline marker, temp-file prefix, cache filename, env-var key or sizing formula the source owns is imported from there, or the copy stays green while asserting the wrong thing after the source changes.
- The shapes that take (base + spread, `create*` envelopes, bulk `.map`), which values stay `let`, and how to export a module-private constant for a test: `references/shared-test-data.md`.

## Canonical Test Values

- Boolean `"true"`/`"false"` (both in one case), integer `"0"`/`0`, decimal `"0.1"`/`0.1`, negative `"-1"`/`-1`, NaN `String(Number.NaN)`, dates `"1970-01-01"` then `"1970-01-02"`.
- Strings: `""` base, `" "` for a different value, `"a"` only when a space trims to `""`. Object keys likewise — never semantic names.
- Nonexistent ID `"-1"` (string) / `-1` (number) — never `"non-existent-id"`. Real IDs are `crypto.randomUUID()` at **describe scope** — never `"room-1"`/`"test-id"`. Other entity fields use the field name as the literal: `const name = "name"`. Filesystem names are the canonical `TEST_FILENAME = "a"` / `TEST_DIR = "/a"` (`references/test-helper-files.md`).
- **Every string literal passes one of three checks or it does not go in**: the value under test, a canonical value above, or an existing `describe`-scope constant/helper in that file. Anything else is decoration the code never inspects — a filename is `"a"`, not `"logo.png"`, with a realistic word only where behaviour reads it (mimetype inference, a parser, trigram ranking). **Prose fails all three**: an invented body, note or title reads as text a human would type, but the code only matches a substring or stores a blob. Reuse the file's message helper for a valid body, and hoist a token with its body: ``const filteredWord = "spam"; const filteredMessage = `<p>${filteredWord}</p>`;``
- **Freeze the clock instead of asserting `toBeInstanceOf(Date)`** — `vi.useFakeTimers({ now: 0 })` plus `expect(row.createdAt).toStrictEqual(new Date(0))`; the instance check only restates the schema's column type and passes against a value written a day late. Works under PGlite/`createMockDb` and the Azure mocks.
- **Date format tests** — `for...of` inside one test over `formatDate(EPOCH_DATE, format)` for every `DateFormat`. Never `test.each`.
- **Descriptions interpolate enum values** — `` `${FooType.Bar}: <plain-English outcome>` ``, never the literal; plain English otherwise ("integer", "epoch date"). Idempotency is always `"[functionName] is idempotent"`, never `"deduplicates …"`/`"does not create duplicate"`/`"skips duplicate"`.
