## Purpose

The login towers, bridges and pillars, as built: each tower a lathe of its wall's profile carrying its traced surface, with columns and recesses where the wall stands out or sinks, and each bridge and pillar as its box.

## Requirements

### Requirement: Tower form from its wall

Each tower SHALL be a lathe of its wall's profile, so that its mouldings and cornices turn as the game's do, and it SHALL stand on its walls rather than on the tips of its columns and cornices.

#### Scenario: Tower is shown

- **WHEN** a tower is shown
- **THEN** its mouldings and cornices turn as the game's do

### Requirement: Surface traced from the game's mesh

Each tower's surface SHALL be traced from the game's own mesh, with its carvings, gilding and open colonnades drawn over its stone, so that the sky shows through the open colonnades.

#### Scenario: Colonnade

- **WHEN** the view passes a tower's open colonnade
- **THEN** the sky shows through between its columns

### Requirement: Stand-out parts built as columns

What stands out from a tower's wall, including ribs, pilasters, colonnade columns, emblems and balconies, SHALL be built as solid columns.

#### Scenario: Column standing out

- **WHEN** a rib or colonnade column stands out from a wall
- **THEN** it is shown as a solid column

### Requirement: Deep recesses cut open

Windows and bays that sink four units or more into the wall SHALL be cut open as recesses, while shallower panels and flutes stay painted.

#### Scenario: Window in a wall

- **WHEN** a window sinks four units or more into the wall
- **THEN** it is shown as an open recess

#### Scenario: Shallow panel

- **WHEN** a panel sinks less than four units into the wall
- **THEN** it stays painted on the wall

### Requirement: Gilding takes the stone's colour

Gilding SHALL take the stone's colour, and no bump SHALL tilt the light at a recess's edge.

#### Scenario: Gilded detail

- **WHEN** a gilded detail is shown
- **THEN** it reads as the stone's colour
