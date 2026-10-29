## Purpose

How a screen is shot and scored against its reference: the numbers first, the approval measure as the number a screen's bar is set on, and the committed scores that show what a change moved.

## Requirements

### Requirement: The comparison prints its numbers before its pictures

A comparison SHALL print the mean difference and a six by six grid of per-cell differences, and SHALL write the reference, the shot and their difference side by side.

#### Scenario: Comparison printed

- **GIVEN** a screen and its reference
- **WHEN** the screen is compared
- **THEN** the mean difference is printed
- **AND** a six by six grid of per-cell differences is printed (`GRID_SIZE = 6`)
- **AND** the reference, the shot and their difference are written side by side

### Requirement: A scene is scored by its shape and its tone apart

A scene rebuilt from shapes SHALL be scored by its shape and by its tone as two separate numbers, never as a pixel match.

#### Scenario: Scene compared

- **GIVEN** a scene reference rebuilt from shapes
- **WHEN** the scene is compared
- **THEN** a shape score and a tone score are printed
- **AND** the scene is not scored as a pixel match

#### Scenario: Layers scored apart

- **GIVEN** a scene compared with its witness render
- **WHEN** the comparison runs
- **THEN** each layer is scored apart with its own shape, tone, detail and mean perceptual difference

### Requirement: The approval measure is the number a screen is set against its bar by

A screen SHALL be set against its bar by its approval measure, the mean difference unless its reference records FLIP, with both scores printed.

#### Scenario: Bar judged

- **GIVEN** a screen compared with its reference
- **WHEN** the screen's status against its bar is judged
- **THEN** the score of the reference's approval measure is the number compared with the bar
- **AND** the mean difference and FLIP are both printed

### Requirement: A reference scores only its own pixels

A comparison SHALL score only the region a reference names, the rectangles of its mask and the strokes of its silhouettes.

#### Scenario: Map name scored

- **GIVEN** a reference whose silhouettes name the letters of a map's name
- **WHEN** the reference is scored
- **THEN** only the letters' strokes are scored
- **AND** the painted terrain between the letters is not scored

### Requirement: Each comparison rewrites its reference's committed row

Each comparison SHALL rewrite its reference's row of the committed scores, so that a change's diff shows what it moved on every screen.

#### Scenario: Scores committed

- **GIVEN** a reference whose comparison has run
- **WHEN** the committed report is read
- **THEN** the reference's row holds the scores of that run

#### Scenario: Comparison fails

- **GIVEN** a reference whose comparison throws
- **WHEN** the comparisons run for all references
- **THEN** the reference's row is reported as failed
- **AND** the run goes on

### Requirement: A screen is never measured without a reference

A screen's measured values SHALL NOT be taken unless it has been compared against a reference, and a test SHALL fail for any screen with a fixture that no entry of the reference map names. A screen with no reference yet MAY be named as pending, with the reason it has none, and a pending screen is unscored: `compare` scores none of it, and the committed report lists it as pending with that reason.

#### Scenario: Screen with no entry

- **GIVEN** a screen whose fixture no entry of the reference map names
- **WHEN** the tests run
- **THEN** the test fails for that screen

#### Scenario: Pending screen

- **GIVEN** a screen whose entry is pending, with the reason it has no reference
- **WHEN** the tests run
- **THEN** the test passes for that screen
- **AND** `compare` scores none of it
- **AND** the committed report lists it as pending with its reason

#### Scenario: Screen compared with its reference

- **GIVEN** a screen with a reference in the same language and build
- **WHEN** the screen is compared
- **THEN** its status against the bar rests on that reference's comparison

### Requirement: A reference in another language is compared in its own words

A reference recorded in another language SHALL give its screen that language's words.

#### Scenario: Reference in another language

- **GIVEN** a reference recorded in another language
- **WHEN** its screen is compared
- **THEN** the screen shows the game's words in that language

## Open
