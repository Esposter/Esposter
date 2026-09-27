---
name: invariants
description: Apply when a fix is an `if` check other call sites will also need, when a bug turns out to be a missing check, when a session writes a throwaway check on its own work, when reviewing a "remember to…" convention, or when deciding whether something belongs in a lint rule. How a rule that must hold in many places is made to hold — construction, then one primitive, then lint, then a test, and a remembered guard last.
---

# Invariants

An invariant is a rule that has to hold everywhere it applies — a response filed under the right key, a date
revived on parse, a write keyed by its target. This skill is about **what makes it hold**, which is a design
question and almost never a diligence question.

## The test

> Could a competent contributor write the wrong version, and would nothing tell them?

If yes, the invariant is not enforced — it is merely documented, and documentation is not a mechanism. The fix
is to change the shape of the thing until the wrong version cannot be written, not to write the rule down more
emphatically.

**A missing check is evidence about the design, not about the author.** When a bug turns out to be "this call
site forgot the guard", the finding is not "add the guard here" — it is "a guard that can be forgotten is the
wrong mechanism". Add it if it unblocks something, then fix the shape in the same change.

## Why a remembered guard is worse than it looks

Two costs, both paid forever:

1. **It is a new pattern.** Every reader now has to learn a rule that exists nowhere in the types and cannot be
   derived from what the code does.
2. **Nobody can tell where it applies.** Across a tree this size, "which of these call sites needs the check"
   is unanswerable without reading all of them — so the honest answer becomes "some of them have it", which is
   indistinguishable from a bug and rots into one.

A third follows: the guard makes the wrong shape _survivable_, so the pressure to fix the shape goes away.

## The ladder

Take the highest rung that fits. Each rung down costs more forever. The decision flow, the worked example and why the order is what it is are `apps/web/content/docs/architecture/enforcement-ladder.md`.

| Rung                | What it means                                                                | Cost to get wrong                  |
| ------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| **By construction** | The wrong call does not typecheck, or cannot be expressed                    | Zero — impossible                  |
| **Structural**      | One primitive does it, and every caller goes through it                      | One review                         |
| **Linted**          | A stock rule, a `no-restricted-syntax` selector or an oxlint plugin fails it | One CI run, and no upkeep          |
| **Tested**          | A unit test on the primitive, or a sweep script, fails on the wrong version  | One CI run, and upkeep as it moves |
| **Remembered**      | A rule in the owning skill and docs page, and a guard each caller writes     | Forever                            |

**Lint before a test.** A lint rule covers every file in the monorepo in one pass, including files that do not exist yet, and needs nothing when the repo changes; a test covers the paths someone wrote it for and moves with them. A test comes second, for what one file's syntax cannot show. Prose comes last, and every rung above it still keeps its why in prose.

**By construction** is usually reached by removing the wrong option rather than adding a right one: make the
dangerous value unobtainable, and every caller has only the safe one left. The idiom that does this most often
here is **an argument that must be named up front** — a function that hands back the writer for a key, so there
is no ambient writer to reach for.

**Structural** is the same idea one level out: the primitive resolves the invariant, callers pass data. If two
stores solve the same problem two ways, neither is structural yet.

**Linted** and **Tested** are where a mechanical rule lands when the shape genuinely cannot express it — `no-restricted-syntax`
in `packages/configuration/eslint/` or an oxlint rule first, and a test that fails on the wrong version where no selector can see it. See the `oxlint` skill ("Which directive to use") for
disable etiquette and the `sweeps` skill (`references/handing-to-an-enforcer.md`) for turning a repeated finding
into an enforcer.

**An enforcer goes with the shape it guarded** — a change that deletes what a lint rule or test guards, or moves it up the ladder, deletes the enforcer in the same change, since every one is paid for on every run (`references/retiring-an-enforcer.md`).

**A check a session writes to verify its own work is an enforcer the repo lacks** — promote it into the repo, extending the enforcer that already owns its class before adding one (`references/scratch-checks.md`).

**Remembered** is a last resort, and it comes with an obligation: one place owns the list of sites it applies to,
and that place is checked by something. A guard with no owner is a bug with a delay.

### A rule written in prose is a rung left on the table

A convention about to be written into a skill is probed against oxlint first — what already fires shrinks the line to the rule's name (`references/probing-for-an-enforcer.md`).

## Prime example — a room-scoped store's writes

Room-scoped Pinia slices are keyed by the room on screen, so `items` and `members` read whichever room that is.
That is what a rendering component wants and exactly what a **write** must never use: a response that lands after
the reader opened another room would be filed under the room they are now looking at.

A remembered version — an `if (checkIsFoo(roomId))` in every callback — ends up present in one store,
absent in its neighbour, with nothing failing — which is the whole argument. The structural version has no check
anywhere: the write functions are reachable only through `getSlice(roomId)` / `getRoomOperationData(roomId)`,
so naming the room is how you obtain a writer at all, and a response cannot be filed anywhere but its own slice.
The convention itself is the `pinia` skill's (`references/keyed-state-and-pagination.md`).

Note what the structural version also bought: a late response now lands in **its own** room's slice, so
re-opening that room shows what was read rather than re-fetching it. The guard could only ever drop the write —
correct, but strictly less than correct-and-useful. A rung up the ladder usually pays twice.

## Where this is not the answer

- **A genuine branch is not a guard.** Two behaviours the domain really has (owner vs member, paused vs active)
  are conditions, not invariants. The tell is whether omitting it is _wrong everywhere_ or _different here_.
- **A validation boundary is meant to be one place.** A Zod schema at the edge is already the structural rung;
  re-checking behind it is the duplication, not the enforcement.

## Reference pages

- `references/scratch-checks.md` — when a session writes a throwaway check on its own work, or is about to keep one.
- `references/retiring-an-enforcer.md` — when a change simplifies, deletes or restructures code, or an enforcer seems to guard something the tree no longer has.
- `references/probing-for-an-enforcer.md` — before writing a convention into a skill: whether oxlint already decides it.
