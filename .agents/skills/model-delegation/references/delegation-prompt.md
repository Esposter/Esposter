# The Delegation Prompt

Read when writing a prompt for a subagent that starts with no conversation context.

The agent starts with zero conversation context. The prompt must carry:

- **The spec** — point at the proposal file (or inline it) and pre-resolve every judgment call you can: exact rename maps, negative lists (what NOT to touch), edge cases already decided. Ambiguity left in the prompt becomes a judgment call made without you.
- **The skills whose rules the spec touches, by name** — the agent loads a skill it is told to and guesses at one it is not. Two it always takes: the `running-checks` skill, so it verifies with the touched tests and leaves the rest to CI, and, where the spec changes a schema, the `drizzle` skill, so it edits the schema alone and reports that `pnpm db:gen` is the user's to run.
- **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
- **Git discipline** — commit style from the `git` skill ("Commit Message Format"), and the branch the commits land on. **Never `git add -A`**: another session's WIP may be dirty, so read `git status` fresh and stage explicit paths only.
- **Report-back contract** — files changed, judgment calls made, verification results, and anything only the user can do (e.g. running `pnpm db:gen` for a pending schema change).
