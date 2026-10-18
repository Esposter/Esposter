# Artifact screen

A character's five artifact slots are read and changed by services over the character's own artifacts, and the world's
stat tables carry the rarity and EXP tables an enhancement reads. The bag is the caller's: a piece that leaves a character
goes back to it, and a piece that comes from it is the caller's to take out, so none of these services writes the bag.

## How it works

```mermaid
flowchart TD
  BAG["A bag artifact, once its entry holds its rolled state (not built)"] -->|"the caller equips it"| EQUIP["equipCharacterArtifact: the piece worn in its slot is returned"]
  EQUIP --> WORN["Character artifacts: one piece a slot"]
  WORN -->|"the caller unequips a slot"| UNEQUIP["unequipCharacterArtifact: an empty slot is refused"]
  UNEQUIP -->|"the piece goes to the bag"| BAG
  WORN --> GATE{"enhanceCharacterArtifact: does the wallet hold the Mora?"}
  FODDER["Materials and fodders the caller takes from the bag"] --> GATE
  GATE -->|"no"| REFUSE["Refused, nothing changes"]
  GATE -->|"yes"| ENHANCE["enhanceArtifact: EXP, levels and affix levels passed"]
  ENHANCE --> WORN
  WORN --> SETS["getActiveArtifactSetBonuses: the set bonuses reached at two and four pieces"]
  SETS --> LINES["getArtifactSetAttributeLines: the attribute sum reads the same bonuses"]
```

- **Equipping returns what it replaces.** The piece worn in the new piece's slot is the one returned, and the new piece
  takes its place in the array. A character never wears two pieces of one slot, so no other piece can be displaced.
- **Unequipping refuses an empty slot.** The taken-off piece is returned for the caller to put back in the bag.
- **Enhancing is gated on the Mora before anything changes.** The Mora is the materials' EXP plus each fodder's base EXP,
  from `getEnhancementMoraCost`, and a wallet short of it refuses the enhancement the way `enhanceWeapon` refuses one.
  The bonus, the levels and the affix levels are then `enhanceArtifact`'s, unchanged.
- **The fodder picker offers the bag's artifacts and the enhancement ores, and Auto Add is provisional.** The picker lists
  the bag's unlocked artifacts, the lowest star first and then the lowest level, and the bag's ores that give EXP: Sanctifying
  Unction at 2,500 and Sanctifying Essence at 10,000, from the dump's `ITEM_USE_ADD_RELIQUARY_EXP` and the wiki's
  Artifact Enhancement Material page (`ItemIdExperienceMap`). Auto Add takes unlocked artifacts up to four stars, the
  game's default, lowest star first, while the EXP still falls short of the top level. Its order and its stop are
  provisional, not measured from the game. The preview shows the level reached at the base EXP bonus, since the game draws
  the bonus on confirm, so the level shown is the lowest it can be.
- **The set reader is one function.** `getActiveArtifactSetBonuses` reaches each set's bonuses by its piece count, and
  `getArtifactSetAttributeLines` sums what it returns. The Artifacts tab's set-bonus block reads the same list.

## Scope

What works today and what this change adds:

- **Built now:** the three services, the set reader, the two tables read into `StatTables`, and the Artifacts panel's
  five slots, the picked slot's name, the picked artifact's stats, the set bonus lines and its actions, drawn by its
  fixture and worn variant in the visual suite, and the character screen's Artifacts tab, which passes the panel its
  words, slot names, stats and the set block's lines. Their tests are named in the change's tasks, and the existing
  character, kit and save suites cover what they share.
- **Not built, and why:** the panel's parity reference and approval (task 5.4), which waits on a browser run, and the
  bag moves' picker (task 6.2): equipping from the bag, unequipping to it and fodder taken from it. The bag holds each
  piece as an entry of its own with a unique `id` (task 6.1, landed on `eye` with the character-screen change), so the
  moves need only their services and the screen's wiring.

## Decisions

- **The screen returns, and the world reads the rarity and EXP tables back.** A worn artifact's enhancement needs
  `stats/artifactRarities` for its levels and affix levels, and `stats/artifactExpMaterials` for the EXP each material
  gives. Both are read by `readStatTables` now. The main affix curves are read for the main stat's value, and the main affix pools for the drop that rolls an artifact
  reads them. Rejected: deleting the path, since chest drops are being wired to roll artifacts into the bag, and a bag
  piece with nowhere to go is the gap this change closes.
