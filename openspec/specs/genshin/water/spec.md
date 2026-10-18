## Purpose

Genshin's still water in the anime style, one surface for every sea and lake. Its colour is graded by the depth behind it from bright shallows to deep blue, the floor shows through the shallows bent by ripples, foam gathers at every shore with no mesh authored, the sun breaks into stepped glints, and the sky is reflected toward the horizon. Caustics shimmer on the ground under it, and under the surface the fog turns to the water's own.

## Requirements

### Requirement: One still surface at each region's water level

Still water SHALL be one surface at each region's water level, shown wherever the ground dips beneath that level.

#### Scenario: Ground dipping under the level

- **GIVEN** the ground dips below a region's water level
- **WHEN** the scene is drawn
- **THEN** water shows where the ground is under the level

#### Scenario: Ground above the level

- **GIVEN** the ground stands above the water level
- **WHEN** the scene is drawn
- **THEN** no water shows there

### Requirement: Water colour graded by depth

The water's colour SHALL grade from a bright shallow tint to a deep blue with the depth of water behind the surface.

#### Scenario: Shallows bright

- **GIVEN** the floor lies just below the surface
- **WHEN** the water is drawn
- **THEN** the water is the bright shallow tint

#### Scenario: Deep water blue

- **GIVEN** the floor lies far below the surface
- **WHEN** the water is drawn
- **THEN** the water is the deep blue

### Requirement: Floor shows through the shallows

The floor SHALL show through the shallows, bent by the ripples on the surface.

#### Scenario: Floor visible through shallow water

- **GIVEN** the water is shallow over the floor
- **WHEN** the water is drawn
- **THEN** the floor shows through, wavering with the ripples

### Requirement: Foam gathers wherever water meets anything

Foam SHALL gather in animated lines at every shore, rock and pillar that water meets, with no foam authored into the scene.

#### Scenario: Foam at a shore

- **GIVEN** water meets a shore
- **WHEN** the water is drawn
- **THEN** foam lines animate where the water meets the shore

### Requirement: Sun breaks into stepped glints and the sky is reflected

The sun SHALL break on the surface into stepped glints, and the sky SHALL be reflected toward the horizon.

#### Scenario: Sun glints on the surface

- **GIVEN** the sun is in view of the surface
- **WHEN** the water is drawn
- **THEN** bright stepped glints show where the sun's light reflects

#### Scenario: Sky reflected toward the horizon

- **GIVEN** the view runs low across the water toward the horizon
- **WHEN** the water is drawn
- **THEN** the sky's colours are reflected on the surface

### Requirement: Caustics shimmer on the ground under the water

The ground under the water SHALL shimmer with caustics that dim at night with the light and fade with depth.

#### Scenario: Caustics by day

- **GIVEN** the sun lights the water
- **WHEN** the ground under it is drawn
- **THEN** caustic veins shimmer on the ground

#### Scenario: Caustics dim at night

- **GIVEN** it is night
- **WHEN** the ground under the water is drawn
- **THEN** the caustics are dim

### Requirement: Fog turns to the water's own under the surface

When the eye goes under the water's level, the fog SHALL turn thick and take the water's colour, and surfacing SHALL give back the fog the sky had above.

#### Scenario: Diving under the surface

- **GIVEN** the eye is above the water's level
- **WHEN** the eye goes under the surface
- **THEN** the fog turns thick and the water's colour

#### Scenario: Surfacing restores the sky's fog

- **GIVEN** the eye has been under the surface
- **WHEN** the eye rises above the surface
- **THEN** the fog the sky had above is given back
