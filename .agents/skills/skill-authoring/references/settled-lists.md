# Settled lists

Read when a direction has been tried and rejected, or when a skill is accumulating rejections as prose.

A settled decision written as prose — "finishing X has been tried and is not wanted", mid-paragraph, two thirds down a long skill — is not read by the person about to propose X. That is how a rejected design gets re-derived by a reader who loaded the very skill that rejects it, and the cost is a session's work thrown away against a record that existed and was unfindable.

So a skill whose domain has directions that were tried or considered and rejected carries **`## Settled — do not re-propose`** as its first section after the intro, ahead of the rules anyone designs against.

- **One line per direction**: what would be proposed, why it fails, what to do instead — `**Bundling `` `external-pkg` `` into every consumer** — duplicates it in each dist and splits its types, so `` `instanceof` `` fails across copies; externalise and let the consumer dedupe.`
- **It holds directions, not rules.** A rule says what to do. A settled line exists only because a reader would plausibly propose the alternative — if nobody would, it is a rule and belongs with the rules.
- **The rationale stays where it already lives.** The line carries one clause of why, never the argument: where the skill makes the case further down, or `apps/web/content/docs/architecture/rejected/` holds a page for it, the line ends with that pointer. Two full statements of one rejection drift like any other copy.
- The reproducible-pattern test applies unchanged: no dates, no PR numbers, no account of the session that got it wrong. What would be proposed and why it fails is the whole entry.

`code-review` greps this tree as the tiebreaker for a finding that argues with a decision, so a rejection that never reaches a `Settled` list is one that keeps being re-litigated.
