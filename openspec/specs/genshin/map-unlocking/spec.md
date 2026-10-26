## Purpose

The map filled in as the game fills it. A Statue of The Seven is resonated with on F, which fills its area in on the map and the minimap and unlocks it as a jump. Only unlocked statues are offered by the jump list, the map and a revive, and no statue is unlocked for a new player. A statue's first unlock pays its Primogems and Adventure EXP. A Teleport Waypoint unlocks the same way and pays its transport point's reward on its first unlock, and a domain entrance unlocks the same way as a landmark of the world (`packages/genshin-world/src/composables/useWorldMap.ts`, `packages/genshin-world/src/services/map/computeUnlockedJumpLandmarks.ts`).

## Requirements

### Requirement: Resonating unlocks a statue

A locked Statue of The Seven in reach SHALL be offered as a prompt row, and F on the selected row SHALL unlock it at once (`packages/genshin-world/src/components/World/Session/Index.vue`, `packages/genshin-world/src/composables/useWorldMap.ts`).

#### Scenario: Unlock a statue in reach

- **WHEN** the player is in reach of a locked statue and presses F on its row
- **THEN** the statue is unlocked immediately
- **AND** its row is no longer offered

#### Scenario: Unlocked statue offers no row

- **WHEN** the player is in reach of a statue already unlocked
- **THEN** no resonate row is offered for it

### Requirement: Nothing unlocked for a new player

A new player's world SHALL start with no statue unlocked, so the map is blank and no jump is offered (`packages/genshin-world/src/services/save/constants.ts`).

#### Scenario: New player opens the map

- **WHEN** a new player opens the map
- **THEN** the map is blank and no jump is offered

### Requirement: Unlocks last with the player's progress

Unlocked statues SHALL last across a reload, kept with the player's progress as the bag and the wallet are (`packages/genshin-world/src/models/save/GenshinSaveState.ts`, `packages/genshin-world/src/services/save/readGenshinSave.ts`).

#### Scenario: Reload keeps unlocks

- **GIVEN** the player has unlocked a statue
- **WHEN** the page reloads
- **THEN** the statue is still unlocked

### Requirement: Area fills while a landmark in it is unlocked

An area SHALL be filled on the map and the minimap while an unlocked landmark stands in it, and its name SHALL show only while it is filled (`packages/genshin-world/src/services/map/computeFilledAreaIds.ts`, `packages/genshin-world/src/services/map/computeAreaLabels.ts`, `packages/genshin-world/src/components/Map/Drawing/Index.vue`).

#### Scenario: Statue unlocked fills its area

- **WHEN** a statue is unlocked
- **THEN** its area's outline and name appear on the map and the minimap

### Requirement: Only unlocked places are jumps

The jump list, the map's marks and a revive SHALL use only unlocked landmarks (`packages/genshin-world/src/services/map/computeUnlockedJumpLandmarks.ts`), and a fallen party SHALL be taken to the unlocked landmark nearest its body.

#### Scenario: Party falls with an unlocked landmark

- **WHEN** the party falls and an unlocked landmark exists
- **THEN** it is taken to the unlocked landmark nearest its body

#### Scenario: Party falls with none unlocked

- **WHEN** the party falls and no landmark is unlocked
- **THEN** it is left where it fell (`packages/genshin-world/src/components/World/Session/Index.vue`)

### Requirement: First unlock pays Primogems

Windrise's statue SHALL pay five Primogems and fifty Adventure EXP on its first unlock and no more after (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/RewardExcelConfigData.json`, rewardId 220311, and `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/TransPointRewardConfigData.json`, sceneId 3 pointId 4).

#### Scenario: First unlock of Windrise's statue

- **WHEN** Windrise's statue is unlocked for the first time
- **THEN** five Primogems are added to the wallet and fifty Adventure EXP to the adventure rank

### Requirement: Waypoints unlock as statues do

A Teleport Waypoint SHALL be unlocked by resonating with it on F, as a statue is, and its first unlock SHALL pay the Primogems and Adventure EXP its transport point's reward row holds, once (`packages/genshin-world/src/composables/useWorldMap.ts`, `packages/genshin-world/src/services/transPoint/computeLandmarkPointId.ts`).

#### Scenario: Waypoint unlocked on F

- **WHEN** the player resonates with a Teleport Waypoint on F
- **THEN** the waypoint is unlocked and offered as a jump

#### Scenario: Waypoint's first unlock pays its point's reward

- **WHEN** a Teleport Waypoint whose transport point has a reward row is unlocked for the first time
- **THEN** the row's Primogems are added to the wallet and its Adventure EXP to the adventure rank

#### Scenario: Waypoint whose point has no reward row pays nothing

- **WHEN** a Teleport Waypoint whose transport point has no reward row is unlocked for the first time (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/TransPointRewardConfigData.json` has no row for points 1865 to 2051, the points of eleven Mondstadt waypoints)
- **THEN** nothing is added to the wallet or the adventure rank

#### Scenario: A later unlock pays nothing again

- **WHEN** a Teleport Waypoint that is already unlocked is unlocked again (`packages/genshin-world/src/composables/useWorldMap.ts`, which pays only when the landmark was not yet unlocked)
- **THEN** nothing is added to the wallet or the adventure rank

## Open

- [ ] **A fallen party is taken to the unlocked landmark nearest its body** — no source yet: the revive takes only the nearest unlocked Teleport Waypoint (`findNearestTeleportWaypoint`), since a statue takes no revive.
