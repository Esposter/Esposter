## Purpose

The quest screen's runs: its whole frame compared over the wiki's still.

## Requirements

### Requirement: The quest screen

The quest screen SHALL be compared over its whole frame, its score reported against the global default difference bar, and its image written by approve.

#### Scenario: A quest screen above the bar still gets its image

- **GIVEN** the quest screen's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the score is reported over the bar, and the screen's image is still written

### Requirement: A scrolled quest list

A scrolled quest list SHALL be given its scroll offset before it is compared.

#### Scenario: A fixture without a scroll offset holds the list's snapshot back

- **GIVEN** the list's fixture has no way to set its scroll offset
- **WHEN** the list is compared against a scrolled reference
- **THEN** the list's snapshot row is not written
