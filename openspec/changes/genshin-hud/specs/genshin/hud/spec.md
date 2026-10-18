## ADDED Requirements

### Requirement: The HUD composite re-measure reports without gating

The HUD composite re-measure SHALL report its score over the recording of the HUD hidden and shown without failing the run.

#### Scenario: The composite re-measure reports without failing the run

- **GIVEN** the recording of the standing shot with the HUD hidden and then shown is available
- **WHEN** the composite re-measure runs
- **THEN** it reports the HUD's score over the recording
- **AND** the run is not failed by that score

### Requirement: The quest tracker holds its provisional place until its rect is fitted

The quest tracker SHALL stay at its provisional place until the game's interface tree gives it a rect, and SHALL take that rect once it has one.

#### Scenario: The quest tracker is drawn at its provisional place

- **GIVEN** the game's interface tree gives the quest tracker no rect
- **WHEN** the HUD is drawn in the open world
- **THEN** the quest tracker is drawn at its provisional place

#### Scenario: The quest tracker takes its fitted rect once the tree gives one

- **GIVEN** the game's interface tree gives the quest tracker a rect
- **WHEN** the HUD is drawn in the open world
- **THEN** the quest tracker is drawn inside that rect
