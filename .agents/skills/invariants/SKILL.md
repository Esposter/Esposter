---
name: invariants
description: How a rule that must hold in many places is made to hold — by construction (the wrong call cannot be written), then structurally (one primitive does it for every caller), then by an enforcer (lint rule or test), and only as a last resort by a guard a caller has to remember. Apply when a fix is an `if` check that other call sites will also need, when a bug turns out to be a missing check, when reviewing a "remember to…" convention, or when deciding whether something belongs in a lint rule.
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

Take the highest rung that fits. Each rung down costs more forever.

| Rung                | What it means                                                      | Cost to get wrong |
| ------------------- | ------------------------------------------------------------------ | ----------------- |
| **By construction** | The wrong call does not typecheck, or cannot be expressed          | Zero — impossible |
| **Structural**      | One primitive does it, and every caller goes through it            | One review        |
| **Enforced**        | A lint rule, a type-level ban or a test fails on the wrong version | One CI run        |
| **Remembered**      | A guard each caller writes                                         | Forever           |

**By construction** is usually reached by removing the wrong option rather than adding a right one: make the
dangerous value unobtainable, and every caller has only the safe one left. The idiom that does this most often
here is **an argument that must be named up front** — a function that hands back the writer for a key, so there
is no ambient writer to reach for.

**Structural** is the same idea one level out: the primitive resolves the invariant, callers pass data. If two
stores solve the same problem two ways, neither is structural yet.

**Enforced** is where a mechanical rule lands when the shape genuinely cannot express it — `no-restricted-syntax`
in `packages/configuration/eslint/`, an oxlint rule, or a test that fails on the wrong version. See `oxlint` for
disable etiquette and `sweeps` for turning a repeated finding into an enforcer.

**Remembered** is a last resort, and it comes with an obligation: one place owns the list of sites it applies to,
and that place is checked by something. A guard with no owner is a bug with a delay.

### A rule written in prose is a rung left on the table

Before a convention is written into a skill, find out whether something already decides it — oxlint ships ~500
rules and the repo enables a broad plugin set with every category at `error`, so a surprising share of what reads like a
review convention is already a build failure. Probe rather than assume: a throwaway file in the tree, run
`pnpm exec oxlint --format=default --disable-nested-config <path>`, and read what fires.

Both answers are worth having. If it fires, the skill line shrinks to the rule's name and stops being a second
source of truth that can drift from the build. If it does not, the question becomes whether a selector could —
and a `no-restricted-syntax` entry with a message is a better home for the rule than a bullet nobody re-reads.

The line a skill keeps either way is the part no rule can state: **why**, and which shapes are the exceptions.
A disable comment then has something to name.

## Prime example — a room-scoped store's writes

Room-scoped Pinia slices are keyed by the room on screen, so `items` and `members` read whichever room that is.
That is what a rendering component wants and exactly what a **write** must never use: a response that lands after
the reader opened another room would be filed under the room they are now looking at.

The remembered version was `if (checkIsRoomScoped(roomId))` in every callback. It was present in one store,
absent in its neighbour, and nothing failed — which is the whole argument. The structural version has no check
anywhere: the write functions are reachable only through `getSlice(roomId)` / `getRoomOperationData(roomId)`,
so naming the room is how you obtain a writer at all, and a response cannot be filed anywhere but its own slice.
The convention itself lives in `pinia`.

Note what the structural version also bought: a late response now lands in **its own** room's slice, so
re-opening that room shows what was read rather than re-fetching it. The guard could only ever drop the write —
correct, but strictly less than correct-and-useful. A rung up the ladder usually pays twice.

## Where this is not the answer

- **A genuine branch is not a guard.** Two behaviours the domain really has (owner vs member, paused vs active)
  are conditions, not invariants. The tell is whether omitting it is _wrong everywhere_ or _different here_.
- **A validation boundary is meant to be one place.** A Zod schema at the edge is already the structural rung;
  re-checking behind it is the duplication, not the enforcement.
