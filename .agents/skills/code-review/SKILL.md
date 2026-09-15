---
name: code-review
description: Apply when handed any review or cleanup request, when choosing the scope to review, when deciding whether to run another round, and when applying fixes from one. The single entry point for every code review — a working diff, a branch, a PR number, or a subsystem audited against the docs governing it — run in the main session with no workflow script and no finder/verifier fan-out, in two lanes (quality and correctness), every correctness finding carrying its trigger, the written record as tiebreaker, and one findings table as the report.
---

# Code Review — One Entry Point, One Thread

Every review request — `/code-review`, `/simplify`, "review this", "review PR N", "clean this up", post-merge audits — is answered here, in the main session. **Read the code yourself and report what you find.** There is no workflow script to invoke — not the built-in `Workflow({ name: "code-review" })`, and no workflows directory under `.agents/`.

Never use the built-in `/review` command, the built-in `/simplify`, or a plugin skill named `code-review` — all answer to "review this", and several overlapping commands is how the shallowest one gets picked.

## Settled — do not re-propose

- **Fanning a review out to finder and verifier agents, or a workflow script.** Cost is agents × material read: a cold subagent re-derives a diff the session already holds, and returns findings whose context died with it. The one thing a separate verifier bought — a judge that did not raise the claim — was its instructions, not its address, and those are the trigger rule and the refute-first pass below, enforced here for free. The price is that the same context that formed a candidate now judges it, which is exactly what those two rules exist to stop, and they are not optional.
- **Measuring candidate counts, per-lens ceilings or token estimates.** Nothing publishes them, and a prose number with no way to fail is one that fails silently and forever (`references/fixing-findings.md`, "Restated a number the code could publish").

## The two lanes

| Lane            | Looks for                                                                                                                                                                                                                                                                               | Settled by                   | Severity                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------ |
| **Quality**     | reuse (a helper that already exists), simplification (derivable state, copy-paste variation, dead code), efficiency (repeated I/O, sequential independent work, closures pinning large scopes), altitude (a special case layered on shared infrastructure that should have generalised) | looking at the code it names | always `minor`                 |
| **Correctness** | defects, plus a convention in CLAUDE.md or a skill that the code breaks                                                                                                                                                                                                                 | the trigger rule below       | `critical` / `major` / `minor` |

**Both lanes run by default.** "quality only" (what `/simplify` used to be) or "correctness only" narrows to one. The lanes never merge: a quality finding is a preference with a cost, a correctness finding is a claim that something is wrong.

**Every file in the window is in scope, whatever its extension** — prose included. A docs page, a skill, a ledger, a README, a config file and a migration are each reviewed against the rules that own them, in both lanes: a paragraph restating a rule its owner already states is a quality finding, and a page whose claim the code contradicts is a correctness one. Nothing is skipped for being "not code" except generated output, lockfiles and binaries, which are named as skipped rather than silently dropped.

**Never write a finding in either lane for something an enforcer already owns.** Typecheck, lint and the suites decide everything mechanically decidable and fail the build on it (`skill-authoring`, "Don't restate what an enforcer already checks"), and CodeRabbit already sweeps every pull request broadly and unverified, reasoning from names and asserting semantics this repo does not have (`coderabbit`). What is left to this skill is the quality cleanups nothing mechanical can see and the correctness defects this repo's shape makes likely — which is why every one of the latter carries its trigger.

## Load only the rules the window needs

The conventions a finding cites live in the domain skills, not here — restating them would give this page a second copy to drift. What this page owns is the routing: **read the window's file list first, load only the rows it hits.**

| The window contains                      | Load                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `.vue`, or anything rendering            | `vue`, `vuetify`, `styling`, `responsive`, `ux`                                            |
| `app/store/**`                           | `pinia`                                                                                    |
| `app/composables/**`                     | `vue-composable-patterns`, `pagination`                                                    |
| `server/trpc/**`                         | `trpc`, `error-handling`                                                                   |
| `packages/db-schema/**`, a migration     | `drizzle`                                                                                  |
| a Zod schema                             | `zod`                                                                                      |
| `apps/infra/**`                          | `pulumi-infra`                                                                             |
| `*.test.ts`, `*.test-d.ts`, `*.bench.ts` | `testing`, `test-values`, `bench`                                                          |
| `content/docs/**`                        | `docs`                                                                                     |
| `.agents/skills/**`                      | `skill-authoring`                                                                          |
| `.agents/ledgers/**`                     | `sweeps`                                                                                   |
| `README.md`                              | `readme-standards`                                                                         |
| lint or tooling config                   | `oxlint`, `package-scripts`                                                                |
| any file at all                          | `naming`, `typescript`, `formatting`, `file-organization`, `over-engineering`, `fallacies` |

The last row is the floor, not a default — those six apply to every file in every window. A row you loaded and found nothing against is a result; say so rather than omitting it.

## The loop

1. **Scope.** Pick the window — `references/diff-window.md` for a change, `references/area-window.md` for a subsystem with no change. Do this before reading anything: a window chosen afterwards is the window that flatters what you already read.
2. **Read.** The diff, plus every file it touches, plus one hop out of anything load-bearing (the caller, the callee, the primitive it wraps). Generated files, lockfiles and binaries are skipped — **say so**, because "no finding against the snapshot" must never read as "the snapshot is clean".
3. **Find, per lane.** Quality candidates and correctness candidates, kept apart.
4. **Refute, then report.** Every correctness candidate goes through both rules below. Quality candidates skip this — they are settled by the code they name.
5. **Report** the table (`references/reporting.md`), then fix (`references/fixing-findings.md`), then check and commit.

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

**Grep `apps/web/content/docs/`, `.agents/skills/**/*.md` and `.agents/ledgers/**/*.md` before reporting one.** What counts as the record — the deep dives and a comment beside the line included — when a settled decision is a finding again, and how one is overturned so the old direction does not stand beside the new one: `references/written-record.md`.

## Reporting — `references/reporting.md`

**Show the user every finding, as one compact table and nothing per-finding beyond it.** Never jump to fixes and report only what changed — the visible findings list is the deliverable. Emit the table **flush-left at the top level** of the message, never indented or nested in a list, blockquote or code fence: an indented table degrades into dot points, which is the failure this format exists to prevent.

## After the table — `references/fixing-findings.md`

**Deciding whether another round is owed, and applying the fixes**, is that page: the stop rule that makes an all-`minor` round converged, the verify-fix-check-commit sequence, the order of work (root cause → converge the call sites → docs and skills → then one check pass), and the regression checklist that is the block to paste into a delegated fix round.

## The skill improves itself

**`.agents/` is never excluded from a review window**, however tooling-shaped the window looks. This tree is edited nearly every round, and reviewing its own last round's edits is how the review compounds instead of drifting. Never put `.agents/` in a target string's exclusions and never pick a window that stops short of it. Findings against it are ordinary findings — same table, same rules, no special casing.

The meta pass is one question, asked once per round after the findings table — **what did this round's own evidence say about these instructions?** — and the four kinds of evidence that change this skill are `references/meta-pass.md`. **A round that changes nothing about this skill is a valid outcome** — inventing an edit to have made one is the failure this section exists to avoid.
