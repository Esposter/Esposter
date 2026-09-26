# Citations

Read when citing a file, a docs page or another skill from a skill, a ledger or a README.

Nothing resolves a link out of a skill: no renderer opens one, and a relative `../../../` hop or a
`github.com/.../blob/main/...` url is a path the reader has to reconstruct or a network fetch they cannot make.
So a citation is the **repo-relative path in backticks** — `apps/web/content/docs/architecture/agent-configuration.md` — which
is what a reader greps, opens and edits, and which stays right when the skill moves. A path relative to anything
but the repo root (`docs/architecture/agent-configuration.md`) resolves nowhere and is the form that silently rots.
`scripts/src/workspace/citations.test.ts` resolves every backticked path, and every ``the `x` skill`` name, across
the agent tree, the docs and the READMEs, so a citation of a moved file or a renamed skill fails `pnpm test` — and a
path or skill named only to say it does **not** exist is written as prose (`a shared/ folder under app/`), never as
a citation the test would try to resolve.

Cite another **skill** by name plus its page (``the `pinia` skill (`references/keyed-state-and-pagination.md`)``),
never as a path into `.agents/skills/`.
