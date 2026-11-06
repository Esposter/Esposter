## ADDED Requirements

### Requirement: No weapon art ships

The recreation SHALL draw each weapon's picture, model and effect from parameters fitted to the game's own exports. No weapon mesh, texture, icon or effect file of the game is bundled, committed or published.

#### Scenario: A published icon record holds outlines and no pixel

- **GIVEN** a weapon's icon has been traced to its outline
- **WHEN** the outline is published
- **THEN** the record holds the outline's loops
- **AND** the record holds no pixel of the icon

### Requirement: A held weapon is drawn from its fitted shape

A character holding a weapon SHALL show it drawn from its fitted shape, at the hand its fitted grip names. A held weapon with no fitted shape draws nothing in the hand.

#### Scenario: A claymore is drawn at the hand its grip names

- **GIVEN** a character holds a claymore
- **WHEN** the character is drawn in the world
- **THEN** the claymore's fitted shape stands at the hand its grip names

#### Scenario: A weapon with no fitted shape draws nothing in the hand

- **GIVEN** a character holds a weapon whose shape is not fitted
- **WHEN** the character is drawn in the world
- **THEN** no weapon is drawn in the hand
- **AND** the character is still drawn

### Requirement: A weapon's tile shows its own outline

A weapon's tile and the weapon screen's portrait frame SHALL show the outline of the weapon's icon, in our own shape, over the rarity face.

#### Scenario: A tile shows its weapon's outline

- **GIVEN** a weapon whose icon outline is published
- **WHEN** its tile is drawn in the inventory
- **THEN** the tile shows that outline over the rarity face

#### Scenario: A tile without an outline keeps the bare face

- **GIVEN** a weapon whose icon outline is not published
- **WHEN** its tile is drawn
- **THEN** the tile shows the rarity face alone

#### Scenario: A traced icon outline is loops in its own unit square

- **GIVEN** a weapon's icon is traced from its own alpha
- **WHEN** the outline is fitted
- **THEN** the outline is loops inside the icon's own unit square

### Requirement: A dropped weapon is drawn as its own shape

A dropped weapon SHALL be drawn with its own fitted shape, and a drop with no fitted shape stays a sphere.

#### Scenario: A dropped weapon draws its fitted shape

- **GIVEN** a sword lies on the ground
- **WHEN** the sword is drawn in the world
- **THEN** the sword's own fitted shape is drawn

#### Scenario: A weapon with no fitted drop shape keeps the sphere

- **GIVEN** a weapon lies on the ground whose drop shape is not fitted
- **WHEN** it is drawn in the world
- **THEN** a sphere is drawn in its place

### Requirement: A strike leaves a trail measured from the game

A weapon's strike SHALL leave a trail whose width, colour and fade are the values measured from the game's recorded strikes.

#### Scenario: A claymore strike leaves its measured trail

- **GIVEN** a claymore strikes
- **WHEN** the strike lands
- **THEN** a trail of the measured width and colour is drawn
- **AND** the trail fades over the measured time

#### Scenario: A weapon kind with no measured trail leaves none

- **GIVEN** a weapon kind whose trail has not been measured
- **WHEN** a weapon of that kind strikes
- **THEN** no trail is drawn

#### Scenario: A trail's width is read from the frames its strike draws

- **GIVEN** a claymore strike is captured in a recording
- **WHEN** the strike's trail is measured
- **THEN** its width is read from the frames the strike draws

### Requirement: A sword attack plays its clip on the body

A sword's attack SHALL play one of the game's sword attack clips on the character's body, in the clip's own timing.

#### Scenario: A sword attack plays its clip on the body

- **GIVEN** a character attacks with a sword
- **WHEN** the attack starts
- **THEN** the body follows the clip's frames until the clip's stop time

#### Scenario: A sword attack with no clip leaves the body at rest

- **GIVEN** a sword attack whose clip is not available
- **WHEN** the attack starts
- **THEN** the body stays at rest

### Requirement: The weapon screen's backdrop stands the picked blade behind the grid

The weapon screen SHALL draw the picked weapon's fitted blade behind its grid, over the backdrop sky the parity frame holds.

#### Scenario: The picked weapon's blade stands behind the grid

- **GIVEN** a weapon is picked on the weapon screen
- **WHEN** the screen is drawn
- **THEN** the picked weapon's fitted blade stands behind the grid

#### Scenario: A picked weapon with no fitted blade shows the plain backdrop

- **GIVEN** a picked weapon whose blade is not fitted
- **WHEN** the screen is drawn
- **THEN** the backdrop shows no blade

### Requirement: The weapon fits take each held weapon from the game's exports

The weapon fits SHALL take each held weapon's mesh, its row and its standby clip from the game's own exports, so that no mesh or grip is guessed from a weapon's name.

#### Scenario: The weapons' roots reach every held mesh the index names

- **GIVEN** the asset index names the held meshes of the weapons
- **WHEN** the weapons' roots are exported
- **THEN** every held mesh the index names is reached by the export

#### Scenario: A row whose folder names no mesh is recorded with none, not a guessed one

- **GIVEN** a weapon row whose texture folder names no mesh in the index
- **WHEN** the row-to-mesh map is written
- **THEN** the row is recorded with no mesh

#### Scenario: A thin blade is fitted as blades, not one stack

- **GIVEN** a held weapon's mesh is a thin blade
- **WHEN** its shape is fitted
- **THEN** it is fitted as blades, not as one stack

#### Scenario: A kind's grip is read from its standby clip's hand curves

- **GIVEN** a weapon kind has a standby clip that carries hand curves
- **WHEN** its grip is fitted
- **THEN** the grip is read from the curves of the WeaponR or WeaponL bone they name

### Requirement: A weapon icon the index does not name is reported

The weapon icon export SHALL report each icon name the asset index does not hold, instead of skipping it.

#### Scenario: A weapon icon the index does not name is reported, not skipped

- **GIVEN** a weapon row names an icon the asset index does not hold
- **WHEN** the weapon icons are exported
- **THEN** the export reports that icon name
- **AND** the export writes no icon file for it
