## Purpose

A character's parsed model becomes one skinned mesh, each material shaded by the game's own character shader from its pack's inputs, with its outline and its stance at its holder's origin. The poses it takes are procedural and provisional, not the game's clips.

## Requirements

### Requirement: A model is drawn as one mesh with each material in the game's shading

A character's model SHALL be drawn as one skinned mesh, with each material shaded by the game's own character shading.

#### Scenario: Model drawn with the game's shading

- **GIVEN** a model read from a character pack
- **WHEN** it is drawn
- **THEN** it is one mesh
- **AND** each material is shaded by the game's character shading

#### Scenario: Material without a toon texture takes the shared ramp

- **GIVEN** a material names no toon texture
- **WHEN** it is drawn
- **THEN** it takes the world's shared toon ramp

### Requirement: The drawn character takes its pose from its movement state

The drawn character SHALL take its pose from its movement state and SHALL cross-fade from one pose to the next as the state changes.

#### Scenario: Walking, running and sprinting swing the limbs

- **GIVEN** the character walks, runs or sprints
- **WHEN** it is drawn
- **THEN** its legs and arms swing opposite each other
- **AND** its stride keeps pace with the ground it crosses

#### Scenario: Jumping, falling and gliding hold a stance

- **GIVEN** the character jumps, falls or glides
- **WHEN** it is drawn
- **THEN** it holds a fixed stance for that state

#### Scenario: Standing arms hang at the sides

- **GIVEN** the character stands still
- **WHEN** it is drawn
- **THEN** its arms hang down at its sides

#### Scenario: State change cross-fades the pose

- **GIVEN** the character changes movement state
- **WHEN** the new pose begins
- **THEN** the pose cross-fades from the previous one

### Requirement: Each solid material is outlined in its edge or the world's outline

Each solid material SHALL be outlined, in its own edge colour where its file sets one and in the world's outline where it does not.

#### Scenario: Solid material is outlined

- **GIVEN** a solid material is drawn
- **WHEN** the scene is drawn
- **THEN** the material has an outline

#### Scenario: Transparent material has no outline

- **GIVEN** a transparent material is drawn
- **WHEN** the scene is drawn
- **THEN** the material has no outline

#### Scenario: Official release without an edge takes the world's outline

- **GIVEN** an official release sets no edge on a material
- **WHEN** the material is drawn
- **THEN** its outline takes the world's outline colour and width

#### Scenario: Outline width changes with distance

- **GIVEN** the camera moves away from the character
- **WHEN** the outline is drawn
- **THEN** its width changes with the distance from the camera

### Requirement: A partly transparent material is blended and drawn from both faces

A material SHALL be drawn blended and from both faces when it is partly transparent, so that a clear texel shows what was drawn before it.

#### Scenario: Diffuse alpha below one blends the material

- **GIVEN** a material's diffuse alpha is below one
- **WHEN** it is drawn
- **THEN** it is blended

#### Scenario: Clear texel blends the material

- **GIVEN** a material's texture has a texel below full alpha
- **WHEN** it is drawn
- **THEN** it is blended

#### Scenario: Double-sided material shows its back faces

- **GIVEN** a material is set to draw both faces
- **WHEN** it is drawn
- **THEN** its back faces are drawn as well

#### Scenario: Otherwise opaque material writes depth

- **GIVEN** a material is fully opaque
- **WHEN** it is drawn
- **THEN** it writes depth like an opaque material

### Requirement: The model faces the way its body faces

The model SHALL face the direction its body faces, so that whatever moves the body moves the model with it.

#### Scenario: Model turns with the body

- **GIVEN** the body is turned to a yaw
- **WHEN** the model is drawn
- **THEN** the model faces the same direction as the body

#### Scenario: Model moves with the body

- **GIVEN** the body moves
- **WHEN** the model is drawn
- **THEN** the model moves with it

### Requirement: Textures repeat past their edges as the model samples them

Each texture SHALL repeat past its edges as the model's texture coordinates sample it.

#### Scenario: Coordinates past the edge repeat the texture

- **GIVEN** a material's texture coordinates lie beyond the texture's edge
- **WHEN** the material is drawn
- **THEN** the texture repeats

### Requirement: A missing texture leaves its material plain and the model drawn

A material whose texture is missing SHALL be drawn without it, and the rest of the model SHALL still be drawn.

#### Scenario: Missing texture draws the material untextured

- **GIVEN** the model names a texture the release does not ship
- **WHEN** the model is drawn
- **THEN** the material that uses it is drawn untextured
- **AND** the rest of the model still appears
- **AND** the missing texture is logged once

### Requirement: The Traveler is drawn on the body at Windrise's start

The Traveler SHALL be drawn on the character body at Windrise's start point, from its pack when one is held and otherwise as a capsule.

#### Scenario: No pack shows the capsule

- **GIVEN** no pack is held for the Traveler
- **WHEN** the world starts
- **THEN** the Traveler is shown as a capsule on the body at Windrise

#### Scenario: Held pack draws the Traveler's model

- **GIVEN** a pack is held for the Traveler
- **WHEN** the world starts
- **THEN** the Traveler's model is drawn on the body at Windrise
