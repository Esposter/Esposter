# State Machines and Their Invariants

Read when a feature's state is a handful of flags whose combinations keep producing bugs, when one is about to gain another flag, or when choosing how to prove a concurrent protocol holds.

## Flags become one union

Flags that move together are one state. Write it as a discriminated union whose kinds carry only the fields true in them, so a combination that cannot happen has no way to be written down, and every `switch` over the kind ends in `default: return exhaustiveGuard(value)` so a new kind fails the typecheck until each reader handles it. That is the by-construction rung: the impossible combinations are removed, not guarded.

## One pure reducer, effects as data

Every input is an event, and one pure function takes a state and an event to the next state and a list of effects. A driver runs the effects in order and turns each answer back into an event. The reducer then needs no network, store or mock to test, and it is the one place the protocol is stated. The worked case is `apps/web/app/services/resource/contentSync/reduceContentSync.ts`, with the store's driver in `apps/web/app/store/resource/index.ts` (`openspec/specs/architecture/content-sync/design.md`).

## Prove the invariants per transition

The check that scales is an inductive one: apply every event to every state shape and hold each invariant across the one step. Induction carries a property that starts true and survives each single step to every reachable state, so the cost is linear in states and events, with no sequence explored. The state shapes are finite when the reducer only compares its values — values for equality, versions for order — so one value per relation (older, equal, newer; same, other) is every case there is. The worked case is `checkContentSyncTransitions.test.ts` beside the reducer.

**Prove it fails before trusting it.** Mutate the reducer one line at a time — drop a guard, flip a comparison — and watch a named invariant break; a mutant nothing catches is an invariant not yet written, or an equivalent mutant worth one comment.

## Rejected — exploring interleavings

An explicit-state search over the machine, the server and a network answering in any order (what a model checker such as TLA+'s TLC does) grows combinatorially with the messages in flight. Symmetry reduction and abstraction shrink it but do not remove the blow-up, and the content sync's search did not finish at two other writers. Reach for it only for a property no single step can state, and then bound the scenario rather than the steps.
