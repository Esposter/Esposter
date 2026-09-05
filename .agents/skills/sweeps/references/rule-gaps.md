# When the rule runs out

Read when the convention a pass is carrying produces something nobody would defend, or when it is silent on the case in hand.

The convention a sweep carries is written down somewhere, and a pass reads code the writer of that rule never
saw. So the rule is **evidence, not authority**: a unit that will not fit it is as likely to have found a gap as
to be a violation, and the pass that shrugs and applies the rule anyway propagates the gap across a tree.

Three shapes, all found by applying a rule and watching it produce something nobody would defend:

- **The rule is silent.** It names the cases its author had, and a pass that applies it past them produces
  something nobody would defend — lowering the first letter of a SCREAMING_SNAKE export gives
  `nON_SOURCE_SUFFIXES`. The carve-out goes in beside the rule, with the reason, so the next pass does not
  re-derive it. **Check for an enforcer before writing one**: that name came from `vitest/prefer-lowercase-title`
  rejecting the verbatim one, so the carve-out this pass first reached for — keep the name as it is — was itself
  wrong, and lint said so. What the rule was missing was the whole camelCase, not an exemption.
- **The rule is true but incomplete in the direction that bites.** "`vi.stubEnv` needs no teardown" is correct
  and hides that the same auto-restore makes it useless for a `beforeAll` override. A rule that is right for the
  common case and silently wrong for the neighbouring one is worse than no rule, because it is obeyed.
- **The rule sits in the wrong skill, or in only one of the two it spans.** One owner per topic
  (`skill-authoring`), so the fix is to state it once where its subject lives and **link** from the other — never
  to restate it, and never to leave the second skill silent because the first happens to say it. A pass that
  reaches a rule by following a link from another skill has found the seam where a rule goes missing: check that
  the link runs both ways before moving on.

**The skill edit lands in the same commit as the code it came from.** Not a follow-up, not a note in the ledger —
the ledger holds coverage and never conventions, and a deferred skill edit is one nobody makes. The commit
message says which rule moved and why; that is the record, and git holds it.

Verify before obeying, in both directions: a rule that turns out to be wrong about the repo is fixed rather than
followed, and a scan the rule tells you to run is proved able to fail before its clean result is believed ("A scan
that reports nothing"). The recipe in `.agents/ledgers/testing/README.md` was written against `python3`, which on
a Windows checkout exits 0 having run nothing — the ledger meant to enforce the rule was the thing quietly
exempt from it.