- **Equip and unequip are pure services over the character.** The bag is written by the caller, so the services do not
  reach the chest drop path's files. Rejected: having the service put the displaced piece in the bag, since that writes
  an entry whose shape is not settled.
- **The panel names a slot by its index and holds no artifact model.** Its actions emit the index of the picked slot,
  and the host maps it to the character's artifact through these services, so the panel builds against the `Artifact`
  type rather than a view model of its own.
- **The set block shows the game's own set line for each bonus the worn set reaches.** `EQUIP_RELIC_SET_NUM` reads
  `{0}-Piece Set: {1}`, so one key carries the piece count and its effect, filled by `fillGameTextValues`. Rejected: a
  heading key for each piece count, which splits one sentence the game writes whole. The effect's words are the game's
  own description of the affix at that piece count, read from the names record by its text hash (`descriptionTextHash`),
  so the names builder collects them with no list change. A bonus whose words the names do not hold reads as an empty
  effect, and the block says none is active only while none is.
- **The stats lay out provisionally under the details pill.** The Details list's row pitch from the registered frame
  sets each row at 36 units, and the stats' five rows push the set bonus block down from 227 to 420 units. The registered
  frame shows no picked piece's stats, and the wiki's `File:Sanctifying Unction Artifact Interface.png` (page 56896,
  read through api.php, provisional) is behind a bot challenge the sandbox cannot pass, so the place is estimated and the
  parity measurement refines it.
- **The buttons take the artifact page's own words where it has them.** Enhance is `UI_EQUIP_PAGE_LEVEL_UP`, not the
  weapon's `UI_EQUIP_PAGE_LEVELUP_BUTTON` that `WeaponEnhance` keys, since the artifact's own member should not carry the
  weapon's name. Equip is `UI_EQUIP_BUTTON`, and Unequip the one exact "Unequip" the dump holds, the potion buff's remove
  button (see Notes).
- **A percentage affix is named by its flat attribute.** `ArtifactAffixGameTextKeyMap` labels `AttackPercent` as the flat
  ATK, `DefensePercent` as DEF and `HealthPercent` as Max HP, since the game's own names for the percentages are not keyed
  yet. Provisional until they are, and a percentage's value is shown with its percent sign either way.
- **Enhancing refuses on the Mora in the service.** The gate is in `enhanceCharacterArtifact` rather than left to the
  caller, as `enhanceWeapon` does, so a caller that forgets the check cannot spend Mora it does not hold. The wiki's
  Enhancing section says the same: one Artifact EXP costs one Mora except when recycling a leveled artifact, which the
  fodder's share of its own levelling already gives.

## Save change

None in this change. A worn artifact is saved in full already (`CharacterSave.artifacts`), so equipping and enhancing a
worn piece write nothing new. The bag's artifact entry takes the individual piece, a save change that belongs to the
character-screen agent's branch (`agent/w6-character-screen`), not to this one. This change builds against the `Artifact`
type `rollArtifact` returns and writes no second artifact model. Its dev backfill rule is that change's to state.

## Key files

