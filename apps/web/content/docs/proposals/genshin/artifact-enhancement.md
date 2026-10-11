---
title: Artifact enhancement
description: Proposal — each artifact set's conditional bonus, the four-piece effects that wait on combat, as a module per set over the character kits' shared effects, its numbers from the set table.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/services/artifact/**"]
---

# Artifact enhancement

Rolling, enhancing and locking artifacts is [built](/docs/genshin/artifact-enhancement): a drop's main and minor affixes by the wiki's weights, the Artifact EXP and its Mora, the every-fourth-level affixes, and the fodder and lock rules. A set's bonus that waits on combat is a module of its set's answering the kits' events, and Instructor's, which answers a reaction triggered, The Exile's and Traveling Doctor's, which answer a burst used, and Berserker's, which reads its wearer's HP as its hits are priced, are built. What is left is the other sets the world carries, whose bonuses rest on a hook the [character kits](/docs/proposals/genshin/character-kits) do not provide yet, and so wait on them.

## Decisions

- **A set's conditional bonus is a module.** A two or four-piece bonus that waits on combat is a small module of its own over the shared effects the kits use, its numbers the set table's, as a weapon's passive is. Its unconditional attributes stay what the sum already reads ([character attributes](/docs/genshin/character-attributes)).
- **A module is carried with its set.** No set's conditional bonus is written before the set is carried, so no module waits on an effect the kits do not yet have.

## Scope and order

**Today:** an artifact's unconditional set lines are summed, each bonus carries its affix's numbers, and a combatant's kit carries the modules of the sets it wears. Instructor's, The Exile's, Traveling Doctor's and Berserker's four-pieces are modules; every other set the world carries in its chests' pools gives only its attributes.

**Still to build, in order:**

1. **Each other carried set's bonus as a module**, written as an entry of `ArtifactSetIdCreateModuleMap` once the [character kits](/docs/proposals/genshin/character-kits), the unit the other machine holds, provide the hook it rests on:
   - Adventurer's four-piece, a heal over seconds as a chest opens, and Lucky Dog's, a flat heal as Mora is picked up, wait on those world actions reaching a kit, which only sprinting does today.

## Data and measures

- **Read from the game's tables:** nothing new; each bonus's numbers are already published with its set.
- **Measured:** nothing.

## Key files

| File                                                                           | Role after the change                           |
| :----------------------------------------------------------------------------- | :---------------------------------------------- |
| `packages/genshin-world/src/services/artifact/ArtifactSetIdCreateModuleMap.ts` | Gains each set's module as its hook is provided |

## Sources

- [Artifact](https://genshin-impact.fandom.com/wiki/Artifact), Genshin Impact Wiki: the set bonuses at two and four pieces, and the conditional four-piece effects this page lists.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: `ReliquarySetExcelConfigData` and `EquipAffixExcelConfigData`, which hold the set bonuses' numbers and name each conditional effect's config.
