## Purpose

A weapon levelled from enhancement ores and fodder weapons at ten points of EXP to a Mora, ascended at each phase's cap with that phase's Mora, items and Adventure Rank, and refined from rank 1 to 5 by a copy's ranks or a refinement material at each rank's Mora. The game's tables are read by the stats run, the rules are pure services over them (`packages/genshin-world/src/services/weapon/`), and the passives wait on the character kits.

## Requirements

### Requirement: Enhancement spends Mora at ten EXP per Mora

Enhancing a weapon SHALL spend one Mora for every ten points of paid EXP, and SHALL raise its level by the levels the EXP covers (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`, `packages/genshin-world/src/services/weapon/constants.ts`).

#### Scenario: Ore and fodder EXP

- **GIVEN** a weapon is enhanced with an ore and a fodder weapon
- **WHEN** the enhancement is applied
- **THEN** the paid EXP is the ore's EXP plus the fodder weapon's base EXP (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)
- **AND** Mora is spent at one per ten points of that EXP (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)

#### Scenario: Fodder weapon's invested EXP recovered

- **GIVEN** a fodder weapon was levelled before
- **WHEN** it is used as fodder
- **THEN** it gives its base EXP plus eighty percent of the EXP it was levelled with (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`, `FODDER_EXP_SHARE` in `packages/genshin-world/src/services/weapon/constants.ts`, see the open list)

#### Scenario: Wallet short of Mora refused

- **GIVEN** the wallet holds less Mora than the paid EXP costs
- **WHEN** the enhancement is applied
- **THEN** the enhancement is refused (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)
- **AND** nothing is spent (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)

### Requirement: EXP past the cap comes back as ores

EXP past a phase's level cap SHALL come back as the enhancement ores it fills, largest first, while Mora is still charged on all the paid EXP (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`).

#### Scenario: Excess returned as ores

- **GIVEN** a weapon reaches its phase's level cap with EXP left over
- **WHEN** the enhancement is applied
- **THEN** the leftover EXP is returned as the largest ores it fills (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)
- **AND** Mora is charged on all the paid EXP (`packages/genshin-world/src/services/weapon/enhanceWeapon.ts`)

### Requirement: Ascension at the level cap only

A weapon SHALL ascend only from its phase's level cap to the next phase, paying that phase's Mora, items and Adventure Rank (`packages/genshin-world/src/services/weapon/ascendWeapon.ts`, `packages/genshin-world/src/services/character/ascendToNextPhase.ts`).

#### Scenario: Ascension at the cap

- **GIVEN** a weapon is at its phase's level cap and the next phase exists
- **WHEN** it is ascended
- **THEN** the weapon moves to the next phase and stays at that level (`packages/genshin-world/src/services/character/ascendToNextPhase.ts`)
- **AND** the phase's Mora and items are taken (`packages/genshin-world/src/services/character/ascendToNextPhase.ts`)

#### Scenario: Below the cap refused

- **GIVEN** a weapon is below its phase's level cap
- **WHEN** it is ascended
- **THEN** the ascension is refused (`packages/genshin-world/src/services/character/ascendToNextPhase.ts`)

#### Scenario: Adventure Rank too low

- **GIVEN** the player's Adventure Rank is below the next phase's requirement
- **WHEN** the weapon is ascended
- **THEN** the ascension is refused (`packages/genshin-world/src/services/character/ascendToNextPhase.ts`)
- **AND** nothing is taken

#### Scenario: Bag missing an item

- **GIVEN** the bag lacks one of the next phase's items
- **WHEN** the weapon is ascended
- **THEN** the ascension is refused (`packages/genshin-world/src/services/character/ascendToNextPhase.ts`)
- **AND** nothing is taken

### Requirement: Refinement adds ranks at each rank's Mora up to five

A copy or a refinement material SHALL add its ranks, each rank gained costing the Mora its rank asks, and a weapon SHALL stop at refinement rank five (`packages/genshin-world/src/services/weapon/refineWeapon.ts`, `MAX_WEAPON_REFINEMENT` in `packages/genshin-world/src/services/weapon/constants.ts`).

#### Scenario: Ranks of a three-star weapon

- **GIVEN** a three-star weapon at rank one
- **WHEN** it is refined to rank five
- **THEN** ranks two to five cost five hundred, one thousand, two thousand and four thousand Mora (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/WeaponExcelConfigData.json`, `packages/genshin-world/src/services/weapon/refineWeapon.ts`)

#### Scenario: Ranks past five lost

- **GIVEN** a refinement would take a weapon past rank five
- **WHEN** it is refined
- **THEN** the ranks past five are lost (`packages/genshin-world/src/services/weapon/refineWeapon.ts`)
- **AND** the result counts the ranks lost (`packages/genshin-world/src/services/weapon/refineWeapon.ts`)

#### Scenario: Weapon at rank five refused

- **GIVEN** a weapon is already at rank five
- **WHEN** it is refined
- **THEN** the refinement is refused (`packages/genshin-world/src/services/weapon/checkCanRefineWeapon.ts`)

### Requirement: One- and two-star weapons never refined

One-star and two-star weapons SHALL never be refined, and a four-star weapon the table gives no refinement costs SHALL never be refined either (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/WeaponExcelConfigData.json`, `packages/genshin-world/src/services/weapon/checkCanRefineWeapon.ts`).

#### Scenario: Two-star weapon refused

- **GIVEN** a two-star weapon
- **WHEN** a copy or a refinement material is used on it
- **THEN** the refinement is refused (`packages/genshin-world/src/services/weapon/checkCanRefineWeapon.ts`)

### Requirement: Only a bag weapon can be a copy or material

A copy or a refinement material SHALL come only from the bag, never from a weapon a character is wielding (`packages/genshin-world/src/models/character/Character.ts`).

#### Scenario: Wielded weapon not used as a copy

- **GIVEN** a weapon is wielded by a character
- **WHEN** a copy of it is sought for refinement
- **THEN** the wielded weapon is not offered as a copy (`packages/genshin-world/src/models/character/Character.ts`)

## Open

- [ ] **Ten points of EXP cost one Mora, and a fodder gives back 80%** — no source yet: the wiki's Weapon EXP page is not in `~/Esposter.noindex/cache/genshin-wiki/`, and the stats tables opened here state neither rate.
- [ ] **A copy adds its own rank, a material adds one, and the ranks past the fifth are lost** — no source yet: the wiki's Refinement page is not in `~/Esposter.noindex/cache/genshin-wiki/`, and no table opened here states the refinement rule.
