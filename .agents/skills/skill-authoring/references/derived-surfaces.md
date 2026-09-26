# What a script derives, nobody maintains

Read when about to write a table, a list, a roster or a date by hand into a skill, a ledger or a README.

The `docs` skill's rule — never write down what the repo can count — applies to the agent tree as much as to a docs page: a hand-maintained copy of a fact the tree or git holds drifts the moment the fact changes, and nothing fails when it does. So before writing any table, list or date by hand, ask what generates it; if a command does, the command's name goes in the prose and the fact stays out. The surfaces derived here:

- **The skill listing** is each skill's frontmatter, which Claude Code loads whole; `.agents/skills/README.md` holds the boundaries two descriptions cannot settle between them, never a roster.
- **A citation's path after a move** is `pnpm ai:citations:sync` over the renames in the working tree (the `docs` skill, `references/moves-and-renames.md`).
- **A ledger row's date** is the `Ledger:` trailer on the commit that swept it, filled in by `pnpm ai:sweep:ledger-coverage` (`sweeps` skill, `references/ledger-files.md`) — and **the skills ledger's rows** are the skill directories, written by the same run and held to the tree by `scripts/src/workspace/ledgerUnits.test.ts`.
