# Redesigning a Unit

Read when redesigning a product area's unit on the library. That its flows are inventoried first is in `SKILL.md`; this page is the procedure.

Write down every flow and state a unit has before touching its template; the unit fails if the new version drops any of them. A unit may redesign across page boundaries — merge, split or move pages — as long as every inventoried flow keeps a place, every old route redirects, and the flow map is regenerated in the same commit with `pnpm flow-map:gen` from `apps/web` — its test fails on a stale one. Progress is the "ui-library" ledger in `.agents/ledgers/`, run by the `sweeps` skill, so a unit's commit carries its flow inventory in the body and `Ledger: ui-library | <unit>` as a trailer. Where the unit needs a part the library lacks, that is a new library component, built first in its own commit.
