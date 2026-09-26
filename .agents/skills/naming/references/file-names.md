# File Names

Read when naming or renaming a file, or its export. The one-line rule is in `SKILL.md`; this page is its full statement.

- **A file's name is its single export's name** — `getPostRanking.ts` → `export const getPostRanking`, `FooMap.ts` → `export const FooMap`. This holds for every export, not just constant maps: a noun filename over a `get*` function (`ranking.ts`) hides that the export breaks the verb-prefix rule, and a filename that merely resembles the export — one dropping a word the export carries, `callParticipantMap.ts` over a `callSessionParticipantMap` — makes the export unfindable by path. Renaming the export renames the file, in the same change. (Any camelCase-named file holding a PascalCase constant is a legacy outlier — don't copy it.)
