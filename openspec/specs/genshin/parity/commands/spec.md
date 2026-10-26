## Purpose

The `genshin:parity` commands, what each does, and the parity page's own command.

## Requirements

### Requirement: Every parity command explains its own usage

Each parity command SHALL print its own usage when help is asked for, and the parity page SHALL be started from the world package as its own command (`scripts/src/services/genshinParity/commands/genshinParityCommand.ts`, `packages/genshin-world/package.json`).

#### Scenario: Help asked for a command

- **GIVEN** an operator asks for the help of a parity command
- **WHEN** the help is printed
- **THEN** the command's own usage is shown (`scripts/src/services/genshinParity/commands/genshinParityCommand.ts`)

#### Scenario: Parity page started

- **GIVEN** an operator is in the world package
- **WHEN** the parity page is started
- **THEN** the page is served for screens to be shot on it (`packages/genshin-world/package.json`, `"parity": "vite --config parity/vite.config.ts"`)

### Requirement: Compare shoots and scores a screen against its reference

The compare command SHALL shoot a screen, print its scores, and write the reference, the shot and their difference side by side, with the screen's row in the committed report (`scripts/src/services/genshinParity/commands/compareCommand.ts`, `scripts/src/services/genshinParity/reference/compareScreen.ts`).

#### Scenario: One screen compared

- **GIVEN** a reference whose images are on disk
- **WHEN** the operator runs compare on that reference
- **THEN** the mean difference and a grid of per-cell differences are printed (`scripts/src/services/genshinParity/reference/compareScreen.ts`)
- **AND** the reference, the shot and their difference are written side by side (`scripts/src/services/genshinParity/commands/compareCommand.ts`)
- **AND** the reference's row in the committed report is rewritten (`scripts/src/services/genshinParity/commands/compareCommand.ts`)

#### Scenario: Images not on disk

- **GIVEN** a reference whose images are not on disk yet
- **WHEN** the operator runs compare for all references
- **THEN** that reference keeps its row in the committed report (see Open)

#### Scenario: Comparison that throws

- **GIVEN** a reference whose comparison throws
- **WHEN** the operator runs compare for all references
- **THEN** that reference is reported as failed (see Open)
- **AND** the run goes on to the remaining references (see Open)

### Requirement: Approve writes a screen's image only once it clears its bar

The approve command SHALL write a screen's visual image only when its comparison is under the screen's own approval bar (`scripts/src/services/genshinParity/commands/approveCommand.ts`, `scripts/src/services/genshinParity/reference/decideApproval.ts`).

#### Scenario: Comparison under the bar

- **GIVEN** a reference whose comparison is under its screen's approval bar
- **WHEN** the operator runs approve on that reference
- **THEN** the visual suite writes the image for that screen alone (`scripts/src/services/genshinParity/commands/approveCommand.ts`)

#### Scenario: Comparison over the bar

- **GIVEN** a reference whose comparison is over its screen's approval bar
- **WHEN** the operator runs approve on that reference
- **THEN** no image is written (`scripts/src/services/genshinParity/reference/decideApproval.ts`)
- **AND** the refusal names its reason (`scripts/src/services/genshinParity/reference/decideApproval.ts`)
- **AND** the comparison's row is still written (see Open)

### Requirement: Witness commands draw the game's exports under our camera

The witness commands SHALL draw a component's game exports under our camera, light and frame, so each stand-in can be checked against the exports it stands for (`scripts/src/services/genshinParity/commands/gbufferCommand.ts`, `scripts/src/services/genshinParity/commands/overlayCommand.ts`, `scripts/src/services/genshinParity/commands/viewCommand.ts`).

#### Scenario: Settled frame written

- **GIVEN** a component with a witness render
- **WHEN** the operator runs gbuffer on its reference
- **THEN** the depth, the world normal, the unlit colour and the part of each pixel are written for one settled frame (`scripts/src/services/genshinParity/commands/gbufferCommand.ts`)

#### Scenario: Family boundaries over the reference

- **GIVEN** a component with a witness render
- **WHEN** the operator runs overlay on its reference
- **THEN** the boundaries of its families are drawn over the reference (`scripts/src/services/genshinParity/commands/overlayCommand.ts`)
- **AND** each family's distance from the reference's edges is printed (`scripts/src/services/genshinParity/commands/overlayCommand.ts`)

#### Scenario: Scene from any camera

