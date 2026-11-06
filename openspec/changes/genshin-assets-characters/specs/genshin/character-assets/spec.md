## ADDED Requirements

### Requirement: Airborne and water states play the character's own clips

A character's climb, swim, glide, jump and fall SHALL play the fitted loop of its own clip for that state, in place of a fixed stance.

#### Scenario: A climb plays the character's fitted climb clip

- **GIVEN** a character whose fitted record holds a climb clip
- **WHEN** the character climbs
- **THEN** the fitted climb clip plays for as long as the climb lasts

#### Scenario: A state with no fitted clip keeps its fixed stance

- **GIVEN** a character whose fitted record holds no clip for the swim state
- **WHEN** the character swims
- **THEN** the fixed swim stance is drawn

### Requirement: An attack plays the character's own attack clip

An attack SHALL play the fitted loop of its character's attack clip for as long as the attack lasts.

#### Scenario: An attack plays its clip while it lasts

- **GIVEN** a character whose fitted record holds an attack clip
- **WHEN** the character attacks
- **THEN** the attack clip plays until the attack ends

#### Scenario: An attack with no fitted clip keeps the idle stance

- **GIVEN** a character whose fitted record holds no attack clip
- **WHEN** the character attacks
- **THEN** the idle stance is drawn for the attack's length

### Requirement: A character's face moves on timed morphs of its own pack

A character's model SHALL blink and move its mouth on timed morphs that its own pack names.

#### Scenario: A blink closes the eyes and opens them again

- **GIVEN** a character whose pack names blink morphs
- **WHEN** the blink's time comes
- **THEN** the eye morph closes and then opens again

#### Scenario: A pack with no morphs keeps a still face

- **GIVEN** a character whose pack names no morphs
- **WHEN** time passes
- **THEN** no morph is set on the model

### Requirement: A cutscene plays its characters' motion from the scene's clips

A cutscene SHALL play each of its characters' motion from the clips of its own scene.

#### Scenario: A scene's characters play the scene's motion

- **GIVEN** a cutscene whose fitted record holds a clip for each of its characters
- **WHEN** the scene starts
- **THEN** each character plays its own clip

#### Scenario: A scene with no fitted clip shows its character at rest

- **GIVEN** a cutscene whose fitted record holds no clip for one of its characters
- **WHEN** the scene plays
- **THEN** that character stands at rest

#### Scenario: A scene's end returns each character to the world's motion

- **GIVEN** a cutscene playing its characters' motion
- **WHEN** the scene ends
- **THEN** each character's motion returns to the world's own

### Requirement: An NPC plays its body's clips in the world

An NPC SHALL idle, talk, greet, clap and gesture with the clips its game body exports.

#### Scenario: A resident idles with its body's idle clip

- **GIVEN** a resident whose game body exports an idle clip
- **WHEN** the resident waits in the world
- **THEN** the idle clip plays

#### Scenario: A resident whose body exports no clip stands still

- **GIVEN** a resident whose game body exports no clip set
- **WHEN** the resident waits in the world
- **THEN** the resident stands still

### Requirement: A resident stands as the shape of its game body type

A resident SHALL stand as the generated shape its game body type names.

#### Scenario: A resident stands as its body type's shape

- **GIVEN** a resident whose game body type is a female adult
- **WHEN** the resident is in view
- **THEN** the resident stands as the female adult shape

#### Scenario: A resident the body record leaves without a type stands as the capsule

- **GIVEN** a resident the body record gives no body type
- **WHEN** the resident is in view
- **THEN** the plain capsule stands in its place

### Requirement: The Character screen's model rises as the Attributes tab opens

The Character screen's model SHALL rise over the Attributes tab's opening over the span the game's own recording shows.

#### Scenario: The model rises while the Attributes tab opens

- **GIVEN** the Character screen open on another tab
- **WHEN** the player opens the Attributes tab
- **THEN** the model rises over the span the game's own opening shows

#### Scenario: The model holds its place once the tab has opened

- **GIVEN** the Attributes tab has finished opening
- **WHEN** the player stays on the tab
- **THEN** the model holds the place it rose to

### Requirement: A clip's motion is held as the sampled loop of each bone track

Each fitted clip SHALL be held as its bone tracks sampled over one loop of a few samples.

#### Scenario: A clip's bone track is sampled over its loop

- **GIVEN** a clip with a bone track
- **WHEN** the clip is fitted
- **THEN** the track's values are held at each sample of its loop, and a rerun holds the same samples

### Requirement: A character's state plays its fitted loop as its pose

A character's state SHALL play its fitted loop as its pose where one is held, and keeps the procedural pose where none is.

#### Scenario: A state with a fitted loop plays its own pose

- **GIVEN** a character whose fitted record holds a loop for the state
- **WHEN** the character is in the state
- **THEN** the fitted loop is drawn as the character's pose

#### Scenario: A state with no fitted loop keeps the procedural pose

- **GIVEN** a character whose fitted record holds no loop for the state
- **WHEN** the character is in the state
- **THEN** the procedural pose is drawn

### Requirement: The Traveler's model stands at its game model's height

The Traveler's model SHALL stand at the height its game model measures.

#### Scenario: The Traveler's model stands at its game model's height

- **GIVEN** the Traveler's measured unit is held as a published record
- **WHEN** the Traveler is drawn
- **THEN** the Traveler's height is the height its game model measures
