## Purpose

The witness draws the game's exports through our scene, so a camera, a layout and a stand-in can be priced against the game's data.

## Requirements

### Requirement: A witness render draws the exports through our own scene

A witness render SHALL draw the game's exports in place of our parts, under our own camera, light and frame, so that a stand-in is priced against the game's own data.

#### Scenario: Witness render drawn

- **GIVEN** a component with a witness render
- **WHEN** the render is drawn
- **THEN** the game's exports are drawn in place of our parts
- **AND** they are drawn under our camera, light and frame

### Requirement: Textures are sampled as the game samples them

The exports' textures SHALL be sampled tiled and anisotropically along a grazing line of sight, as the game samples them.

#### Scenario: Far surface at a grazing angle

- **GIVEN** a far surface seen along a grazing line of sight
- **WHEN** its texture is sampled
- **THEN** the sample is tiled and anisotropic along the line of sight

### Requirement: The page fetches only the meshes a family draws

The witness page SHALL fetch only the meshes a family draws and each texture their materials name, each texture once.

#### Scenario: Capital's exports loaded

- **GIVEN** a capital whose exports hold many meshes no family draws
- **WHEN** its witness is loaded
- **THEN** only the meshes a family draws are fetched
- **AND** each texture their materials name is fetched once

### Requirement: The pose is solved from landmarks against the reference's pixels

The camera pose SHALL be solved from landmarks whose places are known, against the pixels the reference gives them, with each landmark's reprojection error printed.

#### Scenario: Six or more landmarks

- **GIVEN** six or more landmarks
- **WHEN** the pose is solved
- **THEN** the projection is read in closed form
- **AND** the reprojection error of each landmark is printed

#### Scenario: Fewer than six landmarks

- **GIVEN** fewer than six landmarks
- **WHEN** the pose is solved
- **THEN** the field of view is held at one read from the two widths
- **AND** the reprojection error of each landmark is printed

### Requirement: Pose refinement uses only the chosen families' silhouettes

The pose refinement SHALL measure only the silhouettes of the chosen families, so that clouds, which draw no part, cannot pull it.

#### Scenario: Clouds in the frame

- **GIVEN** a frame with clouds that draw no part
- **WHEN** the pose is refined
- **THEN** only the chosen families' silhouettes are measured against the reference's edges
- **AND** the clouds do not pull the pose

### Requirement: Seams between one family's parts are left out of refinement

The refinement SHALL leave out the seams between one family's parts, since the reference draws them as cracks or not at all.

#### Scenario: Seam between two parts

- **GIVEN** a seam between two parts of one family
- **WHEN** the pose is refined
- **THEN** the seam is left out of the measurement

### Requirement: Parts in one frame share one camera

The parts in one frame SHALL share one camera, and an axis that one part's landmarks barely fix SHALL be taken from a part that fixes it.

#### Scenario: Axis barely fixed by one part

- **GIVEN** a part whose landmarks barely fix one axis of the camera
- **WHEN** the camera is solved for the frame
- **THEN** that axis is taken from a part whose landmarks fix it

### Requirement: A witness render settles in one frame

A witness render SHALL settle in one frame, so that the same view draws the same frame.

#### Scenario: Same view drawn twice

- **GIVEN** a view set on the witness
- **WHEN** the view is drawn twice
- **THEN** the same frame is drawn both times

### Requirement: A row stands where the exports lay it

A scrolling row SHALL stand where the exports lay it, with only its phase along the glide taken from the reference.

#### Scenario: Row phase taken from the reference

- **GIVEN** a scrolling row and a reference showing its parts
- **WHEN** the row is placed
- **THEN** the row stands where the exports lay it
- **AND** only its phase along the glide is read from the reference

### Requirement: The glide's pace is read from a repeating landmark

The pace of a glide SHALL be read from a repeating landmark's crossings of a column, paired with the crossing a known number of repeats later.

#### Scenario: Pace read from crossings

- **GIVEN** a repeating landmark crossing a column of a recording at two known repeats apart
- **WHEN** the pace is read
- **THEN** the pace is read over the time between the two crossings
- **AND** each crossing's time is the recording's own frame time
