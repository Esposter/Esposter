---
title: Character kits
description: Genshin's character kits as built — every playable character's skill sets read from the game's tables into genshin-world, each with its skill's cooldown and charges and its burst's cooldown, energy cost and element, per element form. The Traveler's kit reads its multipliers from the game's proud skill table and sits in its own character module, a kit's action turns to its target by the wiki's score, a hit can deal its own element, and a party member can be healed. Per-character modules beyond the Traveler's are still proposed.
---

# Character kits

A character's combat kit is its skills, cooldowns, costs and talent multipliers, and the game keeps those in its tables by the character's skill sets. What is built is the table side: each playable character's skill sets, written beside the stat tables by the stats run, and the targeting that turns an action to its enemy. The Traveler's first kit reads its multipliers from the same tables and sits in its own module, and every other character still fights with it until its own module is written. The kits' hits are [combat](/docs/genshin/combat)'s, and the kit's action state machine is documented there too.

## Skill sets

A character has one skill set in its own form, and a set for each element form its element may take, the one a statue's element picks. A set holds a skill, the character's elemental skill, and a burst, its energy skill, each read from the skill table by its id. The skill has a cooldown and its charges, the burst a cooldown, an energy cost and the element it deals, the element its energy is named as.

```mermaid
flowchart LR
  AV["AvatarExcelConfigData: each avatar's own skill sets and the element sets it may take"] --> RD["getCharacterSkillKits: each set's skill and burst, read from their rows"]
  SK["AvatarSkillDepotExcelConfigData and AvatarSkillExcelConfigData, in the dump"] --> RD
  RD --> JSON["characterSkillKits.json, written with the other stat tables"]
  JSON --> APP["genshin-world loads it on demand; no kit reads it yet"]
```

- **A set with neither a skill nor a burst is left out.** A character none of whose sets has either is left out too. One of the Traveler's element sets, 705, holds neither in this dump, so the dump gives the Traveler no form for it.
- **A burst's element is the one its energy names, when it names one of the seven.** A burst that costs no element has none. Which set a Traveler's kit reads is for the element a statue gives, which is not built yet.
- **The Traveler's Anemo set** holds a skill of 5 seconds, one charge, and a burst of 15 seconds for 60 energy, which are the numbers `TRAVELER_KIT` reads beside its hits.
- **The table is written by** `pnpm -C scripts genshin:assets stats`, the same run as the characters, weapons and artifacts. Each character is checked against the world's schema as it is written.

## Talent multipliers

Each combat talent's multipliers are written per level by the same run, into `talentMultipliers.json`, keyed by the talent's proud skill group. A level keeps its parameters (`paramList`) up to the last one that is not zero, each with the text id labelling it (`paramDescList`), so a read past that point is zero. The table is loaded synchronously by `getTalentMultiplier`, which reads a parameter by its index. It holds the groups the talent kits name, 352 of them, and a level past 10 is the constellation's.

```mermaid
flowchart LR
  P["ProudSkillExcelConfigData: each group's levels and their parameters"] -->|"stats run, the groups the talent kits name"| M["talentMultipliers.json, keyed by group"]
  M -->|"static import, checked by its schema once"| G["getTalentMultiplier: a level's parameter by its index"]
  G --> T["TRAVELER_KIT: the Anemo form's hits' multipliers"]
```

## Targeting

An action turns the body to the enemy it targets as it starts. That is the living enemy inside the action's targeting area scoring highest, where an enemy's score is 0.7 times its nearness to the body within the area's radius, plus 0.3 times its nearness to straight ahead, the angle from the body's facing over a half-turn. An enemy more than 2 metres above or below the body scores a fifth of that. Enemies outside the area, and the dead, are not targeted. The view, current-target and priority coefficients are not built.

## The Traveler's kit

`TRAVELER_KIT`, in the Traveler's character module, is the first kit, at talent level 1. Its hitmarks and seconds are gcsim v2.47.2's frames, and the plunges' poise is gcsim's pyro plunge's. gcsim sets no poise on the Anemo skill or burst, so both hit with none. Its strikes' poise is not in that file, so each is provisional, as are the charged attack's and the plunge collision's.

Its multipliers are read from the Anemo form's proud skill groups, 731 for the attacks, 732 for Palm Vortex and 739 for Gust Surge. Those agree with the wiki's values to two decimal places. The charged attack's second hit is 731's 0.7224, where the male form's group 730 gives 0.60716, so the kit reads 731 for it.

A hit can name its own element, which strikes the enemy as that element whatever the character's own is. The Traveler's hits name none, so they deal the element of the Traveler's form, which is none until a statue gives one.

## Shared effects

- **Damage** is a hit: its talent multiplier, its gauge of an element, and the element it names when it is not its character's own.
- **Heal** is `healPartyMember`: a share of a standing member's max HP, never above all of it. A downed member stays down, as only a revive brings one back.
- **Energy** is the party's `gainPartyEnergy`, which an enemy's drop already calls.
- **Summons and statuses** are not built. No combat state holds one yet, so the first module that needs one builds it.

## Key files

| File                                                                 | Role                                                                                  |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/models/character/SkillDepot.ts`          | A skill set: its skill's cooldown and charges, its burst's cooldown, cost and element |
| `packages/genshin-world/src/models/character/CharacterSkillKit.ts`   | A playable character's skill sets by its id                                           |
| `scripts/src/services/genshinAssets/stats/getCharacterSkillKits.ts`  | Every playable character's skill sets, from the dump's tables                         |
| `scripts/src/services/genshinAssets/stats/toSkillDepot.ts`           | One skill set, from its depot row and the skill rows                                  |
| `scripts/src/services/genshinAssets/stats/toTalentMultiplierMap.ts`  | Each named talent group's levels, parameters and labels                               |
| `packages/genshin-world/src/generated/stats/characterSkillKits.json` | The written table the app loads on demand                                             |
| `packages/genshin-world/src/generated/stats/talentMultipliers.json`  | The talent multipliers per level, loaded statically                                   |
| `packages/genshin-world/src/services/kit/getTalentMultiplier.ts`     | A talent's parameter at a level, by its index                                         |
| `packages/genshin-world/src/services/kit/selectAttackTarget.ts`      | The targeting score an action turns the body to                                       |
| `packages/genshin-world/src/services/kit/characters/travelerKit.ts`  | `TRAVELER_KIT`, the Traveler's Anemo kit                                              |
| `packages/genshin-world/src/services/kit/constants.ts`               | The targeting weights and the kit's shared timing constants                           |
| `packages/genshin-world/src/services/party/healPartyMember.ts`       | Heals a standing member up to all its HP                                              |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/traveler/common), MIT: the Traveler's anemo attack, skill and burst frames, and the plunges' poise in its pyro plunge file.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the avatar, skill depot and skill tables the table is read from, and the proud skill table the multipliers are read from.
