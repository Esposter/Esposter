# The Docs Tests

Read when a docs test fails, or before adding a link, a path or a top-level section the tests will check.

- **Tests enforce the structural half of a page**, so a stale tree fails `pnpm test` rather than waiting on an audit: `apps/web/content/docs/index.test.ts` (links resolve, index pages cover their siblings, diagrams parse — the READMEs', root pages' and ledgers' included, `references/diagrams.md` — Key Files paths exist, every proposal names its model), and the tests beside `DocsSectionGroupsMap.ts`, `DocsCategorySectionsMap.ts` and `DocsSectionIconMap.ts`, which hold each map to the section folders — a new top-level section fails until all three name it. What they cannot see is a name in prose. Three traps when writing: a link to a page you are about to add fails until it exists, `app/shared/models/…` fails because shared models live at `apps/web/shared`, and an elided path (a `...` segment standing in for directories) is a broken path — write it in full.
