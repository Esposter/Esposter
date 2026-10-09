---
title: Artifact enhancement
description: Proposal — each artifact set's conditional bonus, the four-piece effects that wait on combat, as a module per set over the character kits' shared effects, its numbers from the set table.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/services/artifact/**"]
---

# Artifact enhancement

Rolling, enhancing and locking artifacts is [built](/docs/genshin/artifact-enhancement): a drop's main and minor affixes, the Artifact EXP and its Mora, the every-fourth-level affixes, and the fodder and lock rules. What is left is the sets whose bonus waits on combat, a burst used or a reaction triggered, which act through the [character kits](/docs/proposals/genshin/character-kits) and so wait on them.

## Decisions

- **A set's conditional bonus is a module.** A two or four-piece bonus that waits on combat is a small module of its own over the shared effects the kits use, its numbers the set table's, as a weapon's passive is. Its unconditional attributes stay what the sum already reads ([character attributes](/docs/genshin/character-attributes)).
- **The weights are the wiki's current table, read through the API.** The wiki answers through the persona's reader, so the weights are checked rather than recalled. Its `Artifact/Distribution` page gives the Sands as HP% 26.68, ATK% 26.66, DEF% 26.66, Energy Recharge 10 and Elemental Mastery 10, and the Goblet as HP% 19.25, ATK% 19.25, DEF% 19.00, each DMG Bonus 5 and Elemental Mastery 2.5. The Flower, Plume and Circlet, the minor affixes' weights (6, 4 and 3) and the `Artifact EXP` page's bonus (90, 9 and 1 in a hundred) already match. How many minor affixes a drop starts with is its source's, from `Loot System/Artifact Drop Distribution` (a domain's five-star starts with three at 80% and four at 20%), so it is the [domains](/docs/proposals/genshin/domains) and [bosses](/docs/proposals/genshin/bosses) pages' to pass into `rollArtifact`.
- **A module is carried with its set.** No set's conditional bonus is written before the set is carried, so no module waits on an effect the kits do not yet have.

## Scope and order

**Today:** an artifact's unconditional set lines are summed, and a conditional bonus adds no line and is only the set's description.

**Still to build, in order:**

1. **The main affix weights set to the wiki's.** In `packages/genshin-world/src/services/artifact/constants.ts`, `ArtifactMainAffixWeightMap`'s Sands and Goblet take the values above, and the `Provisional` notes on it, on `ArtifactMinorAffixWeightMap` and on `EXPERIENCE_BONUS_WEIGHTS` become the pages they are read from. `rollArtifact.test.ts` and `enhanceArtifact.test.ts` keep passing, re-snapshotted only where a seeded draw now lands on another main affix.
2. **Each set's conditional bonus as a module**, in the order the sets are carried, once the [character kits](/docs/proposals/genshin/character-kits), the unit the other machine holds, provide the shared effect each bonus rests on.

## Data and measures

- **Read from the game's tables:** the sets' conditional numbers from `ReliquarySetExcelConfigData`'s affixes, through the existing `EquipAffixExcelConfigData` reading.
- **Measured:** nothing.

## Key files

| File                                                                           | Role after the change                             |
| :----------------------------------------------------------------------------- | :------------------------------------------------ |
| `packages/genshin-world/src/models/artifact/ArtifactSetData.ts`                | Gains its conditional bonuses' numbers            |
| `packages/genshin-world/src/services/artifact/getArtifactSetAttributeLines.ts` | Keeps the unconditional lines, beside the modules |

## Sources

- [Artifact](https://genshin-impact.fandom.com/wiki/Artifact), Genshin Impact Wiki: the set bonuses at two and four pieces, and the conditional four-piece effects this page lists.
- [Artifact/Distribution](https://genshin-impact.fandom.com/wiki/Artifact/Distribution), Genshin Impact Wiki: each slot's main affix chances and the minor affixes' weights.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `ReliquarySetExcelConfigData` and `EquipAffixExcelConfigData`, which hold the set bonuses' numbers.
