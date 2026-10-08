---
title: Character screen
description: Proposal — what is left of the game's character screen once its frame, its tabs and the Attributes tab are built. The look measured off the English client, the chosen character standing in the middle, the element's mark, the Details view, the other five tabs' panels, levelling up and ascending, levels 95 and 100, and the Traveler's resonance and quest bonuses.
model: claude-opus-5-5
---

# Character screen

This page builds on the [character screen](/docs/genshin/character-screen) as built, whose frame lists the player's characters and six tabs and whose Attributes tab shows the game's own sums ([character attributes](/docs/genshin/character-attributes)). It also builds on [characters](/docs/proposals/genshin/characters), whose model stands in the screen's middle.

## Decisions

- **Measured like every screen.** The screen's references are recordings of the English client's character screen at 1080 high, published ones first; its frame's places, sizes and colours come from its rect tree and its passes, and every value marked provisional in its styles is replaced by a measured one.
- **The chosen character stands in the middle**, its official model on the toon ramp, over a background that moves with its element: lightning, water bubbles, snow, ash, wind, leaves or rocks.
- **The element's mark at the top left**, the Vision of the character's region and element as the game draws it, traced into a path of our own as the interface's glyphs are; the Traveler's is their alignment's.
- **Details opens every attribute**, the advanced ones past the summary (Incoming Healing Bonus, CD Reduction and Shield Strength among them) and each element's RES, in the game's three groups.
- **The other tabs show their panels.** Weapons: the weapon's base ATK, secondary attribute, rarity, level and refinement with its passive, and switching it. Artifacts: the five pieces, their main and minor affixes and the set bonuses earned. Constellation: the six constellations and those activated. Talents: the combat and passive talents and their levels. Profile: the character's details, stories and voice-overs, with the model's terms ([characters](/docs/proposals/genshin/characters)).
- **Levelling up and ascending.** Level Up spends Character EXP materials; Ascend, at a phase's cap, spends its materials and Mora once the Adventure Rank allows it (15, 25, 30, 35, 40 and 50). Each phase's materials come from the game's promotion table, as its attributes do.
- **Levels 95 and 100** are reached past level 90 with Masterless Stella Fortuna, the level rising at once to the next cap, with the curves the tables already carry to level 100.
- **The Traveler's own bonuses.** Resonating with a Statue of The Seven gives the Traveler that element, and after the Archon Quest's step the game names, a bonus per element resonated with; quests add a few points of base ATK, HP and Elemental Mastery.

## Scope

**Today:** the frame, the six tabs in the game's words, the Attributes tab's level and grouped attributes, and the Traveler alone with the Dull Blade.

**This adds, in order:**

1. **The references and the look**, through the passes, replacing every provisional value.
2. **The character in the middle and the element's mark.**
3. **Details**, then the **Weapons** and **Artifacts** tabs over the [character attributes](/docs/genshin/character-attributes)' tables.
4. **The roster's names**, each character's name a key of the [game text](/docs/genshin/game-text) once the stats run writes the roster.
5. **Level Up and Ascend**, on the [inventory](/docs/proposals/genshin/inventory)'s materials.
6. **Constellation, Talents and Profile**, then levels 95 and 100 and the Traveler's bonuses.

## Key files

| File                                                                      | Role after the change                                      |
| :------------------------------------------------------------------------ | :--------------------------------------------------------- |
| `packages/genshin-interface/src/components/CharacterMenu/Index.vue`       | The frame, measured                                        |
| `packages/genshin-world/src/components/Character/Screen/Index.vue`        | The screen, with the character in the middle and every tab |
| `packages/genshin-world/src/components/Character/AttributeList/Index.vue` | The summary, with Details beside it                        |
| `packages/genshin-text/src/models/GameTextKey.ts`                         | Gains every label of the panels and the roster's names     |
| `scripts/src/services/genshinAssets/stats/writeStatTables.ts`             | Gains the promotion materials and the levels' EXP          |

## Sources

- [Character Menu](https://genshin-impact.fandom.com/wiki/Character/Menu), Genshin Impact Wiki: the list, the element's mark and background, every tab's panel, Details, Level Up and Ascend.
- [Character](https://genshin-impact.fandom.com/wiki/Character), Genshin Impact Wiki: the ascension phases, their caps and Adventure Ranks, and levels 95 and 100 with Masterless Stella Fortuna.
- [Traveler](https://genshin-impact.fandom.com/wiki/Traveler), Genshin Impact Wiki: the Traveler's quest bonuses and their bonus per element resonated with.
