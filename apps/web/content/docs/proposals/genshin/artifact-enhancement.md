---
title: Artifact enhancement
description: Proposal — each artifact set's conditional bonus, the four-piece effects that wait on combat, as a module per set over the character kits' shared effects, its numbers from the set table.
model: claude-opus-5-5
---

# Artifact enhancement

Rolling, enhancing and locking artifacts is [built](/docs/genshin/artifact-enhancement): a drop's main and minor affixes, the Artifact EXP and its Mora, the every-fourth-level affixes, and the fodder and lock rules. What is left is the sets whose bonus waits on combat, a burst used or a reaction triggered, which act through the [character kits](/docs/proposals/genshin/character-kits) and so wait on them.

## Decisions

- **A set's conditional bonus is a module.** A two or four-piece bonus that waits on combat is a small module of its own over the shared effects the kits use, its numbers the set table's, as a weapon's passive is. Its unconditional attributes stay what the sum already reads ([character attributes](/docs/genshin/character-attributes)).
- **A module is carried with its set.** No set's conditional bonus is written before the set is carried, so no module waits on an effect the kits do not yet have.

## Scope and order

**Today:** an artifact's unconditional set lines are summed, and a conditional bonus adds no line and is only the set's description.

**This adds:** each set's conditional bonus as a module, in the order the sets are carried, once the [character kits](/docs/proposals/genshin/character-kits) provide the shared effect each bonus rests on.

## Data and measures

- **Read from the game's tables:** the sets' conditional numbers from `ReliquarySetExcelConfigData`'s affixes, through the existing `EquipAffixExcelConfigData` reading.
- **Measured:** nothing.

## Key files

| File                                                                           | Role after the change                             |
| :----------------------------------------------------------------------------- | :------------------------------------------------ |
| `packages/genshin-world/src/models/artifact/ArtifactSetData.ts`                | Gains its conditional bonuses' numbers            |
| `packages/genshin-world/src/services/artifact/getArtifactSetAttributeLines.ts` | Keeps the unconditional lines, beside the modules |

## Needs the user

- **The wiki's weights are provisional.** The main affix, minor affix and starting-count weights that [artifact enhancement](/docs/genshin/artifact-enhancement) draws by are recalled from the wiki's distribution and not checked against its page. A check of the weights against the wiki, and the starting-count weights per drop, are the user's to settle.

## Sources

- [Artifact](https://genshin-impact.fandom.com/wiki/Artifact), Genshin Impact Wiki: the set bonuses at two and four pieces, and the conditional four-piece effects this page lists.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `ReliquarySetExcelConfigData` and `EquipAffixExcelConfigData`, which hold the set bonuses' numbers.
