# The Delegation Prompt

Read when writing a prompt for a subagent that starts with no conversation context.

The agent starts with zero conversation context, so the prompt carries:

- **The spec** — point at the proposal file (or inline it) and pre-resolve every judgment call you can: exact rename maps, negative lists (what NOT to touch), edge cases already decided. Ambiguity left in the prompt becomes a judgment call made without you. A `haiku` prompt carries the rule itself rather than a skill to load, so its cold start is the prompt alone.
- **The skills whose rules the spec touches, by name** — the agent loads a skill it is told to and guesses at one it is not. Two it always takes: the `running-checks` skill, so it verifies with the touched tests and leaves the rest to CI, and, where the spec changes a schema, the `drizzle` skill, so it edits the schema alone and reports that `pnpm db:gen` is the user's to run.
- **The closing checklist, verbatim, on a fix round** (the `code-review` skill, `references/fixing-findings.md`). An agent handed only a findings list makes each finding's own test pass and stops — a guard exempted, a sibling site left behind, a mitigation asserted in a comment and never written.
- **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
- **Git discipline** — commit style from the `git` skill ("Commit Message Format"), and the branch the commits land on. **Never `git add -A`**: another session's WIP may be dirty, so read `git status` fresh and stage explicit paths only.
- **The environment it cannot infer** — Node on `PATH` (the `package-scripts` skill), the commands it runs and from where, and for a worktree agent the install it owes (`references/running-agents.md`).
- **Report-back contract, with its bound** — files changed, judgment calls met and left for the main session, every site the recipe matched and the agent left alone, verification results, and anything only the user can do. Paths with line numbers and numbers measured, never file contents.
