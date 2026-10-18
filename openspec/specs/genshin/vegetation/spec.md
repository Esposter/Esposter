## Purpose

Genshin's grass and the wind that moves it. One wind field of a base breeze and gusts rolling downwind is sampled in world space by the grass, the trees' leaves and the clouds. Grass is individual blades generated in the vertex stage from a hash of their cell, none stored, in a dense near ring and a sparse middle ring, standing on a capture of the ground and shading as one field.

## Requirements

### Requirement: One wind moves grass, leaves and clouds together

One wind field SHALL move the grass, the tree leaves and the clouds together, with gusts rolling downwind across the land.

#### Scenario: Gusts rolling across the meadow

- **GIVEN** Mondstadt's wind is a steady breeze from the west with gusts
- **WHEN** a gust passes over the meadow
- **THEN** the grass bends in a wave that rolls downwind
- **AND** the clouds drift with the same wind

### Requirement: Grass grows only on green ground above the water

Grass SHALL grow only on green ground above the water, and never on rock, sand or the sea floor.

#### Scenario: Grass on green ground

- **GIVEN** the ground is green and above the water
- **WHEN** the grass is drawn
- **THEN** grass blades stand on that ground

#### Scenario: No grass on rock or sand

- **GIVEN** the ground is rock or sand
- **WHEN** the grass is drawn
- **THEN** no grass blade stands on it

#### Scenario: No grass under water

- **GIVEN** the ground lies under the water
- **WHEN** the grass is drawn
- **THEN** no grass blade stands there

### Requirement: Dense grass near the eye, sparse grass beyond

Grass SHALL grow densely under the eye and sparsely in a middle ring, and SHALL fade into the terrain's own green beyond the middle ring with no visible seam.

#### Scenario: Dense grass under the eye

- **GIVEN** the eye stands over a meadow
- **WHEN** the meadow is drawn
- **THEN** the grass nearest the eye is dense and fine

#### Scenario: Fade into the terrain

- **GIVEN** the eye looks across a meadow toward distant ground
- **WHEN** the grass thins out
- **THEN** it fades into the ground's colour with no seam

### Requirement: Blades bend from the root

A blade SHALL stay rooted at its base while its tip bends with the wind, bending more the taller it stands.

#### Scenario: Tip travels, root stays

- **GIVEN** a gust reaches a blade
- **WHEN** the blade bends
- **THEN** its root stays planted
- **AND** its tip moves with the gust

### Requirement: Grass shades as one surface

Grass SHALL shade as one surface with light rolling across it, not as a noisy carpet of individually lit and shaded blades.

#### Scenario: Meadow lit as one field

- **GIVEN** the sun lights a meadow
- **WHEN** the meadow is drawn
- **THEN** the blades share the light of one surface
- **AND** the root is darker than the tip

#### Scenario: Wet meadow glints as one surface

- **GIVEN** the ground is wet
- **WHEN** the sun catches the meadow
- **THEN** the meadow darkens and glints as one surface

### Requirement: Crowns lean and sway with the wind

A tree's crown SHALL lean downwind, leaning more the higher up the tree it stands, and each patch of its leaves SHALL flutter on its own phase.

#### Scenario: Higher leaves lean further

- **GIVEN** a tree stands in a steady wind
- **WHEN** its crown is drawn
- **THEN** the upper leaves lean further downwind than the lower ones

### Requirement: Grass density is the first detail a lower tier reduces

Blade density SHALL be the first detail a lower quality tier reduces, before the shadows.

#### Scenario: Lower quality thins the grass first

- **GIVEN** the quality tier is lowered
- **WHEN** the scene is drawn
- **THEN** the grass becomes thinner
- **AND** the shadows are kept
