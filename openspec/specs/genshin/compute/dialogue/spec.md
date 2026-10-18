## Purpose

The dialogue box's five states, scored over their backdrop.

## Requirements

### Requirement: Each of the dialogue box's five states

Each of the dialogue box's five states SHALL differ from its reference by no more than 2 percent on average per region.

#### Scenario: A state whose region differs by more than 2 percent does not pass

- **GIVEN** a dialogue state is compared against its reference
- **WHEN** a region's mean difference is above 2 percent
- **THEN** that state does not pass

#### Scenario: A state within 2 percent on every region passes

- **GIVEN** a dialogue state is compared against its reference
- **WHEN** every region's mean difference is at or below 2 percent
- **THEN** that state passes

### Requirement: Each dialogue state

Each dialogue state SHALL be scored over its reference's clean backdrop, not over its own pixels.

#### Scenario: The backdrop is excluded from scoring

- **GIVEN** a reference has a clean backdrop plate
- **WHEN** a dialogue state is scored
- **THEN** the backdrop is scored as the background, not as the state