- **GIVEN** a camera position and view given to the view command
- **WHEN** the operator runs view
- **THEN** our parts are drawn beside the exports they stand for, from that camera (`scripts/src/services/genshinParity/commands/viewCommand.ts`)

### Requirement: Pose solves the camera from the reference's landmarks

The pose command SHALL solve the camera from the reference's landmarks and print each landmark's reprojection error, and SHALL write a pose only when it lies within the reference's pose bar (`scripts/src/services/genshinParity/commands/poseCommand.ts`, `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`, `poseBar: 7.5`).

#### Scenario: Pose solved and printed

- **GIVEN** a reference with landmarks
- **WHEN** the operator runs pose on it
- **THEN** the camera is solved from the landmarks (`scripts/src/services/genshinParity/commands/poseCommand.ts`)
- **AND** each landmark's reprojection error is printed (`scripts/src/services/genshinParity/commands/poseCommand.ts`)

#### Scenario: Pose outside the bar not written

- **GIVEN** a solved pose outside the reference's pose bar
- **WHEN** the operator runs pose with the write option
- **THEN** the pose is not written (`scripts/src/services/genshinParity/commands/poseCommand.ts`, `scripts/src/services/genshinParity/witness/getPoseBar.ts`)

### Requirement: Track and scroll follow a recording's motion

The track command SHALL solve the pose at each sampled frame of a recording, and the scroll command SHALL print how far a scene's scrolling rows stand from where the reference shows them.

#### Scenario: Pose tracked through a recording

- **GIVEN** a reference recording and a time window
- **WHEN** the operator runs track over that window
- **THEN** the pose is solved at each sampled frame (`scripts/src/services/genshinParity/commands/trackCommand.ts`)
- **AND** each pose is refined from the frame before (`scripts/src/services/genshinParity/commands/trackCommand.ts`)

#### Scenario: Scrolling rows measured

- **GIVEN** a scene with scrolling rows and a reference of its state
- **WHEN** the operator runs scroll
- **THEN** how far the rows stand from the reference is printed (`scripts/src/services/genshinParity/commands/scrollCommand.ts`)

### Requirement: Audio commands score the login's music against the game's sound

The listen command SHALL score the login's music against the game's own sound segment by segment, and the notes command SHALL publish the music record once the game's sound holds its notes (`scripts/src/services/genshinParity/commands/listenCommand.ts`, `scripts/src/services/genshinParity/commands/notesCommand.ts`).

#### Scenario: Music scored by segment

- **GIVEN** the login's music and the game's decoded sound
- **WHEN** the operator runs listen
- **THEN** pitch agreement and each octave band's distance in decibels are written for each segment (`scripts/src/services/genshinParity/shared/ParityMusicScores.snapshot.md`)
- **AND** each band's signed bias is written beside them (`scripts/src/services/genshinParity/shared/ParityMusicScores.snapshot.md`)

#### Scenario: Notes the game does not hold dropped

- **GIVEN** a fit whose first expression has run
- **WHEN** the operator runs notes
- **THEN** every note the game's sound does not hold is dropped (`scripts/src/services/genshinParity/commands/notesCommand.ts`)
- **AND** the music record is published (`scripts/src/services/genshinParity/commands/notesCommand.ts`)

### Requirement: Recording commands capture the installed game without driving it

The launch, still and record commands SHALL start the game, capture its window once, or record its window, and a recording SHALL end after two minutes unless the operator sets another length (`scripts/src/services/genshinParity/commands/recordCommand.ts`, `scripts/src/services/genshinParity/game/captureGame.ts`).

#### Scenario: Recording with the default length

- **GIVEN** the game's window is open
- **WHEN** the operator runs record without a length
- **THEN** the recording ends after two minutes (`scripts/src/services/genshinParity/shared/constants.ts`, `RECORD_DEFAULT_SECONDS`)

#### Scenario: Game minimised during a recording

- **GIVEN** a recording is running
- **WHEN** the game is minimised and gives no frames
- **THEN** the recording ends by the clock at its length in real time (see Open)

### Requirement: Image commands report what they read from a reference or capture

