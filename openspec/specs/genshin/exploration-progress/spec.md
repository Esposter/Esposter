## Purpose

The map's area labels show each area's exploration as the game's own line, its percentage, once a statue in it is unlocked, gold once the area is fully explored. Galesong Hill, where Windrise stands, is the first area counted, its waypoint the one doing done so far. The totals and the events each area counts are read from the game's table; the percentage's scale is provisional until a recording shows more than one step.

## Requirements

### Requirement: Area label is drawn once a landmark is unlocked

The map SHALL draw an area's label, with its exploration line, only once a landmark in that area is unlocked.

#### Scenario: Area with no unlocked landmark shows no label

- **GIVEN** no landmark in an area is unlocked
- **WHEN** the map is shown
- **THEN** that area's label is not drawn

#### Scenario: Area with an unlocked statue shows its percentage line

- **GIVEN** a statue in an area is unlocked (the wikitext in `{data-root}/cache/genshin-wiki/Page_Area.json` line 7 unlocks each area's part of the map upon its statue's activation, and `{data-root}/cache/genshin-wiki/Page_Statue_of_The_Seven.json` line 17 says a statue fills in its area of the map)
- **WHEN** the map draws the area's label
- **THEN** the label shows the game's exploration line under the area's name with its percentage
- **AND** no count is shown beside the percentage

### Requirement: Fully explored area shows its completed line in gold

The map SHALL show a fully explored area's line with the game's completed wording and its percentage in gold.

#### Scenario: Area at one hundred percent is drawn in gold

- **GIVEN** an area's progress is one hundred percent
- **WHEN** the map draws its label
- **THEN** the line uses the game's completed wording
- **AND** its percentage is coloured gold by the game's own colour tag

### Requirement: Percentage is rounded down and held at one hundred

The progress percentage SHALL be the done weight over the area's total, rounded down and never shown above one hundred.

#### Scenario: Done weight past the total reads one hundred

- **GIVEN** the done weight of an area is more than its total
- **WHEN** its percentage is computed
- **THEN** the percentage reads one hundred

#### Scenario: Partial progress is rounded down

- **GIVEN** the done weight is a share of the total that is not a whole percent
- **WHEN** its percentage is computed
- **THEN** the percentage is the whole percent below it

### Requirement: A doing adds its weight once however it is reached

An area's progress SHALL add the weight of each done doing a single time.

#### Scenario: Doing reached by two routes counts once

- **GIVEN** the same doing is reached by two routes
- **WHEN** the area's progress is computed
- **THEN** its weight is added once

### Requirement: An unlocked statue completes its area's waypoint

The progress SHALL count an unlocked statue as completing the waypoint doing of its own area, and no chest or camp, which count only once the save records them.

#### Scenario: Unlocked statue completes its area's waypoint

- **GIVEN** a statue in an area is unlocked
- **WHEN** the area's progress is computed
- **THEN** the area's waypoint doing is done (the Windrise statue is scene point 4, `scripts/src/services/genshinAssets/shared/DerivedAssetComponentMap.ts` lines 110 to 111; the Windrise place needs point 4 in `{data-root}/genshin-parity/text/ExcelBinOutput/ExpeditionDataExcelConfigData.json` lines 76 to 79; Galesong Hill's statue is in Windrise, `{data-root}/cache/genshin-wiki/Page_Statue_of_The_Seven.json` line 106; event 40, the only waypoint event of area 2, names point 4 at `{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/WorldAreaExploreEventConfigData.json` lines 471 to 476, and `packages/genshin-world/src/services/exploration/computeExploredDoingIds.ts` lines 15 to 20 completes it on the statue's unlock)

#### Scenario: Opening a chest leaves progress unchanged

- **GIVEN** a chest in an area is opened
- **WHEN** the area's progress is computed
- **THEN** the progress is unchanged

### Requirement: Progress counts camps, chests and waypoints only

The progress SHALL count only the camp, chest and waypoint events of an area, leaving out gathered items and forces entered.

#### Scenario: Gathered item adds no weight

- **GIVEN** the game's table lists an item gathered in an area
- **WHEN** the area's events are counted
- **THEN** the gathered item adds no weight

#### Scenario: Force entered adds no weight

- **GIVEN** the game's table lists a force entered in an area
- **WHEN** the area's events are counted
- **THEN** the force entered adds no weight

### Requirement: Mondstadt's level-one areas are read from the game's table

Exploration SHALL be counted for the four level-one areas of Mondstadt, Galesong Hill first, each area's total and counted events read from the game's table as the world opens.

#### Scenario: World opens with the Mondstadt slice

- **GIVEN** the Mondstadt exploration data is published
- **WHEN** the world opens
- **THEN** each of the four areas has its total and its counted events

#### Scenario: Slice that fails its check is logged

- **GIVEN** the published Mondstadt exploration data does not match its schema
- **WHEN** the world opens
- **THEN** the failure is logged