| File                                                                           | Role                                                                                                                             |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/artifact/getArtifactSetAttributeLines.ts` | The attribute sum, now over the active set bonuses                                                                               |
| `packages/genshin-world/src/services/character/parseStatTables.ts`             | Parses the rarity and EXP tables beside the existing ones                                                                        |
| `packages/genshin-world/src/services/character/readStatTables.ts`              | Fetches the rarity and EXP tables by their keys                                                                                  |
| `packages/genshin-world/src/models/character/StatTables.ts`                    | Carries the rarity and EXP maps the enhancement reads                                                                            |
| `packages/genshin-world/src/models/character/RawStatTables.ts`                 | The two tables as they are fetched                                                                                               |
| `packages/genshin-world/src/services/artifact/enhanceArtifact.ts`              | Unchanged: the EXP, levels and affix levels a worn artifact gains                                                                |
| `packages/genshin-world/src/services/artifact/getAutoAddFodders.ts`            | The fodder Auto Add takes: unlocked artifacts up to the star cap, lowest star first, while the EXP falls short                   |
| `packages/genshin-world/src/services/artifact/getMaterialExperience.ts`        | The EXP the chosen enhancement ores give, each ore's EXP times its count                                                         |
| `packages/genshin-world/src/services/artifact/ItemIdExperienceMap.ts`          | The EXP each enhancement ore gives by item id, from the dump and the wiki                                                        |
| `packages/genshin-world/src/services/artifact/getEnhancementMoraCost.ts`       | Unchanged: the Mora an enhancement costs, checked before it runs                                                                 |
| `packages/genshin-interface/src/components/CharacterMenuArtifacts/Index.vue`   | The Artifacts panel: the slots, the picked slot's name, the stats, the set bonus block and the actions, in the shared button row |
| `packages/genshin-text/src/models/GameTextKey.ts`                              | The panel's eleven artifact members: the five slot names, the set block's heading, line and empty words, and the actions         |
| `packages/genshin-world/src/services/artifact/getArtifactSetBonusLines.ts`     | Each active set bonus as its line: the piece count and its effect's words filled into the game's set line                        |
| `packages/genshin-world/src/services/artifact/getArtifactDetailStats.ts`       | The picked artifact's main stat's name and its minor affixes' lines, in the Details list's form                                  |
| `packages/genshin-world/src/services/artifact/ArtifactAffixGameTextKeyMap.ts`  | Each attribute an artifact's affix raises, by the game's name for it, a percentage under its flat attribute's name               |
| `packages/genshin-world/src/models/artifact/ArtifactSetBonus.ts`               | A set bonus carries its effect's text hash beside its attribute lines                                                            |
| `scripts/src/services/genshinAssets/stats/getArtifactSetDatas.ts`              | Each bonus's effect text hash, read from its affix row at that piece count                                                       |
| `packages/genshin-world/src/services/artifact/ArtifactSlotGameTextKeyMap.ts`   | Each artifact slot by the game's name for it, read by the character screen                                                       |
| `packages/genshin-world/src/components/Character/Screen/Index.vue`             | The Artifacts tab's props: the labels, the slot names, the stats and the set block's lines, from the game text and the tables    |
| `packages/genshin-world/src/services/inventory/addInventoryItem.ts`            | The bag's add, which takes a dropped artifact in through `addInventoryArtifact`, landed on `eye` with task 6.1                   |
| `packages/genshin-world/src/services/save/toInventorySave.ts`                  | The bag's save of an artifact entry, landed on `eye` with task 6.1                                                               |

New files, as a tree:

```text
packages/genshin-world/src/
  models/artifact/ActiveArtifactSetBonus.ts
  models/artifact/ArtifactDetailStats.ts
  services/artifact/
    equipCharacterArtifact.ts          (+ .test.ts)
    unequipCharacterArtifact.ts        (+ .test.ts)
    enhanceCharacterArtifact.ts        (+ .test.ts)
    getActiveArtifactSetBonuses.ts     (+ .test.ts)
    getArtifactSetBonusLines.ts        (+ .test.ts)
    getArtifactDetailStats.ts          (+ .test.ts)
    ArtifactAffixGameTextKeyMap.ts
```

## Notes

- **A piece's identity moves from reference to instance id.** The three services find a piece by its object reference
  (`worn === displaced`, `worn === artifact`), which holds for the pieces one session holds. Once the instance id is on
  `Artifact`, those matches take the id, and equipping from the bag is built on it.
- **The wiki's "Artifact/Enhancement" page does not exist.** The fandom API answers `missingtitle` for it, so the enhancing
  rules are read from the Enhancing section of the [Artifact](https://genshin-impact.fandom.com/wiki/Artifact) page,
  and the EXP and Mora figures from the [Artifact EXP](https://genshin-impact.fandom.com/wiki/Artifact_EXP) page the
  artifact enhancement design already cites.
- **The Artifacts tab's buttons do nothing yet.** The character screen passes the panel its words, but Enhance, Equip and
  Unequip emit into nothing until the bag and fodder moves land, and Equip is disabled meanwhile.
- **The panel's Enhance and Unequip ids are provisional.** The dump's artifact page has no button word of its own for
  either. Enhance takes the equip page's level-up id, which the weapon page shares in its own name, and Unequip is the one
  exact "Unequip" in the dump, the potion buff's remove button. The reference frame checks both before the panel is
  approved, and a different id changes only the enum member's value.

## Sources

- [Artifact](https://genshin-impact.fandom.com/wiki/Artifact), Genshin Impact Wiki: equipping (one piece of each slot, the
  Switch menu), and the Enhancing section (Artifact EXP and Mora, the one-Mora-a-point cost, the next tier every fourth
  level).
- [Artifact EXP](https://genshin-impact.fandom.com/wiki/Artifact_EXP), Genshin Impact Wiki: the EXP each item gives and the
  bonus, as [artifact enhancement](../../specs/genshin/artifact-enhancement/design.md) already cites.
