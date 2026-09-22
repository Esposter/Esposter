---
name: llm-delegation
description: Apply when a step in a script, a workflow or a CI job needs a judgement rather than a computation — a gate, a route, a triage, a verdict, a severity, a merge risk — and when deciding what answers it. Esposter LLM-delegation conventions — the three tiers a judgement may be answered at (deterministic code, a Jev typed decision, a headless session), a question escalating only when the tier below cannot answer it and never descending, Jev's three primitives with every question of one state batched into one call, confidence gating the escalation rather than the answer, every role's model read off one total record, and the gate every spawn owes.
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

Three primitives — `choice` picks one of a defined set, `noul` returns the probability that a yes/no question is yes, `score` places the state on ordered levels and returns the distribution with it.

- **Every independent question about one state goes in one call**, keyed by name. The state is read once and each answer comes back under its key; a second call for a second question re-sends the state.
- **Confidence gates the escalation, not the answer.** Under its gate nothing acts on the answer — the case goes up a tier. Every gate the estate has today decides something that writes outside the checkout (a label on someone's issue, a merge), so `HIGH_STAKES_CONFIDENCE` (`scripts/src/services/jev/constants.ts`) is the only threshold there is: the cost of being wrong is not a retry. A lower-stakes consumer names its own floor beside it when it arrives, and not before — a threshold nothing reads is a rule nothing holds.
- A `noul` returns a probability and no separate confidence: the distance from `0.5` is the confidence.
- **Every call goes through `scripts/src/services/jev/readAnswers.ts`**, which answers nothing when no key is configured and never throws, so a gate written against it escalates on its own. Nothing else constructs a client, and a test never reaches one.
- The call surface, the cookbooks and the response fields are TypeSafe's own `typesafe@typesafe-ai` plugin skill's; what this skill owns is which questions belong there at all, and `apps/web/content/docs/infra/typed-decisions.md` is where the estate's own use of it is written down.

## A spawn's model is a property of its role

Each headless session the automation launches is one role, and its model is read off `SessionRoleModelMap` (`scripts/src/services/coderabbit/collect/constants.ts`) at the call site rather than off one constant every role shares. The map is total over the roles, so a role added does not compile until it has been priced, and a role moved to another family — another vendor's — is one line. `scripts/src/services/coderabbit/collect/runSession.ts` is the one launcher, and it takes the model rather than picking it.

**Every role runs on the same family, and that is a decision rather than an oversight.** The reconciliation roles are proved by the tree they left rather than trusted, so a cheaper family would be defensible for them — and is not taken: the headroom is bought at the gate below, where a question skips its session entirely, not at the tier, where every session still runs and each one is a little worse.

## Every spawn owes a gate that can decline it

No session is launched unconditionally. Before the spawn stands one of three gates, in this order of preference: a deterministic check that the work exists at all (`scripts/src/services/coderabbit/collect/resolveLockfileConflicts.ts`), a typed decision that the work needs a session at all (`scripts/src/services/coderabbit/collect/readReleaseGate.ts`), or a recorded verdict from an earlier run that this run re-applies rather than re-deciding. A run that spawns a session to discover there was nothing to do has already spent the window it was protecting.

A gate that cannot decide is not a gate that failed. It hands the case up, and the tier above runs exactly as it did before the gate existed — which is also what an unconfigured checkout gets, so nothing downstream may depend on a gate having answered.
