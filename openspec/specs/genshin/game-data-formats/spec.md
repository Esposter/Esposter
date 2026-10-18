## Purpose

How each kind of the game's data reads once the community's asset extractor has exported it, as decoded while deriving the login scene, and how its audio reads from the installed packages, and where a component records the data it is derived from. Shaders keep their compiled programs as plain binary containers with their constant layouts beside them; a UI element's anchors sit in its transform's raw tail; an animation clip is streamed cubic segments bound by hashes; a renderer names its materials by path ID; a scene's scripts export without their fields; and the open world is streamed, its placements mask-led varint records in blobs named by their path's hash and each tile's ground a terrain record. The shortcuts section is what to reach for first, so no session derives any of it again.

## Requirements

### Requirement: Game files stay local and are never shipped

Game files read for derivation SHALL stay on the developer's machine, and SHALL NOT be shipped with the product or committed to the repository. The one exception is game text: its strings and dialogue SHALL be committed as the generated slices the package that reads them loads.

#### Scenario: Derived assets publish only derived values

- **GIVEN** a derived asset is published
- **WHEN** a reviewer checks what the publish contains
- **THEN** only derived values are present and no game file is included

#### Scenario: Game text slices are committed, binaries are not

- **GIVEN** the repository is checked for game-derived files
- **WHEN** a reviewer lists them
- **THEN** the text slices of `genshin-text` and the persona plugin are present, and no image, audio, model, mesh or table is

#### Scenario: Missing community table is fetched locally, never committed

- **GIVEN** a builder needs a table the community dump does not hold
- **WHEN** the builder runs
- **THEN** the table is fetched into the local dump and is not committed

### Requirement: A reader of a changed layout fails rather than guessing

A reader of a game data structure whose layout no longer matches its expected fields SHALL fail with an error rather than name the wrong values.

#### Scenario: Later build moves the camera config

- **GIVEN** a later game build moves a config the reader names by its fields
- **WHEN** the reader reads that config
- **THEN** the reader throws an error and returns no values

### Requirement: Every derived value names its source

A derived value SHALL name the key of the source it is taken from, so that any value can be traced back to the game data it came from.

#### Scenario: Source of a derived value can be opened again

- **GIVEN** a component's derived value is in use
- **WHEN** a reviewer follows the value's key
- **THEN** the source it was derived from can be opened again

### Requirement: Every investigation is recorded with its outcome

Every investigation of a derived component's data SHALL be recorded with its method, its result and its outcome, so that a dead end or a rejected change is not run again.

#### Scenario: Search that found nothing is kept as a dead end

- **GIVEN** a search of the game data found nothing
- **WHEN** the investigation is recorded
- **THEN** it is kept with the outcome dead end

#### Scenario: Change turned down is kept as rejected

- **GIVEN** a change was tried and turned down
- **WHEN** the investigation is recorded
- **THEN** it is kept with the outcome rejected

### Requirement: A prefab no name source names is counted, never left out

A prefab that no name source names SHALL be counted with its placements rather than left out quietly.

#### Scenario: Unnamed prefab is reported with its placements

- **GIVEN** a prefab's path cannot be named from any source
- **WHEN** the open world is extracted
- **THEN** the prefab is counted with its placements in the report

### Requirement: Shader programs are named by their pass and stage where readable

Compiled shader programs SHALL be named by their pass, stage and keyword set where their layout can be read, and kept unnamed where it cannot.

#### Scenario: Program with a readable layout is named

- **GIVEN** a shader's serialized form can be read
- **WHEN** its programs are read
- **THEN** each program is named by its pass, stage and keyword set

#### Scenario: Shader with an unfollowed layout keeps its programs unnamed

- **GIVEN** a shader's layout is not one the reader follows
- **WHEN** its programs are read
- **THEN** its programs are carved out unnamed

### Requirement: A script field is read by its shape or measured

A script's serialized field SHALL be read by the shape of its value, and any value no shape names SHALL be measured against the captures rather than guessed.

#### Scenario: Field with no known shape is measured

- **GIVEN** a script's field matches no known shape
- **WHEN** the field is read
- **THEN** its value is measured off the captures rather than guessed

### Requirement: Sounds with no name are identified by matching a recording

A sound that has no name SHALL be identified by matching a recording against the sounds the game holds, rather than by a name.

#### Scenario: Recording is matched to its sound

- **GIVEN** a recording of a sound with no name
- **WHEN** the recording is matched
- **THEN** the sound it plays is identified from the game's sounds

### Requirement: A bytecode number with no known meaning stays unknown

A bytecode operation number whose meaning is not determined SHALL be reported as unknown rather than guessed.

#### Scenario: Unmapped operation is reported as unknown

- **GIVEN** a bytecode operation number has no determined meaning
- **WHEN** the scripts are read
- **THEN** the number is reported as unknown and no meaning is assigned

### Requirement: A scene's group data is never read from the client

A scene's group data SHALL NOT be read from the client's own files, since the client holds none of it.

#### Scenario: Group lookup in the client's scripts finds nothing

- **GIVEN** a scene's group script is looked up by its path in the client's scripts
- **WHEN** the lookup runs
- **THEN** no group script is found

### Requirement: Shortcuts are the first place a session looks

A session deriving game data SHALL look for a scene's parts from its roots and for an exact source before measuring, so that no search already settled is run again.

#### Scenario: Scene parts are found from their roots

- **GIVEN** a scene's parts are needed
- **WHEN** the scene is read
- **THEN** its parts are found by following its roots rather than by name
