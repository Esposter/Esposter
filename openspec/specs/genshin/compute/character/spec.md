## Purpose

The character screen's runs: its Attributes tab approved over the whole frame, and the interface's character menu with its tabs, each given a fixture and a reference.

## Requirements

### Requirement: The character screen's Attributes tab

The character screen's Attributes tab SHALL be approved only once its whole frame scores within the global default difference bar.

#### Scenario: A frame above the bar stays unapproved

- **GIVEN** the Attributes tab's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the tab stays unapproved

### Requirement: The character menu's buttons

The character menu's buttons SHALL be compared against a reference of their own before they are approved.

#### Scenario: Buttons with no reference are not compared

- **GIVEN** no reference names the character menu's buttons
- **WHEN** the buttons' comparison is run
- **THEN** the buttons are not compared and stay unapproved
