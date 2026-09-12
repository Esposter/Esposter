# Exceptions

Read when about to write an exception, a carve-out, or an "except where" clause into a rule.

We own the whole codebase, so almost nothing is genuinely un-fixable: a rule that would be inconvenient to apply
is a rule to apply anyway, and an exception written for it is a permanent licence bought to save one commit. The
bar is that something **outside our control** forces the shape — a dependency's own spelling or interface, a
platform or language requirement, a published surface whose rename is a breaking change, an enforcer that
demands the opposite. Those are worth writing down precisely because no amount of editing our code removes them.

So an exception states its forcing agent by name (`@azure/storage-blob`'s `listBlobsFlat`, `MediaRecorder`'s
optional properties, `vitest/padding-around-test-blocks`). One that cannot name a source outside the repo is
either a rule branch wearing the wrong word — `flex-wrap` on a three-control row is _when the rule says yes_,
not an escape from it — or a defect the exception is hiding, and the fix is the code. The second kind reads
plausibly — a carve-out for "a case the rule cannot express" — so the tell is a grep rather than an argument:
where neighbouring code already spells the thing the rule’s way and is fine, the exception is describing one
site’s defect, and deleting it costs a rename.

**Prefer the branch to the carve-out.** Written as a branch the rule stays one rule and its edge is decidable;
written as an exception it becomes two rules, and the second grows.
