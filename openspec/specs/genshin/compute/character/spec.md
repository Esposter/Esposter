## Purpose

The character screen's runs: its Attributes tab compared over the whole frame, and the interface's character menu with its tabs, each given a fixture and a reference.

## Requirements

### Requirement: The character screen's Attributes tab

The character screen's Attributes tab SHALL be compared over its whole frame, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: A frame above the bar still gets its image

- **GIVEN** the Attributes tab's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the tab's image is still written

### Requirement: The character menu's buttons

The character menu's buttons SHALL be compared against a reference of their own, and their score reported.

#### Scenario: Buttons with no reference are not compared

- **GIVEN** no reference names the character menu's buttons
- **WHEN** the buttons' comparison is run
- **THEN** the buttons are not compared and no score is reported
