## Purpose

The login towers, bridges and pillars, as built: each tower a lathe of its wall's profile carrying its traced surface, with columns and recesses where the wall stands out or sinks, and each bridge and pillar as its box.

## Requirements

### Requirement: Tower form from its wall

Each tower SHALL be a lathe of its wall's profile, so that its mouldings and cornices turn as the game's do, and it SHALL stand on its walls rather than on the tips of its columns and cornices (`packages/genshin-world/src/services/login/tower/createLoginTowersGeometry.ts`).

#### Scenario: Tower is shown

- **WHEN** a tower is shown
- **THEN** its mouldings and cornices turn as the game's do

### Requirement: Surface traced from the game's mesh

Each tower's surface SHALL be traced from the game's own mesh, with its carvings, gilding and open colonnades drawn over its stone, so that the sky shows through the open colonnades (`scripts/src/services/genshinAssets/fit/fitLoginTowerFacades.ts`, `packages/genshin-world/src/services/login/tower/createLoginTowerFacade.ts`).

#### Scenario: Colonnade

- **WHEN** the view passes a tower's open colonnade
- **THEN** the sky shows through between its columns (`packages/genshin-world/src/services/login/tower/createLoginTowersGeometry.ts`)

### Requirement: Stand-out parts built as columns

What stands out from a tower's wall, including ribs, pilasters, colonnade columns, emblems and balconies, SHALL be built as solid columns (`packages/genshin-world/src/services/login/tower/createLoginTowerSlabGeometry.ts`, `scripts/src/services/genshinAssets/fit/classifyFacadeCells.ts`).

#### Scenario: Column standing out

- **WHEN** a rib or colonnade column stands out from a wall
- **THEN** it is shown as a solid column (`packages/genshin-world/src/services/login/tower/createLoginTowerSlabGeometry.ts`)

### Requirement: Deep recesses cut open

Windows and bays that sink four units or more into the wall SHALL be cut open as recesses, while shallower panels and flutes stay painted (`scripts/src/services/genshinAssets/shared/constants.ts`).

#### Scenario: Window in a wall

- **WHEN** a window sinks four units or more into the wall
- **THEN** it is shown as an open recess (`packages/genshin-world/src/services/login/tower/createLoginTowersGeometry.ts`)

#### Scenario: Shallow panel

- **WHEN** a panel sinks less than four units into the wall
- **THEN** it stays painted on the wall (`scripts/src/services/genshinAssets/shared/constants.ts`)

### Requirement: Gilding takes the stone's colour

Gilding SHALL take the stone's colour, and no bump SHALL tilt the light at a recess's edge (`packages/genshin-world/src/services/login/tower/createLoginTowerFacade.ts`).

#### Scenario: Gilded detail

- **WHEN** a gilded detail is shown
- **THEN** it reads as the stone's colour (`packages/genshin-world/src/services/login/tower/createLoginTowerFacade.ts`)

## Open

- [ ] **The towers stand on their walls rather than on the tips of their columns and cornices, and their mouldings and cornices turn as the game's do** — no source yet: no profile comparison with the game is kept.
- [ ] **No bump tilts the light at a recess's edge** — no source yet: the material's bump setting is not read in the tower files.
