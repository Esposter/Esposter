# Embedded recipes

Every fence in a skill page, a ledger or a docs page that holds a **runnable recipe** rather than an
illustrative code example, read against `skill-authoring`'s `references/embedded-recipes.md`: one command whose
logic is its pattern stays where it is, anything with control flow becomes a tested script under
`scripts/src/<domain>/<verb>/` wired as `pnpm ai:<domain>:<verb>`.

A code example teaching a convention is not a recipe and never migrates — the question is whether a reader is
meant to **run** the block.

| Unit                                           | Swept      | Notes                                                                              |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `.agents/skills/coderabbit/references/*.md`    | 2026-09-11 | feedback, probe and window became `ai:coderabbit:*`; two emergency-path loops left |
| `.agents/skills/*/references/*.md`, `SKILL.md` | —          |                                                                                    |
| `.agents/ledgers/*.md`                         | —          | a grep pipeline is one command — the find recipes are mostly already compliant     |
| `apps/web/content/docs/**/*.md`, root markdown | —          |                                                                                    |

Find recipe, over `*.md`: fenced `bash`/`sh` blocks are the candidates, and a block is a finding when it holds a
loop, a branch, a fallback or a second process aggregating the first's output.

````bash
grep -rn -A 30 '^```bash' --include=*.md .agents apps/web/content/docs |
  grep -E "^\S+[-:][0-9]+[-:]\s*((for |while |until ).*(; do| do$)|if .*; then)"
````

Each hit is a candidate, not a defect: the pass reads the block and decides whether its logic is its pattern.
Prose inside the trailing window still slips through, and a placeholder shape taught as an idiom is not a
recipe, so a hit is read rather than counted. The two known open ones are `release-pr-cutting.md`'s per-commit file-count loops, whose home is a mode of the
existing window script rather than a script of their own.
