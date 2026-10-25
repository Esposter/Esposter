# Name records

Read when an item, character, enemy or recipe name is published as a record or shown.

The one-line rule is in `SKILL.md`; this page is its reasoning.

## Monster names

A monster's name is filed under its description, not its row.

## Item names

`genshin:assets items` publishes each material's `nameTextId` and `genshin:text names` publishes every such name into the same records. The names builder collects every published record's and every data file's `nameTextId`s; a new item source needs no edit there.

## Character, weapon, enemy and recipe names

**A character's, a weapon's, an enemy kind's or a recipe's name is the world's, never a `GameTextKey`**: the stat tables, the enemy kinds and the recipes (cooking, processing and crafting) carry each one's `nameTextId`, `genshin:text names` publishes every name they cite as one record a language under `nameText`, after `genshin:assets stats`, `enemies`, `crafting` and `cooking`, and a screen reads it through `NameTextLoaderMap`, one language fetched by its key (`openspec/specs/genshin/wish/design.md`).
