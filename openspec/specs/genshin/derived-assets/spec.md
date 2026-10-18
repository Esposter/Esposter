## Purpose

Where each of the recreation's shapes, colours and glyphs comes from, and how it becomes ours. The interface is rebuilt from screenshots and recordings. The world is measured off the installed game's own assets, exported locally and never committed. A transform fits our own kits' parameters to each export, and only those parameters ship. The inventory tracks every component, its source and how far it has come.

## Requirements

### Requirement: Nothing the game draws ships

Every shape, colour and glyph the deployed recreation draws SHALL be built by our own code, never shipped from the game's own files.

#### Scenario: The deployed build holds no game export

- **GIVEN** a developer's local exports of the game's assets
- **WHEN** the deployed build is made
- **THEN** the build contains no game mesh, texture or material
- **AND** the world draws only our own stand-ins

### Requirement: The interface is measured from screenshots and recordings

The 2D interface SHALL be measured from screenshots and recordings, and each interface component SHALL be compared over the recording's own frame.

#### Scenario: An interface component is compared over its recording's frame

- **GIVEN** an interface component and the recording of its screen
- **WHEN** the component is compared
- **THEN** its score is taken over that recording's frame

#### Scenario: A screen drawn from atlases is measured from recordings

- **GIVEN** a game screen whose atlas names say little
- **WHEN** its glyph paths, sizes and colours are measured
- **THEN** they are read from the wiki's copies and public recordings of the screen

### Requirement: The world is measured from the installed game's own assets

A world part the game holds as an asset SHALL be measured from the game's exported mesh, texture or material, exported locally with the game closed.

#### Scenario: A world part is exported with the game closed

- **GIVEN** the game closed and installed on the developer's machine
- **WHEN** a world part is exported
- **THEN** the export is written to the developer's local reference folder

#### Scenario: A part the game holds no asset for is measured from captures

- **GIVEN** a light, haze or motion the game holds no asset for
- **WHEN** it is measured
- **THEN** it is measured from captures of the game

### Requirement: Only fitted parameters ship

A fit SHALL publish only the parameters our kits take, never a vertex, a pixel or a converted file of the game's.

#### Scenario: A fit publishes its record as parameters only

- **GIVEN** a completed fit
- **WHEN** its record is published
- **THEN** the record holds only parameters our kits take

#### Scenario: The exports stay out of the repository, the build and the deployment

- **GIVEN** exports held on the developer's machine
- **WHEN** the repository, the build or the deployment is produced
- **THEN** none of the exports is included

### Requirement: Each fit publishes under its own key

Each fit SHALL publish its record under its own key, so that a fit run alone replaces only its own records.

#### Scenario: A single fit replaces only its own records

- **GIVEN** a fit selected to run alone
- **WHEN** it runs
- **THEN** only its own records are replaced
- **AND** every other record keeps its key and content

#### Scenario: A dry run reports without publishing or writing

- **GIVEN** a fit selected for a dry run
- **WHEN** it runs
- **THEN** it reports what it would publish
- **AND** it sends no request
- **AND** it writes no world data file

### Requirement: A step that runs the game's exporter fails on any logged exception

A step that runs the game's exporter SHALL fail when the run logs an exception, even when the run exits cleanly.

#### Scenario: A clean exit with a logged exception fails the step

- **GIVEN** an export run that exits cleanly but logs an exception
- **WHEN** the step completes
- **THEN** the step fails

#### Scenario: A run with no logged exception passes the step

- **GIVEN** an export run that exits cleanly with no logged exception
- **WHEN** the step completes
- **THEN** the step passes

### Requirement: An index written without the offsets is refused until it is rewritten

An asset index written before it kept each asset's offset SHALL be refused by every search until it is rewritten.

#### Scenario: A search refuses an index without offsets

- **GIVEN** an asset index written before it kept each asset's offset
- **WHEN** a search reads it
- **THEN** the search is refused until the index is written again

### Requirement: An extraction records the code that produced it so stale output is visible

An extraction SHALL record the code revision that produced it, so that a later reader can see when that code has changed since.

#### Scenario: A reader reports output made before a later change to its producer

- **GIVEN** an extraction made before a later change to the code that produced it
- **WHEN** the world is read from it
- **THEN** the stale output is reported

### Requirement: The avatar write fails rather than draw a guessed pose

The avatar write SHALL fail, rather than draw a bone at a guessed rest pose, when a mesh's bind poses do not match its bones or a bone cannot be placed.

#### Scenario: A mesh whose bind poses do not match its bones fails the write

- **GIVEN** a mesh whose bind poses do not match its renderer's bones
- **WHEN** the avatar is written
- **THEN** the write fails

### Requirement: A setting no export names is measured from captures

A setting that no shape in the exports names SHALL be measured from captures of the game, not guessed from the blocks.

#### Scenario: A camera path set in a script is measured from a capture

- **GIVEN** a camera path set in a script the exports do not name
- **WHEN** its value is needed
- **THEN** it is measured from a capture of the game

### Requirement: The inventory lists every component with its source and status

The inventory SHALL list every component with its source and its status.

#### Scenario: A component is read from the inventory

- **GIVEN** a component in the scene
- **WHEN** the inventory is read
- **THEN** its source is shown
- **AND** its status is shown

### Requirement: A screen's motion is played from the game's exported clips

A screen's motion SHALL be played from the game's exported animation clips, not timed off a recording.

#### Scenario: A screen with exported clips plays their curves

- **GIVEN** a screen with exported animation clips
- **WHEN** its motion plays
- **THEN** the clips' sampled curves drive it
