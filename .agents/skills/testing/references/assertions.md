# Assertions

Read when writing the `expect` calls of a test — which matcher, how much of the value, and the forms lint refuses. The one-line rules are in `SKILL.md`; this page is their full statement.

## A void return

- **A `void` return is never assigned or asserted at runtime** (`no-confusing-void-expression`, caught by the **root** `pnpm lint` alone since `apps/web`'s ESLint isn't type-aware; never disabled). A `Promise<void>`: `await fn();` bare when another assertion follows, else `await expect(fn()).resolves.toBeUndefined();`. One resolving to a **real value** goes into a `const`; a sync `void` contract is asserted in a `.test-d.ts` (`references/test-helper-files.md`).

## `toStrictEqual`

- **`toStrictEqual` always** — `toEqual`, `toMatchObject` and `expect.objectContaining` pass while the fields you did not name drift, and lint refuses all three (`vitest/prefer-strict-equal`, `vitest/no-restricted-matchers`, `no-restricted-properties`); assert each field the test is about, or the whole value. `expect.arrayContaining` is the one with a real use — a genuine superset, where the extra elements are not the test's business — but never for an **argv or an ordered sequence**: it checks each element independently, so a run of flags passes it while scattered across the array and paired with the wrong values, which for an argv is the whole meaning. Snapshot the array instead; the snapshot then subsumes the `indexOf` ordering assertions written to shore the fragment up, and the comment saying why the order matters is what survives. Assert exact counts: no `.toBeGreaterThan(0)` on collections. The one carve-out is a **counter aggregated over machinery the test is not about** — a per-finder tally, a count of a stats object's own fields — where the exact number is that machinery's size and pinning it breaks on a change with nothing to do with the behaviour under test. There the assertion is that the counter moved, and it says so in a comment.

## The whole value

- **Never fragment-match a deterministic output** — assert the whole value with `.toBe(fullValue)`, inlined in the `expect` call rather than an intermediate `const expected*`; `toMatchInlineSnapshot()` (empty, filled with `pnpm test -u`) when it is bulky or multiline. A full snapshot **subsumes** paired negative assertions, so drop the `.not.toContain(...)`. `.toContain`/`.toMatch` survive only for genuine membership on non-deterministic content — a value the test cannot know at all. **A runtime value the test holds is not that**: a SHA it committed, an id it created or read back, a path it made is interpolated into the whole value, and a mock handed a composed text (a prompt, a message) is asserted by its whole call, `toHaveBeenCalledExactlyOnceWith` with the pure builder called on the inputs the test holds — the builder's own test pins the text, this one pins that those inputs reach it; output embedding a machine-specific path isn't snapshot-safe — fragment-match or assert behaviour portably. **Picking one element out of a knowable sequence is a fragment too** — `.at(-1)` or `[0]` on a component's `emitted(...)`, a mock's `calls` or a list: assert the whole sequence with `toStrictEqual`. Not knowing what it holds is a reason to run the test and pin what it prints, never to sample it.

## Call assertions

- **Once + args → `toHaveBeenCalledExactlyOnceWith(...)`**, also with no args. **the jest-extended once-with matcher is BANNED** — Vitest does not ship it, so it fails typecheck. Where it doesn't fit: `toHaveBeenCalledTimes(1)` + `toHaveBeenCalledWith(...)`.
