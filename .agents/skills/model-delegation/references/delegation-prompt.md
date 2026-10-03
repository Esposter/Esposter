# The Delegation Prompt

Read when writing a prompt for a subagent that starts with no conversation context.

The agent starts with zero conversation context. The prompt must carry:

1. **The spec** — point at the proposal file (or inline it) and pre-resolve every judgment call you can: exact rename maps, negative lists (what NOT to touch), edge cases already decided. Ambiguity left in the prompt becomes a judgment call made without you.
2. **Repo conventions the agent can't infer** — always `pnpm`, never `npx`; verify with the tests of what the change touched, and leave typecheck, lint and format to CI (the `running-checks` skill); `try/catch` banned (getResult/getResultAsync + `.match`); no relative imports (`@/`, `#shared`, `@esposter/*`); never run `db:gen`/`db:up` and never hand-craft migration folders (cloning `snapshot.json` forks the migration chain — `db:gen` is the only sanctioned producer); when the spec needs a migration, edit the Drizzle schema only (the TS types alone keep typecheck green) and report that the user must run `pnpm db:gen` and apply it.
3. **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
4. **Git discipline** — commit style from the `git` skill ("Commit Message Format"), and the branch the commits land on. **Never `git add -A`**: another session's WIP may be dirty, so read `git status` fresh and stage explicit paths only.
5. **Report-back contract** — files changed, judgment calls made, verification results, and anything only the user can do (e.g. running `pnpm db:gen` for a pending schema change).
