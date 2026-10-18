## ADDED Requirements

### Requirement: Constellation Activation

The Constellation tab SHALL activate the next constellation when the player presses Activate, spending one Stella Fortuna.

#### Scenario: Activate makes the next constellation active and spends one Stella Fortuna

- **GIVEN** a character with a constellation not yet active and one Stella Fortuna held
- **WHEN** the player presses Activate
- **THEN** the next constellation becomes active and one Stella Fortuna is spent

#### Scenario: Activate is disabled with no Stella Fortuna held

- **GIVEN** a character with a constellation not yet active and no Stella Fortuna held
- **WHEN** the Constellation tab is shown
- **THEN** Activate is disabled and no constellation is activated

#### Scenario: Activate is disabled when all six constellations are active

- **GIVEN** a character with all six constellations active
- **WHEN** the Constellation tab is shown
- **THEN** Activate is disabled

### Requirement: Wish Stella Fortuna Delivery

A wish SHALL add the Stella Fortuna it brings to the characters those draws belong to as the draw lands.

#### Scenario: a duplicate draw adds its Stella Fortuna to the character at once

- **GIVEN** a held character
- **WHEN** a wish draws a duplicate of that character
- **THEN** the character's Stella Fortuna count rises by the duplicate's count at once

### Requirement: Constellation Effect In Kit

An active constellation's switch SHALL change its character's kit as its effect states, and an inactive constellation SHALL change nothing.

#### Scenario: an active constellation's switch changes its character's kit

- **GIVEN** a character with a switch constellation active
- **WHEN** the character uses its kit
- **THEN** the kit applies that constellation's effect

#### Scenario: an inactive constellation changes nothing

- **GIVEN** a character with a switch constellation not active
- **WHEN** the character uses its kit
- **THEN** the kit does not apply that constellation's effect

### Requirement: Traveler Element Set

The Traveler's element set SHALL be the set for the element of the statue the Traveler has resonated with, and each set SHALL be unlocked only once its source is done.

#### Scenario: the Traveler's set follows the resonated statue's element

- **GIVEN** the Traveler has resonated with a statue of a given element and that element's set is unlocked
- **WHEN** the Traveler's kit reads its set
- **THEN** the set for that element is used

#### Scenario: a Traveler set stays locked until its source is done

- **GIVEN** the Traveler has resonated with a statue whose set's source is not done
- **WHEN** the Traveler's set is chosen
- **THEN** that set is locked

### Requirement: Wish Result Stella Fortuna Display

The wish screen SHALL show on each result card the Stella Fortuna that the draw brings.

#### Scenario: a duplicate's result card shows its Stella Fortuna

- **GIVEN** a wish whose draw is a duplicate of a held character
- **WHEN** the result card for that draw is shown
- **THEN** the card shows the Stella Fortuna the draw brings

#### Scenario: a five-star past six copies' result card shows its Masterless Stella Fortuna

- **GIVEN** a wish whose draw is a five-star held past its sixth copy
- **WHEN** the result card for that draw is shown
- **THEN** the card shows the Masterless Stella Fortuna the draw brings
