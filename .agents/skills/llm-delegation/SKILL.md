---
name: llm-delegation
description: Apply when a step in a script, a workflow or a CI job needs a judgement rather than a computation — a gate, a route, a triage, a verdict, a severity, a merge risk — and when deciding what answers it. Esposter LLM-delegation conventions: which tier a judgement is answered at — deterministic code, a Jev typed decision or a headless session — in automation as much as in a session.
---

# LLM Delegation — The Cheapest Thing That Can Answer

Which intelligence answers a question. The role split — what the main session thinks about versus what a subagent executes — is the `model-delegation` skill's, and so is the ban on naming a model version anywhere in this repo; this skill owns the tier a single judgement is answered at, in automation as much as in a session.

The scarce resource is one shared Claude Code account limit: every headless session the collector spawns is taken out of the same window a person's session draws on (`apps/web/content/docs/infra/review-collector/drain.md`). A decision moved down a tier is not a saving on a bill, it is a window a session can still run in.

## Settled — do not re-propose

- **Jev for an authoring step.** It returns typed decisions, never text, so a conflict resolved, a fix written, a commit split or a file edited is a session's work however mechanical it looks. Jev decides _whether_ and _which_; it never produces the artefact.
- **A frontier text model as the cheap classification tier** — a small model prompted to "reply with one word". It samples text, so it can emit a value outside the set, and it then owes a parse, a validator and a retry path; a typed decision cannot leave its own domain and needs none of them.

## The three tiers

| Tier                 | Answers                                                                             | Shape                                                  |
| :------------------- | :---------------------------------------------------------------------------------- | :----------------------------------------------------- |
| Deterministic code   | a fact the tree, git, the filesystem or an API already states                       | free, exact, testable                                  |
| A Jev typed decision | a semantic judgement over state already in hand, whose answer is one of a fixed set | sub-second, fractions of a cent, cannot answer off-set |
| A headless session   | work that must open files it cannot be handed, or must write                        | a slice of the one shared window                       |

## A question escalates; it never descends

Ask the lowest tier first, and let it hand up what it cannot answer. A tier that _could_ have answered and was skipped is the whole failure mode this skill exists for — its tell is a session prompt restating facts the caller already computed, or a session whose entire output is one word the caller then parses.

- A predicate over data already read is code. A count, a trailer, an sha ancestry, a file count, a label, a threshold: no model.
- A judgement over prose or over a diff — is this concern real, how severe is this finding, which label does this issue take — is Jev's, when its answer is one of a fixed set and the state fits in the request.
- Only what must open files it cannot be handed, or must write, is a session.

## A deterministic tier does not have to know whether it applies

The usual reason a mechanical answer is skipped is that nothing can tell in advance whether it fits, so the question goes up to be classified and the tier above spends its whole turn deciding which command to run. Where the repository already holds a verifier for the result, invert it: produce the mechanical answer, then ask the verifier. The classification never happens, and the roster of cases it would have needed is never written and never drifts.

Two conditions. The verifier has to be cheap against the tier above it — a check suite against a slice of the window is the trade the collector's repair makes (`apps/web/content/docs/infra/review-collector/repair.md`). And a failed attempt has to restore exactly the state the tier above would have found, or the cheap path has made the expensive one harder instead.

## Jev — the typed decision tier

`choice`, `noul` and `score`, every question about one state in one call, confidence gating the escalation rather than the answer, and every call through `scripts/src/services/jev/readAnswers.ts` (`references/jev.md`).

## A spawn's model is a property of its role

A session's model is read off `SessionRoleModelMap` for its role, and every role runs one family on purpose (`references/sessions.md`).

## Every spawn owes a gate that can decline it

No session launches unconditionally: a deterministic check, a typed decision or a recorded marker stands before it, and a gate that cannot decide hands the case up (`references/sessions.md`).

## Reference pages

- `references/jev.md` — when a judgement goes to Jev.
- `references/sessions.md` — when automation launches a headless session.
