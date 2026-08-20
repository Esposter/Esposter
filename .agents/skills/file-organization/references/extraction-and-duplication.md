# Extraction and Duplication

`SKILL.md` states when to extract (≥2 functions sharing a shape) and the two tests an extraction and a flag each have to pass. This page is the shapes that extraction takes, and the arguments that have already been settled against it.

## Stop at the primitive

Don't introduce a stateful class or "lifecycle manager" when there is no state — it fights the functional grain and adds ceremony for nothing. Classes are for `models/` only.

## Shared stateful control flow becomes a `create*` factory returning a closure

When the near-twins also share per-module state (a memo, a cache tier ordering), the factory takes every varying part as a function parameter and returns the stateful closure. Each call site stays one named `export const` built from it, keeping its own domain rationale; a caller whose semantics differ — a guard that must run before the memo, an action that throws instead of degrading — wraps or parameterizes rather than forking the flow.

**Module-scope closure state does not reset between tests** — a test depending on it must call `vi.resetModules()` and then dynamically `import()` the module (static imports stay cached), or build a fresh instance from the factory per test.

## Don't force unrelated things together

Different domains stay separate even when they rhyme. The abstraction must reduce total complexity: single-use code stays inline, and per-feature helpers encoding genuinely different semantics stay separate.

## What "the caller stops being able to get something wrong" means

The test is what the caller no longer has to state, never how short the call reads. A helper that still takes every element hand-written at every call site — `getUnsubscribeAll(a, b, c)` over an inline `[a, b, c]` loop — has moved a loop and absorbed no decision: forgetting one is exactly as easy after. A wrapper carrying no logic, no invariant and no default is a rename with an import, so delete it and leave the inline form. Extraction that pays: the caller passes less than it did, or passes it in a shape that cannot be wrong.

The decidable half is **enforced** by `pass-through-helper/no-forwarding-wrapper` (`scripts/oxlint/passThroughHelper.ts`) — an exported arrow whose whole body is one call passing exactly its own parameters. It has no production suppressions and gets none: "it narrows the parameter type", "it is the single definition several reads agree on" and "it mirrors an upstream API name" have all been raised and rejected. Inline the wrapper.

## What "something behaves differently without it" means for a flag

The mirror of the rule above: collapsing near-twins wins because two things become one, so splitting one mechanism into two that each need a decision at every call site loses. Single responsibility is a unit having one job, never one boolean per case.

Prefer an over-approximation that costs nothing to a precise distinction that adds surface — one flag covering two causes is free when the consequence is identical — and architect so the case never has to be accounted for rather than adding the switch that accounts for it. **A distinction with no behavioural consequence is not debt**; recording it as such invites the next reviewer to build the switch.
