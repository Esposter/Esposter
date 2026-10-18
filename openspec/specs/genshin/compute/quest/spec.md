## Purpose

The quest screen's runs: its whole frame approved over the wiki's still.

## Requirements

### Requirement: The quest screen

The quest screen SHALL be approved over its whole frame only once that frame scores within the global default difference bar.

#### Scenario: A quest screen above the bar stays unapproved

- **GIVEN** the quest screen's whole frame is compared against its reference
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the screen stays unapproved

### Requirement: A scrolled quest list

A scrolled quest list SHALL be given its scroll offset before it is compared.

#### Scenario: A fixture without a scroll offset holds the list's snapshot back

- **GIVEN** the list's fixture has no way to set its scroll offset
- **WHEN** the list is compared against a scrolled reference
- **THEN** the list's snapshot row is not written
