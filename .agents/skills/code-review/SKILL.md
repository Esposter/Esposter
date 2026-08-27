---
name: code-review
description: The single entry point for every code review — a working diff, a branch, a PR number, or an existing subsystem audited against the docs governing it. Runs entirely in the main session; there is no workflow script and no finder/verifier fan-out. Owns the two lanes a review runs (quality — reuse, simplification, efficiency, altitude; and correctness — defects and broken conventions), the trigger rule that makes an in-thread finding real, the refute-first pass that replaces an independent verifier, how to size the commit window, the written record as tiebreaker, the findings-table report shape, the stop rule for when a round is converged, and the standing rule that `.agents/` stays in every review window so the skill improves itself. Apply on any review or cleanup request, when choosing the scope to review, when deciding whether to run another round, and when applying fixes from one.
---

# Code Review — One Entry Point, One Thread

Every review request — `/code-review`, `/simplify`, "review this", "review PR N", "clean this up", post-merge audits — is answered here, in the main session. **Read the code yourself and report what you find.** There is no workflow script to invoke; `Workflow({ name: "code-review" })` and `Workflow({ scriptPath: ".agents/workflows/code-review.js" })` both name a pipeline that no longer exists.

Never use the `review` skill/command, the built-in `/simplify`, or `mattpocock-skills:code-review` — all answer to "review this", and several overlapping commands is how the shallowest one gets picked.

## Why this runs in-thread

Cost is agents × material read. A cold subagent re-derives a diff the session already holds, so a fan-out pays for the same reading a dozen times over and returns findings whose context died with the agent. The one thing a separate agent genuinely bought was **a verifier that did not raise the claim** — and what made that verifier work was its instructions, not its address. Those instructions are the trigger rule and the refute-first pass below, and they are enforceable here for free.

What you give up in exchange is real and worth naming: the same context that formed a candidate now judges it. The two rules exist to stop that becoming a rubber stamp, and they are not optional.

## The two lanes

| Lane            | Looks for                                                                                                                                                                                                                                                                               | Settled by                   | Severity                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------ |
| **Quality**     | reuse (a helper that already exists), simplification (derivable state, copy-paste variation, dead code), efficiency (repeated I/O, sequential independent work, closures pinning large scopes), altitude (a special case layered on shared infrastructure that should have generalised) | looking at the code it names | always `minor`                 |
| **Correctness** | defects, plus a convention in CLAUDE.md or a skill that the code breaks                                                                                                                                                                                                                 | the trigger rule below       | `critical` / `major` / `minor` |

**Both lanes run by default.** "quality only" (what `/simplify` used to be) or "correctness only" narrows to one. The lanes never merge: a quality finding is a preference with a cost, a correctness finding is a claim that something is wrong.

**Every file in the window is in scope, whatever its extension** — prose included. A docs page, a skill, a ledger, a README, a config file and a migration are each reviewed against the rules that own them, in both lanes: a paragraph restating a rule its owner already states is a quality finding, and a page whose claim the code contradicts is a correctness one. Nothing is skipped for being "not code" except generated output, lockfiles and binaries, which are named as skipped rather than silently dropped.

Never write a finding in either lane for something an enforcer already owns:

| Layer                    | Cost               | Catches                                                                                                            |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| typecheck / lint / tests | ~free              | everything mechanically decidable — never a finding (`feedback_dont_restate_enforced_rules`)                       |
| CodeRabbit on the PR     | free, already runs | a broad unverified sweep; it reasons from names and asserts semantics this repo does not have (`coderabbit` skill) |
| **this skill**           | tens of k          | quality cleanups, and correctness defects this repo's shape makes likely — each carrying its trigger               |

## Load only the rules the window needs

The conventions a finding cites live in the domain skills, not here — restating them would give this page a second copy to drift. What this page owns is the routing: **read the window's file list first, load only the rows it hits.**

| The window contains                  | Load                                                      |
| ------------------------------------ | --------------------------------------------------------- |
| `.vue`, or anything rendering        | `vue`, `vuetify`, `styling`, `responsive`, `ux`           |
| `app/store/**`                       | `pinia`                                                   |
| `app/composables/**`                 | `vue-composable-patterns`, `pagination`                   |
| `server/trpc/**`                     | `trpc`, `error-handling`                                  |
| `packages/db-schema/**`, a migration | `drizzle`                                                 |
| a Zod schema                         | `zod`                                                     |
| `packages/infra/**`                  | `pulumi-infra`                                            |
| `*.test.ts`, `*.bench.ts`            | `testing`, `bench`                                        |
| `content/docs/**`                    | `docs`                                                    |
| `.agents/skills/**`                  | `skill-authoring`                                         |
| `.agents/ledgers/**`                 | `sweeps`                                                  |
| `README.md`                          | `readme-standards`                                        |
| lint or tooling config               | `oxlint`, `package-scripts`                               |
| any file at all                      | `naming`, `typescript`, `formatting`, `file-organization` |

The last row is the floor, not a default — those four apply to every file in every window. A row you loaded and found nothing against is a result; say so rather than omitting it.

## The loop

1. **Scope.** Pick the window — `modes/diff.md` for a change, `modes/area.md` for a subsystem with no change. Do this before reading anything: a window chosen afterwards is the window that flatters what you already read.
2. **Read.** The diff, plus every file it touches, plus one hop out of anything load-bearing (the caller, the callee, the primitive it wraps). Generated files, lockfiles and binaries are skipped — **say so**, because "no finding against the snapshot" must never read as "the snapshot is clean".
3. **Find, per lane.** Quality candidates and correctness candidates, kept apart.
4. **Refute, then report.** Every correctness candidate goes through both rules below. Quality candidates skip this — they are settled by the code they name.
5. **Report** the table (`references/reporting.md`), then fix (`fixing-findings.md`), then check and commit.

