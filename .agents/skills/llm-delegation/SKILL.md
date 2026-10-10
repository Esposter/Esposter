---
name: llm-delegation
description: Apply when deciding whether work runs in the main session or a subagent, which model family a subagent runs on, when writing a delegation prompt or running a parallel batch, and when a step in a script, a workflow or a CI job needs a judgement rather than a computation. Esposter delegation — who answers or runs each piece of work at the cheapest tier that can: the main session on opus thinks and does the judged work, a haiku subagent does everything whose judgement calls are resolved, and in automation deterministic code, a Jev typed decision or a headless session answers.
---

# LLM Delegation — The Cheapest Thing That Can Answer

The scarce resource is one shared Claude Code account limit. The main session, every subagent and every headless session the collector spawns draw on the same window (`apps/web/content/docs/infra/review-collector/drain.md`), and the window weighs a token by the family that spent it. Work moved down a tier is not a saving on a bill: it is a window a session can still run in.

## Settled — do not re-propose

- **Jev for an authoring step.** It returns typed decisions, never text, so a conflict resolved, a fix written, a commit split or a file edited is a session's work however mechanical it looks. Jev decides _whether_ and _which_; it never produces the artefact.
- **A frontier text model as the cheap classification tier** — a small model prompted to "reply with one word". It samples text, so it can emit a value outside the set, and it then owes a parse, a validator and a retry path; a typed decision cannot leave its own domain and needs none of them.
- **A subagent with no `model`.** It inherits the main session's family, so a lookup is priced at the thinker's rate and also re-read in the main context — the one delegation that costs more than doing the work in place.
- **Naming a model version where it chooses what runs** — in a skill, a doc, a workflow script, a delegation prompt or `SessionRoleModelMap`. Families ship new versions every few weeks and the project always wants the latest, so only the unversioned alias (`haiku`, `opus`) is written. A record of which model _did_ something keeps its version — a proposal's `model:` (the `docs` skill, `references/page-frontmatter.md`), a ledger's `Swept` cell written from the trailers.

## In a session — the main session thinks, subagents run

The split is by the work, and each kind of work has a family. Every `Agent` call passes `model`, and runs in the background so the main session keeps working beside it; the one headless exception is below.

There are two tiers and no middle one: `opus` thinks, `haiku` runs.

| Work                                                                                                                                                                                                                                                                                                                                                                                                            | Runs in                                            |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| A spec, a proposal, a design decision, triage, naming, a review's verdict, the calls an implementation needs, anything settled by taste or by the user's ear or eye                                                                                                                                                                                                                                             | the main session, on `opus`                        |
| An implementation once its calls are written into its prompt, which is nearly every implementation; a written spec whose judgement calls are resolved; a delegated fix round with the `code-review` skill's checklist; a lookup or map across files a grep cannot narrow; a mechanical edit with an exact map or a find recipe; a long command run and its numbers read back; a CI log read to its failing line | a `haiku` subagent (`Explore` for a read-only one) |

- **Work too judged for haiku is the main session's.** An `opus` subagent buys only wall-clock — the same family re-reading what the session knows — so it runs only a written spec beside other main-session work, never a lookup.

