---
title: objectWrap collapse
description: Proposal — hand the one-line-object rule to oxfmt's objectWrap option, so the formatter decides it instead of a sweep.
---

# `objectWrap: "collapse"`

The `formatting` skill holds a rule with no enforcer behind it: **a literal that fits the width goes on one line.** Nothing reports a violation, so the rule is carried by hand, and a repo-wide pass over it has already been paid once.

`oxfmt` can decide it instead. Its `objectWrap` option takes `"preserve"` (the default) or `"collapse"`, and `"collapse"` is the rule exactly:

```jsonc
// .oxfmtrc.json
{
  "objectWrap": "collapse",
  "printWidth": 120,
}
```

## Why it is not taken yet

`"preserve"` is not an absence of a policy — it is a policy that hands the decision to the author. A newline between `{` and the first key is how a writer says "keep this one broken", and the option's own documentation calls that a heuristic authors use to contextually improve readability. `"collapse"` takes the affordance away for every object in the repository, not only the ones that were expanded by accident.

The one that was paid by hand kept that affordance, because a sweep reads what it is collapsing and the formatter does not.

## What adopting it costs

- **One whitespace commit of roughly five hundred files.** It reaches shapes no hand pass can — an object returned from an arrow, a destructuring pattern, a nested combination — so the diff is several times the size of the pass that has already run, and it spends several review windows.
- **Every deliberate expansion goes with it.** An options object one-key-per-line for the sake of its diff collapses the moment it fits, and there is no per-site opt-out: the option is repository-wide.
- **The rule's prose changes owner.** The `formatting` skill's line — collapsed by hand because nothing reports it — becomes a pointer to the formatter, and the sentence explaining why nothing reports it goes.

## What it buys

The rule stops being a sweep. A formatter-owned rule cannot drift, needs no ledger row, no custom oxlint plugin and no exception roster — which is the outcome the `sweeps` skill's "shrinking beats re-running" asks for, reached through configuration rather than code (`oxlint`, `references/custom-js-plugins.md`, the stock-before-custom gate).

## Deciding it

The question is whether the deliberate expansion is worth keeping. It is a judgement about how this repository reads, not a fact the tooling settles, so it is a decision rather than a task — and until it is made, the `formatting` skill's rule stands and is carried by hand.