### The trigger rule

**A correctness finding is not reportable until you have written the concrete trigger** — specific inputs or state, leading to the specific wrong output, crash, or corrupted row — **and opened at least one file the claim depends on that you had not already read when you formed it.**

If you cannot construct the trigger, it is not a finding; it is a feeling about the code, and it belongs in the quality lane or nowhere. If the file you open refutes it, delete it and do not report the near-miss.

The hops that settle almost everything, cheapest first: one step out to the caller or callee; the dependency's **real source in `node_modules`**, never its reputation; `git log -S <symbol>` or `git log -L <range>:<file>` for "was this guard ever here"; the written record below.

### Refute first

For each correctness candidate, **spend the first pass trying to break it, not to confirm it.** Ask what would have to be true for the code to be right, and go look for that. A candidate you only ever tried to confirm has not been verified, however confident the wording.

This is the whole of what the independent verifier used to do, and it fails the same way when skipped: the finding is plausible, well-argued, and wrong.

**Nothing unsettled ships.** There is no PLAUSIBLE disposition — a candidate is confirmed with its trigger, refuted, or deleted. The one exception is a trigger that genuinely cannot be settled from the repository (a production-only config value, a cloud service's runtime behaviour). That never becomes a table row: write it as a single line below the table naming the blocker and the fact that would settle it, so the user is asked for evidence rather than handed a verdict nobody reached.

## The written record wins — never re-litigate a settled decision

The dominant false-positive class is a finding arguing against a decision already made and written down: a tightened retry policy, an ingestion cap, a best-effort publish that swallows its error. From the diff alone the argument always sounds right, and it returns every round with a different answer.

`packages/app/content/docs/`, `.agents/skills/**/*.md` and `.agents/ledgers/**/*.md` are the tiebreaker — the whole skill tree, not the index pages alone, and a ledger's **Exclusions** section exists precisely to stop a unit being re-litigated: a binding rule as often sits in a skill's `references/*.md` deep dive as in its `SKILL.md`. A choice either tree states deliberately, with its consequence acknowledged, is settled — not a finding. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing, or when the change ships behaviour the record does not cover.

Grep all three trees before reporting a finding that argues with a decision. A genuinely undocumented decision that keeps drawing fire is closed by writing the page (`docs` skill), not by arguing it again. A record invalidated by materially new evidence (an advisory, a changed dependency contract) reopens the decision — update the page first, then fix the code against the new record.

## Reporting — `references/reporting.md`

**Show the user every finding, as one compact table and nothing per-finding beyond it.** Never jump to fixes and report only what changed — the visible findings list is the deliverable. Emit the table **flush-left at the top level** of the message, never indented or nested in a list, blockquote or code fence: an indented table degrades into dot points, which is the failure this format exists to prevent.

## The stop rule

**A round whose confirmed findings are all `minor` is converged.** Fix them if cheap, then stop — minor supply is effectively unbounded on any mature file, so "the round reported something" is a loop with no exit.

Another round is justified by a confirmed `critical`/`major`, or by a fix round that touched lines an earlier fix wrote. Re-reading the same window at the same depth to resample the same ranking is not: go one hop further out instead, or narrow the window so the reading is deeper per file.

Deliberately **not** measured here: candidate counts, per-lens ceilings, token estimates. Nothing publishes them any more, and a prose number with no way to fail is one that fails silently and forever (`fixing-findings.md`, "Restated a number the code could publish").

## Then: fix, verify, commit

1. Verify each finding against current HEAD before fixing — post-merge findings can be stale — and check it against the written record above.
2. Fix confirmed findings.
3. Run **`fixing-findings.md`** over your own fixes before verifying — it owns the regression checklist and the order of work (root cause → converge the call sites → docs and skills → then one check pass), and it is the block to paste into a delegated fix round.
4. Verify with the full sequence — `pnpm format` → `typecheck` → `lint:fix` → tests over the paths touched (`package-scripts`) — then commit per the `git` skill. Before pushing to a branch with an open PR, check CodeRabbit state (`coderabbit` skill).

## The skill improves itself

**`.agents/` is never excluded from a review window**, however tooling-shaped the window looks. This tree is edited nearly every round, and reviewing its own last round's edits is how the review compounds instead of drifting. Never put `.agents/` in a target string's exclusions and never pick a window that stops short of it. Findings against it are ordinary findings — same table, same rules, no special casing.

The meta pass is one question, asked once per round after the findings table: **what did this round's own evidence say about these instructions?**

| Evidence                                                                      | What it says                                     | The change that ends it                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| You settled a finding by hand and the hop was cheap                           | the trigger rule is missing that hop             | name the hop in "The trigger rule"                              |
| The same false-positive class returns across rounds                           | the bar is too low, or the decision is unwritten | raise the materiality bar, or write the doc page (`docs` skill) |
| A real defect escaped and surfaced later (CodeRabbit, next round, prod)       | a lens does not exist                            | add it to the lane table                                        |
| A `regression` or `reopened` finding matches no entry in `fixing-findings.md` | the cause is unrecorded and will be re-shipped   | append it there in the same round                               |

**A round that changes nothing about this skill is a valid outcome** — inventing an edit to have made one is the failure this section exists to avoid.
