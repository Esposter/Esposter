# Citations

Read when citing a file, a docs page or another skill from a skill, a ledger or a README.

Nothing resolves a link out of a skill: no renderer opens one, and a relative `../../../` hop or a
`github.com/.../blob/main/...` url is a path the reader has to reconstruct or a network fetch they cannot make.
So a citation is the **repo-relative path in backticks** — `apps/web/content/docs/architecture/agent-configuration.md` —
which is what a reader greps, opens and edits, and which stays right when the skill moves. The one other root is
`apps/web`, for the prefixes `APP_RELATIVE_PREFIXES` in `packages/configuration/src/constants.ts` lists, since the
docs' Key Files tables write app paths that way; a path relative to anything else (`docs/architecture/agent-configuration.md`)
resolves nowhere and is the form that silently rots.
`scripts/src/workspace/citations.test.ts` resolves every backticked path, and every name written ``… `x` skill``,
across the agent tree, the docs and the READMEs, so a citation of a moved file or a renamed skill fails `pnpm test` —
and a path or skill named only to say it does **not** exist is written as prose (`a shared/ folder under app/`), never
as a citation the test would try to resolve.

Cite another **skill** by name plus its page (``the `pinia` skill (`references/keyed-state-and-pagination.md`)``),
never as a path into `.agents/skills/` and never as a bare name in parentheses, which the same test
refuses because a name without the word `skill` after it is one it cannot tell from any other backticked token. A
citation by heading (``the `x` skill ("Heading")``) is resolved by the same test against the skill's headings and bold
rules, but a page path survives a reword where a heading does not.

**A pointer at one rule names where that rule sits** — its page, or its heading where the other skill keeps it in
`SKILL.md` — so the reader lands on the rule rather than on an index to search again. The bare ``the `x` skill`` is
for the skill's whole domain: which command a check runs is the `package-scripts` skill, and there is no one page to
name. Nothing mechanical tells the two apart, so the pass reads every skill pointer for it.
