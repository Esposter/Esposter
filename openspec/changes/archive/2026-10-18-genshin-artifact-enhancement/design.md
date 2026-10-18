# Artifact enhancement

Rolling, enhancing and locking artifacts is [built](../../specs/genshin/artifact-enhancement/design.md): a drop's main and minor affixes by the wiki's weights, the Artifact EXP and its Mora, the every-fourth-level affixes, and the fodder and lock rules. A set's bonus that waits on combat is a module of its set's answering the kits' events, and Instructor's, which answers a reaction triggered, The Exile's and Traveling Doctor's, which answer a burst used, Berserker's, which reads its wearer's HP as its hits are priced, and Lucky Dog's, which answers Mora picked up, are built. What is left is Adventurer's, whose bonus answers a chest opened, which no chest in the world does yet.

## Decisions

- **A set's conditional bonus is a module.** A two or four-piece bonus that waits on combat is a small module of its own over the shared effects the kits use, its numbers the set table's, as a weapon's passive is. Its unconditional attributes stay what the sum already reads ([character attributes](../../specs/genshin/character-attributes/design.md)).
- **A chest opened during Adventurer's restoration restarts it.** The four-piece's restoration is a field, and fields stack as each one is its own, so the module ends its wearer's running restoration before it starts the next: two chests opened within five seconds heal for five seconds from the second, never twice at once. No source says whether the game refreshes or stacks it, so this is provisional, and a recording of two chests opened back to back settles it.
- **A module is carried with its set.** No set's conditional bonus is written before the set is carried, so no module waits on an effect the kits do not yet have.

## Scope and order

**Today:** an artifact's unconditional set lines are summed, each bonus carries its affix's numbers, and a combatant's kit carries the modules of the sets it wears. Instructor's, The Exile's, Traveling Doctor's, Berserker's and Lucky Dog's four-pieces are modules; every other set the world carries in its chests' pools gives only its attributes. A world action outside the step reaches the kits as Mora picked up does: a world event the combat puts on the outbox as a kit event, sent at the next step.

**Still to build, in order:**

1. **Adventurer's four-piece as a module**, an entry of `ArtifactSetIdCreateModuleMap`, its numbers already published with its set: 6% of its wearer's Max HP each second for 5 seconds as a chest opens. A chest opened reaches the kits as Mora picked up does, a world event the combat puts on the outbox as a kit event. It waits on the [chests](../genshin-chests/design.md) unit's first step, which opens a chest in the world, as `openChest` is called nowhere yet.

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
