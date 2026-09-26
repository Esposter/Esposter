# The Delegation Prompt

Read when writing a prompt for a subagent that starts with no conversation context.

The agent starts with zero conversation context. The prompt must carry:

1. **The spec** — point at the proposal file (or inline it) and pre-resolve every judgment call you can: exact rename maps, negative lists (what NOT to touch), edge cases already decided. Ambiguity left in the prompt becomes a judgment call made without you.
2. **Repo conventions the agent can't infer** — always `pnpm`, never `npx`; verify with `pnpm format` + typecheck (and relevant tests); lint with `pnpm lint:fix` from the repo root, which is the only pass that oxlints the app (a package-local `lint:fix` never oxlints, so a change that passes it still fails CI); `try/catch` banned (getResult/getResultAsync + `.match`); no relative imports (`@/`, `#shared`, `@esposter/*`); never run `db:gen`/`db:up` and never hand-craft migration folders (cloning `snapshot.json` forks the migration chain — `db:gen` is the only sanctioned producer); when the spec needs a migration, edit the Drizzle schema only (the TS types alone keep typecheck green) and report that the user must run `pnpm db:gen` and apply it.
3. **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
4. **Git discipline** — commit style from the git skill, and the branch the commits land on. **Never `git add -A`**: another session's WIP may be dirty, so read `git status` fresh and stage explicit paths only.
5. **Report-back contract** — files changed, judgment calls made, verification results, and anything only the user can do (e.g. running `pnpm db:gen` for a pending schema change).
