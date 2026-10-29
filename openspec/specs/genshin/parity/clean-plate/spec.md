## Purpose

A reference drawn behind an interface is compared over a clean plate, its interface region filled from the pixels around it.

## Requirements

### Requirement: An interface over a scene is compared over its clean plate

A reference drawn behind an interface SHALL be compared over a clean plate whose scored region is filled from the pixels around it, so the game's interface does not count against the screen.

#### Scenario: Backdrop reference scored

- **GIVEN** a reference drawn behind an interface
- **WHEN** the reference is scored
- **THEN** its interface region is filled from the pixels around it
- **AND** each drawn piece is scored against what lies behind it

#### Scenario: Region covering the whole frame

- **GIVEN** a reference whose scored region covers the whole frame and names no pieces to fill
- **WHEN** the reference is scored
- **THEN** its frame is scored as it stands

#### Scenario: Named pieces filled in turn

- **GIVEN** a reference whose scored region covers the whole frame and names its pieces to fill
- **WHEN** the reference is scored
- **THEN** each named piece is filled from the pixels around it in turn
- **AND** the scene between the pieces stays as the frame draws it

### Requirement: Translucent glass is coloured from the scene behind it

Translucent glass drawn over a reference screenshot SHALL be coloured from the scene around it before the screen is scored (see Open).

#### Scenario: Prompt band over a reference screenshot

- **GIVEN** a translucent prompt band drawn over a reference screenshot
- **WHEN** the screen is scored
- **THEN** the band's colour is solved from the scene around it (see Open)
- **AND** the opaque pieces and their placements are scored as drawn

## Open

- [ ] **Translucent glass's colour is solved from the scene around it** — no source yet: no solver for translucent glass was found under `scripts/src/services/genshinParity` or `scripts/src/services/recreation`.