- **A question escalates; it never descends.** A haiku agent settles a call that the existing code or a public source answers, and writes it where its unit records decisions. A call settled by taste, money, licensing or the user's eyes or ears it reports with the evidence, building everything around it; the main session decides, and sends the decided work back down. A spec haiku cannot carry is a spec with a call still open, and the fix is the spec, not a costlier agent. A prompt that leaves a judgement to the lower tier has delegated the thinking.
- **The main session reads one hop deep.** One read of a file it can already name, or one grep whose output mode is the answer, stays in place. A lookup that needs a second hop — find the file, then read it, then follow what it names — is a chain, and the chain goes to a `haiku` agent as one question with a bounded answer before its second call. The tell is two lookups in a row with no decision between them. A log, a dump, a shader or a long run's output is a haiku read whatever its hop count, since only its conclusion reaches a decision.
- **The report is the only thing the main context pays for.** The prompt fixes its shape and its bound — paths with line numbers, the numbers measured, an error verbatim — and never asks for file contents back. The session verifies a writing agent by its diff and its done-definition, never by re-reading the files it changed.
- **A `fork` ignores `model`** and runs on the main session's family with the whole conversation; it is for work that needs the conversation, priced as the main session.
- **A workflow's `agent()` passes `model` just as an `Agent` call does.** One left to inherit runs on the session's `opus`. When the plan's weekly limit last ran out, the workflow agents that inherited `opus` had spent about three quarters of that week's usage. Past a usage line the `genshin-mods` reserve refuses the launch outright (the throughput skill's "The usage reserve").
- **An agent's price is its turns times its context.** Every turn re-reads the whole cached context, so cached reads, not output, are most of the bill: in that week the average agent turn re-read over 200K tokens. A unit is scoped to finish in a short context, its prompt names the pages to read rather than whole skills to load, and a unit that would run long is split into agents that each start clean. (`pnpm ai:usage` tallies it by bucket and family)

## A reading pass is delegated by who decides the edit

A pass over a whole tree goes to haiku when a find recipe or a pattern decides every edit, and stays in the main session when reading decides it (`references/reading-passes.md`).

## Writing the delegation prompt

The prompt is the agent's whole world: the spec with its judgement calls resolved, the skills it must load, a done-definition it can prove, git discipline, and a report-back contract with a length bound (`references/delegation-prompt.md`).

## While agents run

A batch runs in the shared checkout on `ai/queue`, never a worktree: each agent commits its own paths, shared files are edited by whoever needs them, an agent checks only the packages it touched and never the app, and one agent runs and fixes the batch's remaining checks once every agent has reported (`references/running-agents.md`).

## In automation — the tiers

| Tier                 | Answers                                                                             | Shape                                                  |
| :------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------- |
| Deterministic code   | a fact the tree, git, the filesystem or an API already states                       | free, exact, testable                                  |
| A Jev typed decision | a semantic judgement over state already in hand, whose answer is one of a fixed set | sub-second, fractions of a cent, cannot answer off-set |
| A headless session   | work that must open files it cannot be handed, or must write                        | a slice of the one shared window                       |

Ask the lowest tier first, and let it hand up what it cannot answer. A tier that _could_ have answered and was skipped is the failure mode — its tell is a session prompt restating facts the caller already computed, or a session whose entire output is one word the caller then parses.

- A predicate over data already read is code. A count, a trailer, an sha ancestry, a file count, a label, a threshold: no model.
- A judgement over prose or over a diff — is this concern real, how severe is this finding, which label does this issue take — is Jev's, when its answer is one of a fixed set and the state fits in the request.
- Only what must open files it cannot be handed, or must write, is a session.

## A headless session delegates in the foreground, and only the drain does

The drain session is the one headless session that delegates. Its fixes may go to `haiku` subagents, as `apps/web/content/docs/infra/review-collector/drain.md` sets out. Foreground is forced by the shape: a `claude -p` session has no next turn in which to read a backgrounded result. The subagent tier is named per call, and the runner's environment leaves `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` unset (`apps/web/content/docs/infra/review-collector/runner.md`).

## A deterministic tier does not have to know whether it applies

The usual reason a mechanical answer is skipped is that nothing can tell in advance whether it fits, so the question goes up to be classified and the tier above spends its whole turn deciding which command to run. Where the repository already holds a verifier for the result, invert it: produce the mechanical answer, then ask the verifier. The classification never happens, and the roster of cases it would have needed is never written and never drifts.

Two conditions. The verifier has to be cheap against the tier above it — a check suite against a slice of the window is the trade the collector's repair makes (`apps/web/content/docs/infra/review-collector/repair.md`). And a failed attempt has to restore exactly the state the tier above would have found, or the cheap path has made the expensive one harder instead.

## Jev — the typed decision tier

`choice`, `noul` and `score`, every question about one state in one call, confidence gating the escalation rather than the answer, and every call through `scripts/src/services/jev/readAnswers.ts` (`references/jev.md`).

## A headless session's model is a property of its role, and every spawn owes a gate

A session's model is read off `SessionRoleModelMap` for its role, and no session launches without a deterministic check, a typed decision or a recorded marker able to decline it (`references/sessions.md`).

## Design for agents

Every feature is designed agentic-first: resource creation (and eventually most authoring) may be done by AI, so specs keep that path open — content is schema-validated JSON, writes go through ordinary validated procedures, no hidden client-side state, validation before side effects. `apps/web/content/docs/resource/blueprint-resource.md` is the canonical statement: whatever creates resources — human, form, or model — goes through the same front door.

## Reference pages

- `references/reading-passes.md` — when a task reads a whole tree to change part of it.
- `references/delegation-prompt.md` — when writing a subagent's prompt.
- `references/running-agents.md` — while an agent runs, before a parallel batch, or when cleaning up after one.
- `references/jev.md` — when a judgement goes to Jev.
- `references/sessions.md` — when automation launches a headless session.
