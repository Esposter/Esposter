## Purpose

The dialogue box's five states, scored over their backdrop.

## Requirements

### Requirement: Each of the dialogue box's five states

None of the dialogue box's five states is yet within the compare's bar: each differs from its reference by more than the bar on average. Until a state's mean difference is at or below the bar, it SHALL be reported as not passing. The target and each state's score are recorded in the dialogue page's Parity section.

#### Scenario: A state whose region differs by more than the bar does not pass

- **GIVEN** a dialogue state is compared against its reference
- **WHEN** a region's mean difference is above the bar
- **THEN** that state does not pass

#### Scenario: A state within the bar on every region passes

- **GIVEN** a dialogue state is compared against its reference
- **WHEN** every region's mean difference is at or below the bar
- **THEN** that state passes

### Requirement: Each dialogue state

Each dialogue state SHALL be scored over its reference's clean backdrop, not over its own pixels.

#### Scenario: The backdrop is excluded from scoring

- **GIVEN** a reference has a clean backdrop plate
- **WHEN** a dialogue state is scored
- **THEN** the backdrop is scored as the background, not as the state
