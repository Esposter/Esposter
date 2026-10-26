## Purpose

A reference drawn behind an interface is compared over a clean plate, its interface region filled from the pixels around it.

## Requirements

### Requirement: An interface over a scene is compared over its clean plate

A reference drawn behind an interface SHALL be compared over a clean plate whose scored region is filled from the pixels around it, so the game's interface does not count against the screen (`scripts/src/services/genshinParity/reference/getCleanPlatePath.ts`, `scripts/src/services/recreation/image/fillRegionHarmonically.ts`).

#### Scenario: Backdrop reference scored

- **GIVEN** a reference drawn behind an interface
- **WHEN** the reference is scored
- **THEN** its interface region is filled from the pixels around it (`scripts/src/services/genshinParity/reference/getCleanPlatePath.ts`)
- **AND** each drawn piece is scored against what lies behind it (`scripts/src/services/genshinParity/reference/compareScreen.ts`)

#### Scenario: Region covering the whole frame

- **GIVEN** a reference whose scored region covers the whole frame and names no pieces to fill
- **WHEN** the reference is scored
- **THEN** its frame is scored as it stands (`scripts/src/services/genshinParity/reference/getCleanPlatePath.ts`)

#### Scenario: Named pieces filled in turn

- **GIVEN** a reference whose scored region covers the whole frame and names its pieces to fill
- **WHEN** the reference is scored
- **THEN** each named piece is filled from the pixels around it in turn (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`)
- **AND** the scene between the pieces stays as the frame draws it (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`)

### Requirement: Translucent glass is coloured from the scene behind it

Translucent glass drawn over a recording SHALL be coloured from the scene around it before the screen is scored (see Open).

#### Scenario: Prompt band over a recording

- **GIVEN** a translucent prompt band drawn over a recording
- **WHEN** the screen is scored
- **THEN** the band's colour is solved from the scene around it (see Open)
- **AND** the opaque pieces and their placements are scored as drawn (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`)

### Requirement: A capture is compared untagged

A captured frame SHALL be written for comparison without the colour tags its file states, so a browser does not colour-manage it a second time and draw it darker than its file (`scripts/src/services/genshinParity/shared/writeCaptureFrame.ts`).

#### Scenario: Tagged capture written untagged

- **GIVEN** a capture whose file is tagged with its gamma and primaries
- **WHEN** the frame is written for comparison
- **THEN** the frame is untagged (`scripts/src/services/genshinParity/shared/writeCaptureFrame.ts`)
- **AND** its brightness matches the darkness of its file (see Open)

## Open

- [ ] **Translucent glass's colour is solved from the scene around it** — no source yet: no solver for translucent glass was found under `scripts/src/services/genshinParity` or `scripts/src/services/recreation`.
- [ ] **A written frame's brightness matches its file** — no source yet: no brightness comparison of a written frame against its tagged file was run.
