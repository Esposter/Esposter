# The written record

Read when a candidate finding argues with a choice the code makes deliberately — a retry policy, a cap, a swallowed error, a guard — before it is reported. The rule that the record wins is in `SKILL.md`; this page is what counts as the record, when a settled decision is a finding again, and how a decision is overturned.

## What counts as the record

`apps/web/content/docs/`, `.agents/skills/**/*.md` and `.agents/ledgers/**/*.md` are the tiebreaker — the whole skill tree, not the index pages alone, and a ledger's **Exclusions** section exists precisely to stop a unit being re-litigated: a binding rule as often sits in a skill's `references/*.md` deep dive as in its `SKILL.md`. A choice any of the three states deliberately, with its consequence acknowledged, is settled — not a finding. **So is a comment beside the line that states the choice and its reason** — a workflow's `# … rather than a list, because …`, a `// …` over a guard — because for a file no page owns, the comment is the record; a finding that argues with it is real only when it refutes the stated reason with a fact verified in the repository, never on the strength of the argument alone. It is a finding again only when the code contradicts the record, when a mitigation the record promises is missing, or when the change ships behaviour the record does not cover.

## Overturning one

Grep all three trees before reporting a finding that argues with a decision. A genuinely undocumented decision that keeps drawing fire is closed by writing the page (`docs` skill), not by arguing it again. A record invalidated by materially new evidence (an advisory, a changed dependency contract) reopens the decision — update the page first, then fix the code against the new record. **The new record names the direction it replaces as rejected, with the fact that beats it** — in the owning skill's Settled list where one exists. A decision that writes down only its own reason leaves the old reason standing beside it, and the next round reads two winners and flips it back.
