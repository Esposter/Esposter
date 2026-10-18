## Purpose

The wish screen's single pull and its ten results, frame by frame.

## Requirements

### Requirement: The wish screen

The wish screen SHALL be approved over its reference frame only once that frame scores within the global default difference bar.

#### Scenario: A wish screen above the bar stays unapproved

- **GIVEN** the wish screen is compared against its reference frame
- **WHEN** its perceptual difference score is above the global default bar
- **THEN** the screen stays unapproved

### Requirement: The wish screen's banner card

The wish screen's banner card SHALL show Wish one and ten with their costs, Details, Shop and History, and SHALL open the banner's pool in a Details popup.

#### Scenario: Pressing Details opens the pool in a popup

- **GIVEN** the wish screen shows its Character Event banner
- **WHEN** the player presses Details
- **THEN** the banner's pool opens in a popup over the screen

#### Scenario: The card shows both wish buttons with their costs

- **GIVEN** the wish screen shows its Character Event banner
- **WHEN** the card is drawn
- **THEN** Wish one and Wish ten are shown with their costs
