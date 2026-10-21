# Save data

Read when a system that holds player state adds or changes its slice of the save.

The one-line rule is in `SKILL.md`; this page is its reasoning.

The save is `genshinSaveSchema` in `genshin-world`: one key per system, each slice's Zod schema beside its model, storing only what the player did as ids and counters, with the rules deriving everything else on load. Nothing in a slice is a derived value, and a change to a slice's shape is a backfill (`openspec/specs/genshin/save-data/design.md`).
