## Purpose

How a screen is shot and scored against its reference: the numbers first, FLIP as the approval number, and the committed scores that show what a change moved.

## Requirements

### Requirement: The comparison prints its numbers before its pictures

A comparison SHALL print the mean difference and a six by six grid of per-cell differences, and SHALL write the reference, the shot and their difference side by side (`scripts/src/services/genshinParity/reference/compareScreen.ts`, `scripts/src/services/genshinParity/commands/compareCommand.ts`).

#### Scenario: Comparison printed

- **GIVEN** a screen and its reference
- **WHEN** the screen is compared
- **THEN** the mean difference is printed (`scripts/src/services/genshinParity/reference/compareScreen.ts`)
- **AND** a six by six grid of per-cell differences is printed (`scripts/src/services/genshinParity/reference/compareScreen.ts`, `GRID_SIZE = 6`)
- **AND** the reference, the shot and their difference are written side by side (`scripts/src/services/genshinParity/commands/compareCommand.ts`)

### Requirement: A scene is scored by its shape and its tone apart

A scene rebuilt from shapes SHALL be scored by its shape and by its tone as two separate numbers, never as a pixel match (`scripts/src/services/genshinParity/reference/scoreStructure.ts`).

#### Scenario: Scene compared

- **GIVEN** a scene reference rebuilt from shapes
- **WHEN** the scene is compared
- **THEN** a shape score and a tone score are printed (`scripts/src/services/genshinParity/reference/scoreStructure.ts`)
- **AND** the scene is not scored as a pixel match (`scripts/src/services/genshinParity/reference/compareScreen.ts`)

#### Scenario: Layers scored apart

- **GIVEN** a scene compared with its witness render
- **WHEN** the comparison runs
- **THEN** each layer is scored apart with its own shape, tone, detail and mean perceptual difference (`scripts/src/services/genshinParity/reference/scoreLayers.ts`)

### Requirement: The perceptual score is the number a screen is approved by

A screen SHALL be approved by its perceptual difference score, with the mean difference reported beside it (`scripts/src/services/genshinParity/shared/scoreFlip.ts`, `scripts/src/services/genshinParity/reference/decideApproval.ts`).

#### Scenario: Approval judged

- **GIVEN** a screen compared with its reference
- **WHEN** the screen is judged for approval
- **THEN** the perceptual difference score is the number compared with the bar (`scripts/src/services/genshinParity/reference/decideApproval.ts`)
- **AND** the mean difference is printed beside it (`scripts/src/services/genshinParity/reference/compareScreen.ts`)

### Requirement: A reference scores only its own pixels

A comparison SHALL score only the region a reference names, the rectangles of its mask and the strokes of its silhouettes (`scripts/src/services/genshinParity/reference/readScoredMask.ts`, `scripts/src/services/genshinParity/shared/splitGlyph.ts`).

#### Scenario: Map name scored

- **GIVEN** a reference whose silhouettes name the letters of a map's name
- **WHEN** the reference is scored
- **THEN** only the letters' strokes are scored (`scripts/src/services/genshinParity/reference/readScoredMask.ts`)
- **AND** the painted terrain between the letters is not scored (`scripts/src/services/genshinParity/shared/computeGroundColour.ts`)

### Requirement: Each comparison rewrites its reference's committed row

Each comparison SHALL rewrite its reference's row of the committed scores, so that a change's diff shows what it moved on every screen (`scripts/src/services/genshinParity/reference/mergeParityScores.ts`, `scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`).

#### Scenario: Scores committed

- **GIVEN** a reference whose comparison has run
- **WHEN** the committed report is read
- **THEN** the reference's row holds the scores of that run (`scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`)

#### Scenario: Comparison fails

- **GIVEN** a reference whose comparison throws
- **WHEN** the comparisons run for all references
- **THEN** the reference's row is reported as failed (see Open)
- **AND** the run goes on (see Open)

### Requirement: A screen is never approved without a comparison to its reference

A screen SHALL NOT be approved unless it has been compared against a reference, and a test SHALL fail for any screen with a fixture that no entry of the reference map names. A screen with no reference yet MAY be named as pending, with the reason it has none, and a pending screen is unscored: `compare` scores none of it, and the committed report lists it as pending with that reason (`scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`, `scripts/src/services/genshinParity/reference/mergeParityScores.ts`).

#### Scenario: Screen with no entry

- **GIVEN** a screen whose fixture no entry of the reference map names
- **WHEN** the tests run
- **THEN** the test fails for that screen (`scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`)

#### Scenario: Pending screen

- **GIVEN** a screen whose entry is pending, with the reason it has no reference
- **WHEN** the tests run
- **THEN** the test passes for that screen (`scripts/src/services/genshinParity/shared/ParityReferenceMap.test.ts`)
- **AND** `compare` scores none of it (`scripts/src/services/genshinParity/reference/mergeParityScores.ts`)
- **AND** the committed report lists it as pending with its reason (`scripts/src/services/genshinParity/reference/mergeParityScores.ts`)

#### Scenario: Screen approved after comparison

- **GIVEN** a screen with a reference in the same language and build
- **WHEN** the screen is approved
- **THEN** the approval rests on that reference's comparison (`scripts/src/services/genshinParity/reference/decideApproval.ts`)

### Requirement: Cropped and other-language references are compared as they show

A public video that letterboxes the game SHALL be cropped to its screen, and a reference recorded in another language SHALL give its screen that language's words (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`).

#### Scenario: Letterboxed video

- **GIVEN** a public video that letterboxes the game
- **WHEN** its reference is compared
- **THEN** the video is cropped to the game's screen first (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`, `crop`)

#### Scenario: Reference in another language

- **GIVEN** a reference recorded in another language
- **WHEN** its screen is compared
- **THEN** the screen shows the game's words in that language (see Open)

## Open

- [ ] **A comparison that throws is reported as failed and the run goes on** — no source yet: the throw branch of `scripts/src/services/genshinParity/commands/compareCommand.ts` was not traced.
- [ ] **A reference in another language gives its screen that language's words** — no source yet: the parity page's language switch was not traced; `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` sets `props.language` only.
