# Skill Coverage

Read when a commit has read a whole skill against these rules, when these rules change, or when a session asks which skills a newer model has not yet read.

Every skill is a row of `.agents/ledgers/docs/skills.md`, derived from the skills directory itself (`LedgerUnitsMap` in `scripts/src/services/sweeps/ledgerCoverage/`), so a new skill opens a row and a deleted one drops it with nobody editing the table. The `Swept` cell is the date and the model of the last commit that read the skill whole — `SKILL.md` and every `references/` page as one unit — and it is written by `pnpm ai:sweep:ledger-coverage` from that commit's trailers, never by hand (the `sweeps` skill, `references/one-pass.md`):

- **`Ledger: docs/skills | `<skill>``** on the commit that read the skill whole and left every page one topic, one owner and no line that does not earn it. A commit that restructured part of a skill, or appended to a page it did not reread, carries no trailer: the row stays open until a pass reads the rest.
- **`Reopens: docs/skills`** on a change to these rules. A skill read against a narrower rule set was not read against the current one, so every row goes back to `—`.
- **A newer model reopens a row by itself**, with no trailer and no edit — the `sweeps` skill's rule (`references/standing-resume.md`).

That is what makes the cleanup continuous: the open rows are the queue, `ai:sweep:ledger-coverage` at the start of a sitting shows it, and a skill leaves it only by being read whole under the current rules and the current model.
