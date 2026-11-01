## Purpose

Genshin's ley line outcrops as built — each region's Blossom of Revelation and Blossom of Wealth read from the game's tables into genshin-world, opened by Adventure Rank and by a nation's unlocked area, started at a fitted place drawn at random from those no kind before it holds, and moved to the nearest free fitted place (`scripts/src/services/genshinAssets/leyLine/buildLeyLineRegions.ts`, `packages/genshin-world/src/services/leyLine/computeOutcropKindOpen.ts`, `packages/genshin-world/src/services/leyLine/computeDailyOutcrops.ts`, `packages/genshin-world/src/services/leyLine/computeNextOutcropPlace.ts`). Touching, fighting and claiming them is the proposal's still.

## Requirements

### Requirement: Two kinds per region

Each region's ley line SHALL offer two outcrop kinds, the Blossom of Revelation, which gives Character EXP materials, and the Blossom of Wealth, which gives Mora. The Revelation's reward preview gives its EXP fruits, and the Wealth's gives Mora (`{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/RewardPreviewExcelConfigData.json`, id 4001 at line 35642 and id 4101 at line 37702, with item 202 named Mora in `{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/MaterialExcelConfigData.json`).

#### Scenario: Seven cities each have both kinds

- **WHEN** the regions from Mondstadt to Snezhnaya are read
- **THEN** each has both kinds

#### Scenario: Other challenges read no kind

- **WHEN** the Dragonspine, Blitz Rush and Blossom Island refreshes are read
- **THEN** none of them yields a ley line kind

### Requirement: Opening by Adventure Rank

Each kind SHALL open at its own Adventure Rank.

#### Scenario: Mondstadt's Revelation opens at rank 8

- **WHEN** a player in Mondstadt reaches Adventure Rank 8
- **THEN** the Blossom of Revelation opens

#### Scenario: Mondstadt's Wealth opens at rank 12

- **WHEN** a player in Mondstadt reaches Adventure Rank 12
- **THEN** the Blossom of Wealth opens

#### Scenario: Liyue opens both kinds at rank 18

- **WHEN** a player in Liyue reaches Adventure Rank 18
- **THEN** both kinds open with no area condition

### Requirement: Opening by a nation's area

In every region except Mondstadt and Liyue, each kind SHALL also need a nation's area unlocked.

#### Scenario: Other regions wait for a nation's area

- **GIVEN** no nation's area is unlocked in Inazuma
- **WHEN** a player in Inazuma reaches Adventure Rank 18
- **THEN** its kinds stay closed

### Requirement: Start at a drawn fitted place

Each kind SHALL start, each daily draw, at a fitted place drawn at random from those no kind before it holds (`packages/genshin-world/src/services/leyLine/computeDailyOutcrops.ts` lines 23 to 27, `packages/genshin-world/src/services/leyLine/drawPlaceIds.ts` lines 6 to 14).

#### Scenario: Draw starts each kind

- **WHEN** the daily draw runs for a region with fitted places
- **THEN** each kind starts at a drawn fitted place, and no two kinds share one

#### Scenario: Region without fitted places

- **WHEN** the daily draw runs for a region with no fitted place
- **THEN** no outcrop starts

### Requirement: Moving on to the nearest free place

A claimed outcrop SHALL move to the nearest fitted place of its region that is neither its own nor the other kind's, the lower id winning a tie (`packages/genshin-world/src/services/leyLine/computeNextOutcropPlace.ts` lines 15 to 23).

#### Scenario: Nearest place is free

- **WHEN** an outcrop is claimed and a fitted place of its region is free
- **THEN** it moves to the nearest such place

#### Scenario: Other kind stands at the nearest place

- **WHEN** an outcrop is claimed and the other kind stands at the nearest fitted place
- **THEN** it moves to the next nearest free place

### Requirement: Staying where it is when no place is free

A claimed outcrop SHALL stay where it is when no fitted place of its region is left but its own and the other kind's (`packages/genshin-world/src/services/leyLine/computeNextOutcropPlace.ts` line 16 and lines 18 to 23, which give nothing when no place is left).

#### Scenario: No place is free

- **WHEN** an outcrop is claimed and no fitted place of its region is left but its own and the other kind's
- **THEN** it stays where it is until the daily reset

### Requirement: Daily reset at 04:00

The outcrops SHALL start over at the daily reset at 04:00 in the game's day.

#### Scenario: Reset starts the kinds over

- **WHEN** the game's day reaches 04:00
- **THEN** each kind starts over

### Requirement: Not yet placed in the world

Ley line outcrops SHALL not be placed, fought or claimed in the world yet.

#### Scenario: Entering a region

- **WHEN** a player enters a region with ley line kinds
- **THEN** no outcrop is drawn and no claim is offered
