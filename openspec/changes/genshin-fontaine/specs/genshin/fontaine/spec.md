## ADDED Requirements

### Requirement: Fontaine's plate stands above its neighbours with a great waterfall

Fontaine's plate SHALL stand above the regions around it, with a great waterfall and its mist at the plate's edge.

#### Scenario: The plate's edge carries the great waterfall

- **GIVEN** the player is below Fontaine's plate edge
- **WHEN** the player looks up at the edge
- **THEN** the great waterfall falls from the plate's height with its mist rising to that height

### Requirement: Diving takes the player into Fontaine's underwater areas

Diving below the water surface in Fontaine SHALL show the underwater areas with turquoise fog, caustics, light shafts, and the kelp and coral of the seabed.

#### Scenario: Diving below the surface turns the water underwater

- **GIVEN** the player is at Fontaine's water surface
- **WHEN** the player dives below the surface
- **THEN** the view turns to turquoise fog with caustics, light shafts, and kelp and coral on the seabed

#### Scenario: The Sea of Bygone Eras is a map layer of its own

- **GIVEN** the player opens the map
- **WHEN** the player looks for the Sea of Bygone Eras
- **THEN** it appears as a layer apart from the main world's map

### Requirement: Fontaine's buildings stand from its building kit

Fontaine's buildings SHALL stand from the Fontaine building kit, with a stone ground floor, ashlar storeys and a mansard roof.

#### Scenario: Buildings show the kit's storeys and roofs

- **GIVEN** the player is in a Fontaine district
- **WHEN** the player views its buildings
- **THEN** each has a stone ground floor with arched openings, ashlar storeys with balconies, and a mansard roof with dormers

#### Scenario: An aqueduct is a kit piece of its own

- **GIVEN** the player is in a Fontaine district with an aqueduct
- **WHEN** the player views the aqueduct
- **THEN** it stands as its own piece, apart from the buildings

### Requirement: Fontaine's landmark structures stand as landmark-tier meshes

Palais Mermonia, Opera Epiclese and Elynas SHALL stand as landmark-tier meshes, and the Fortress of Meropide SHALL stand as a landmark on the seabed.

#### Scenario: Palais Mermonia is landmark-tier

- **GIVEN** the player is in the Court of Fontaine
- **WHEN** the player views Palais Mermonia
- **THEN** it stands as a landmark-tier mesh

#### Scenario: The Fortress of Meropide is on the seabed

- **GIVEN** the player dives to the seabed
- **WHEN** the player views the Fortress of Meropide
- **THEN** it stands as a landmark on the seabed

### Requirement: An aquabus runs its authored path

An aquabus line SHALL run along its authored path with its boat hovering over the water.

#### Scenario: An aquabus runs its authored path

- **GIVEN** the player is at an aquabus stop
- **WHEN** the aquabus runs its line
- **THEN** its boat hovers along the line's authored path

### Requirement: Each Fontaine area is listed as the game names it

Each area of Fontaine SHALL be listed on the map under the name the game gives it.

#### Scenario: Fontaine's areas appear as the game names them

- **GIVEN** the player opens the map
- **WHEN** the player looks at Fontaine's areas
- **THEN** each area is listed under the game's own name
