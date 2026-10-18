## ADDED Requirements

### Requirement: Nod-Krai's night moon is larger and brighter

The night sky of Nod-Krai SHALL draw the moon larger and brighter than the standard moon of the other regions.

#### Scenario: The moon looks larger at night in Nod-Krai

- **GIVEN** it is night
- **WHEN** the player stands in Nasha Town
- **THEN** the moon is drawn larger and brighter than in Mondstadt at the same hour

#### Scenario: Other regions keep the standard moon

- **GIVEN** it is night
- **WHEN** the player stands in Mondstadt
- **THEN** the moon is drawn at the standard size and brightness

### Requirement: The isles stand apart with the sea between them

Lempo Isle, Hiisi Island and Paha Isle SHALL show as separate isles on the world map, joined by the Moontide Sea, which is part of the region.

#### Scenario: Each isle has its own outline on the world map

- **GIVEN** the player opens the world map
- **WHEN** Nod-Krai is in view
- **THEN** Lempo Isle, Hiisi Island and Paha Isle show as separate outlines

#### Scenario: The Moontide Sea belongs to Nod-Krai

- **GIVEN** the player sails from Lempo Isle to Hiisi Island
- **WHEN** the player is on the water between them
- **THEN** the area's name shown is the Moontide Sea in Nod-Krai

### Requirement: Nod-Krai's towns are built from their own kits

The ports and towns SHALL be built from the dieselpunk kit, and the Frostmoon Scions' enclaves from the Scions' kit.

#### Scenario: Nasha Town's buildings are riveted iron

- **GIVEN** the player walks into Nasha Town
- **WHEN** its buildings come into view
- **THEN** they show riveted iron, pipework, cranes and smokestacks

#### Scenario: The Frostmoon Enclave stands among stone circles

- **GIVEN** the player walks into the Frostmoon Enclave
- **WHEN** its enclaves come into view
- **THEN** the enclaves stand among stone circles

### Requirement: Statues of the New Moon serve as waypoints

A Statue of the New Moon SHALL serve as a waypoint in exploring where other regions have a Statue of The Seven.

#### Scenario: A discovered Statue of the New Moon is a waypoint

- **GIVEN** the player has found a Statue of the New Moon
- **WHEN** the player opens the waypoints
- **THEN** the statue is listed as a waypoint
