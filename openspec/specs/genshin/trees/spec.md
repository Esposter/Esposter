## Purpose

Genshin's trees as species, each one set of the tree kit's parameters a placed tree names, and each drawn as its mesh near the eye and as an impostor far from it. A tree's wood is its trunk, its limbs and its surface roots, each swept as a tube along a spline traced off its export's own bark. The impostor is baked once from the tree's own mesh, its colour and its normal, and drawn on one card turned about the trunk to face the eye and toon-lit through the hour; the two cross over by a dither across a band some ten of the tree's heights out.

## Requirements

### Requirement: Placed trees take their look from their species

A placed tree SHALL take its appearance from the species it names, so that trees of one species look alike wherever they stand.

#### Scenario: Trees of one species

- **GIVEN** several trees name the same species
- **WHEN** they are drawn in the world
- **THEN** they share the species' shape and bark

#### Scenario: Great oak as the first species

- **GIVEN** the world holds Windrise's great oak
- **WHEN** it is drawn
- **THEN** it is drawn as the species of the great oak

### Requirement: Near trees drawn as their mesh and far trees as a card

A tree SHALL be drawn as its full mesh while near the eye and as a single flat card once it is far from the eye.

#### Scenario: Near tree drawn in full

- **GIVEN** a tree stands close to the eye
- **WHEN** it is drawn
- **THEN** its full wood and leaves are drawn

#### Scenario: Far tree drawn as a card

- **GIVEN** a tree stands well beyond ten of its own heights from the eye
- **WHEN** it is drawn
- **THEN** only its flat card is drawn

### Requirement: Mesh and card cross over without overlap

The mesh and the card SHALL cross over by dither across a band of distance, so that each pixel is drawn by one of them and never by both.

#### Scenario: Pixels split across the band

- **GIVEN** a tree stands inside the cross-over band
- **WHEN** it is drawn
- **THEN** the card draws some pixels and the mesh draws the rest
- **AND** no pixel is drawn by both

#### Scenario: Outside the band only one is drawn

- **GIVEN** a tree stands outside the cross-over band
- **WHEN** it is drawn
- **THEN** only the mesh or only the card is drawn

### Requirement: Card turns to face the eye and stays upright

The card SHALL turn about the trunk to face the eye, so that a tree stays standing however the eye looks at it.

#### Scenario: Looking up at a far tree

- **GIVEN** a far tree is seen from the ground
- **WHEN** the eye looks at it
- **THEN** the tree stands upright on the card

#### Scenario: Looking down at a far tree

- **GIVEN** a far tree is seen from above
- **WHEN** the eye looks down at it
- **THEN** the tree still stands on its card

### Requirement: Card lit through the hour as the mesh is

The card SHALL be lit through the hour as the mesh is, darkening when wet and drawing no outline.

#### Scenario: Card at night

- **GIVEN** the time of day is night
- **WHEN** a far tree is drawn
- **THEN** its card is shaded as the mesh would be at night

#### Scenario: Card wet after rain

- **GIVEN** the ground is wet
- **WHEN** a far tree is drawn
- **THEN** its card darkens as its mesh does

### Requirement: Wood drawn as smooth round tubes

The trunk, the limbs and the surface roots SHALL be drawn as round tubes that do not twist along their length.

#### Scenario: Limb drawn as a tube

- **GIVEN** a tree has a limb
- **WHEN** the tree is drawn near the eye
- **THEN** the limb is a round tube
- **AND** it does not twist along its length
