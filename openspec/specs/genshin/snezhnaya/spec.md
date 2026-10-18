## Purpose

Snezhnaya's built parts. Its industrial and capital building kits are parametric generators over the engine's box and lathe kits, each a hall or a factory standing on the origin, and the Kresnik's Torch is a stone plinth, shaft and brazier with a flame standing in its cup. Snezhnograd's first hall stands in its region data at a provisional place.

## Requirements

### Requirement: A factory stands on the origin as a hall with a chimney

Each factory SHALL stand on the origin as one hall with one chimney set at a fixed share of the hall's width.

#### Scenario: A generated factory has its hall and chimney

- **GIVEN** a factory is generated with its options
- **WHEN** it is shown
- **THEN** one hall stands on the origin
- **AND** one chimney stands on the hall at its fixed share of the hall's width

### Requirement: A capital hall rises in storeys set back from the one below

A capital hall SHALL rise as storeys, each set back from the storey below it.

#### Scenario: Each storey is set back from the one below

- **GIVEN** a capital hall is generated with several storeys
- **WHEN** it is shown
- **THEN** each storey is inset from the storey beneath it

### Requirement: Kresnik's Torch is a stone plinth, shaft and brazier with a flame in its cup

A Kresnik's Torch SHALL be a stone plinth, shaft and brazier, with its flame standing in the cup of the brazier at its rim.

#### Scenario: The flame stands in the brazier's cup

- **GIVEN** a Kresnik's Torch is generated
- **WHEN** it is shown
- **THEN** the flame stands in the cup of the brazier at its rim

### Requirement: The torch is not shown in the world before a settlement places it

A Kresnik's Torch SHALL NOT be shown in the world until a settlement places one.

#### Scenario: No torch appears in Snezhnaya yet

- **GIVEN** the world is set in Snezhnaya
- **WHEN** the player explores the region
- **THEN** no Kresnik's Torch appears

### Requirement: Snezhnograd's first hall stands at a provisional place

Snezhnograd's first hall SHALL stand at its provisional place in the region's data and SHALL be drawn once the camera comes within reach of it.

#### Scenario: The hall is drawn as the camera approaches

- **GIVEN** the camera is outside the hall's reach
- **WHEN** the camera comes within reach
- **THEN** the hall is drawn

#### Scenario: The hall is not drawn from far away

- **GIVEN** the camera is outside the hall's reach
- **WHEN** the frame is shown
- **THEN** the hall is not drawn

### Requirement: The torch's light does not reach the scene yet

A Kresnik's Torch SHALL NOT light the scene around it until its light is built.

#### Scenario: A torch in the scene does not light its surroundings

- **GIVEN** a Kresnik's Torch stands in the scene
- **WHEN** the scene is lit
- **THEN** the torch's light does not reach its surroundings
