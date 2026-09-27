# Retiring an Enforcer

Read when a change simplifies, deletes or restructures code — a refactor, a removed mechanism, a shape moved up the ladder — before it is called finished, and when an enforcer looks like it guards something the tree no longer has.

**An enforcer is paid for every run, whether it can still fire or not.** A lint rule, a `no-restricted-syntax` selector, a template scan in `apps/web/app/templates.test.ts`, a workspace test under `scripts/src/workspace/`, a sweep script: each costs its config, its share of every lint and test run, the disables written against it and the upkeep of its message. That price is worth paying only while the wrong version can still be written. Adding one is cheap, and that is exactly why the set only grows unless something retires them.

**So a change that removes what an enforcer guards removes the enforcer, in the same change.** Two shapes do it:

- **The guarded thing is gone** — a deleted component, prop, store field, API or pattern, whose ban or test now names something nothing can write.
- **The shape climbed the ladder** — the rule is now by construction or structural, one primitive every caller goes through, so the lint or test that held it at the enforced rung can no longer fail on anything real.

**The lookup runs from the change outward.** For every name, prop, pattern or file the change deleted or made unwritable, grep the enforcer surfaces for it — `oxlint.config.ts`, `packages/configuration/eslint/`, `scripts/src/oxlint/`, `scripts/src/workspace/`, `apps/web/app/templates.test.ts`, the sweep scripts under `scripts/src/sweeps/`, a ledger's find recipe — and read what each hit still protects. One that can still fail on real code stays; one that cannot goes, with its disables, its fixtures and the skill line that named it. "Nothing names it" is a result, and the finishing audit reports it.

**Never keep one "just in case."** An enforcer whose subject cannot recur is a rule a reader has to learn and that proves nothing, and the day the pattern comes back it arrives in a new shape the stale selector does not match anyway. If it recurs, the twice-found rule (the `sweeps` skill, `references/handing-to-an-enforcer.md`) earns a fresh one against the shape it actually has.