The measure, zoom, luma, frames, polar and trace commands SHALL read an image, a folder of frames or a capture and report what they read (`scripts/src/services/genshinParity/commands/measureCommand.ts`, `scripts/src/services/genshinParity/commands/zoomCommand.ts`, `scripts/src/services/genshinParity/commands/lumaCommand.ts`, `scripts/src/services/genshinParity/commands/framesCommand.ts`, `scripts/src/services/genshinParity/commands/polarCommand.ts`, `scripts/src/services/genshinParity/commands/traceCommand.ts`).

#### Scenario: Luma curve across images

- **GIVEN** a region of several images or a folder of frames
- **WHEN** the operator runs luma on that region
- **THEN** the region's darkness is printed as a curve across the images (`scripts/src/services/genshinParity/commands/lumaCommand.ts`)

#### Scenario: Glyph traced

- **GIVEN** a glyph within a region of a mark
- **WHEN** the operator runs trace on that region
- **THEN** the glyph is written as one path (`scripts/src/services/genshinParity/commands/traceCommand.ts`)
- **AND** the region is written beside it for checking (`scripts/src/services/genshinParity/commands/traceCommand.ts`)

### Requirement: Passes run a component's measures in order and stop at the first failure

The passes command SHALL run a component's measures in order against their gates, stop at the first measure that fails or has none yet, and rewrite the component's report (`scripts/src/services/genshinParity/commands/passesCommand.ts`, `scripts/src/services/genshinParity/passes/runParityPasses.ts`, `scripts/src/services/genshinParity/passes/snapshots/`).

#### Scenario: Failing measure ends the run

- **GIVEN** a component whose measure fails at some pass
- **WHEN** the operator runs passes on the component
- **THEN** the run stops at that pass (`scripts/src/services/genshinParity/passes/runParityPasses.ts`)
- **AND** the component's report shows the failure (`scripts/src/services/genshinParity/passes/snapshots/`)

#### Scenario: Pass with nothing owed

- **GIVEN** a component with no game sound matched to it
- **WHEN** the operator runs passes on the component
- **THEN** the audio pass is printed as not owed (`scripts/src/services/genshinParity/passes/runParityPasses.ts`)
- **AND** the run goes on past it (`scripts/src/services/genshinParity/passes/runParityPasses.ts`)

#### Scenario: One pass run up to its place in the order

- **GIVEN** a component with a named pass
- **WHEN** the operator runs passes with that pass named
- **THEN** the passes before it are measured in order, and the run stops at the first still open (`scripts/src/services/genshinParity/passes/runParityPasses.ts`)
- **AND** only the rows of the passes run are rewritten (see Open)

### Requirement: Analysis commands rank and solve what separates the render from the reference

The analysis commands SHALL rank each term of a frame's error by the most it could recover, and SHALL solve the sky's cover, the haze, the sun's direction and the white balance from the reference's pixels (`scripts/src/services/genshinParity/commands/rankCommand.ts`, `scripts/src/services/genshinParity/commands/coverCommand.ts`, `scripts/src/services/genshinParity/commands/planCommand.ts`).

#### Scenario: Error terms ranked

- **GIVEN** a reference and a witness render of its component
- **WHEN** the operator runs rank
- **THEN** each term of the frame's error is listed with the most of the frame's error it could recover (`scripts/src/services/genshinParity/commands/rankCommand.ts`)

#### Scenario: Cloud cover solved per band

- **GIVEN** one or more references at their hours
- **WHEN** the operator runs cover
- **THEN** each cloud band's share at each reference's hour is solved (`scripts/src/services/genshinParity/commands/coverCommand.ts`)

#### Scenario: Surface plan drawn from above

- **GIVEN** a family and a rectangle of the ground
- **WHEN** the operator runs plan
- **THEN** the family's unlit colour is written from straight above over the rectangle, in metres (`scripts/src/services/genshinParity/commands/planCommand.ts`)

## Open

- [ ] **compare keeps a reference's row when its images are missing, and reports a throwing one as failed** — no source yet: the missing-image and throw branches of `scripts/src/services/genshinParity/commands/compareCommand.ts` were not traced.
- [ ] **A refused approval still writes the comparison's row** — no source yet: `decideApproval.ts` and `approveCommand.ts` show the refusal, not a row write.
- [ ] **A minimised game ends a recording by the clock** — no source yet: `scripts/src/services/genshinParity/game/captureGame.ts` has no minimised-window branch.
- [ ] **Passes rewrite only the rows of the passes run** — no source yet: `scripts/src/services/genshinParity/passes/runParityPasses.ts` was not traced to its row writes.
