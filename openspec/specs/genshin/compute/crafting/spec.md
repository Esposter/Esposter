## Purpose

The crafting table's runs: its whole frame approved, and the interface's crafting screen given a fixture and a reference.

## Requirements

### Requirement: The crafting table's whole frame

The crafting table's whole frame SHALL be approved only once a plate of the scene with the screen closed exists to score its opaque panels against.

#### Scenario: Without a plate the opaque panels are scored through their mask and approval waits

- **GIVEN** no plate exists of the spot with the screen closed
- **WHEN** the whole frame is compared against its reference
- **THEN** the opaque panels are scored through their mask
- **AND** whole-frame approval waits for a plate

#### Scenario: A frame above the global default bar stays unapproved

- **GIVEN** the crafting table's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the table stays unapproved

### Requirement: The interface's crafting screen

The interface's crafting screen SHALL be given a fixture and a reference before it is compared.

#### Scenario: A crafting screen with no reference is not compared

- **GIVEN** the crafting screen has no fixture or no reference
- **WHEN** the comparison is run
- **THEN** the screen is not compared and stays unapproved
