# Moves and Renames

Read after moving a file, renaming a name that docs cite, or adding a page. The rule itself is in `SKILL.md` — docs move with the code that changes them; this page is the mechanical follow-through a move, a rename or a new page owes, and which quoting keeps the citation tests honest.

## A moved file

`pnpm ai:citations:sync` rewrites every backticked citation of it across the docs, the agent tree and the READMEs from the renames git sees (against `HEAD`, or a base ref passed as its argument once the move is committed) — `scripts/src/workspace/citations.test.ts` still catches whatever a hand edit misses, across the same trees. A backticked path is a claim the tree holds it, so one the tree deliberately does not — a generated artifact's layout, the pre-move path a resume across a relocation passes beside the new one — is written in quotes for the same reason a name is.

## A renamed name

`scripts/src/workspace/staleNames.test.ts` fails on every backticked code name those trees cite that neither the tree (its source short of what the formatter ignores as generated, its paths, Nuxt's registered component names and generated declarations) nor an installed package's type declarations hold. **A backticked name is that claim**, so a name only an external system declares — an Azure app setting, a tool's error code, a config key the repo does not set — is written in quotes (`"WEBSITE_CONTENTSHARE"`), and a rule's invented example takes a placeholder stem (`skill-authoring` skill, `references/what-belongs.md`); a name cited to say the repo has no such thing is prose.

## An added page

Register it in the area `index.md` table and, in a section the sidebar map covers, in `DocsSectionGroupsMap.ts` (`references/page-shapes.md`, "Sidebar grouping").
