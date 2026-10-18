## ADDED Requirements

### Requirement: The subzero climate covers Dragonspine

The subzero climate SHALL cover the area of Dragonspine and no other.

#### Scenario: Hold Dragonspine's sheer cold

- **GIVEN** the character stands in Dragonspine
- **WHEN** the climate is checked
- **THEN** the climate holds

#### Scenario: Hold no sheer cold elsewhere

- **GIVEN** the character stands in another area, or in none
- **WHEN** the climate is checked
- **THEN** the climate does not hold

### Requirement: The gauge fills in the subzero climate

The gauge SHALL fill while the character stands in the subzero climate, and SHALL fill faster while it swims.

#### Scenario: Fill the gauge in the subzero climate

- **GIVEN** the character stands in the subzero climate, on foot
- **WHEN** time passes
- **THEN** the gauge fills

#### Scenario: Fill the gauge faster while swimming

- **GIVEN** the character swims in the subzero climate
- **WHEN** time passes
- **THEN** the gauge fills faster than it does on foot

### Requirement: Heat drains the gauge

A lit campfire near the character SHALL drain the gauge wherever the character stands, and an unlit one SHALL heat nothing.

#### Scenario: Heat the character beside a lit campfire

- **GIVEN** a lit campfire stands within reach of the character
- **WHEN** the gauge is stepped
- **THEN** the character is heated and the gauge drains

#### Scenario: Drain the gauge near heat, wherever it stands

- **GIVEN** the character is heated outside the subzero climate
- **WHEN** time passes
- **THEN** the gauge drains

#### Scenario: Leave an unlit campfire unheated

- **GIVEN** an unlit campfire stands within reach of the character
- **WHEN** the gauge is stepped
- **THEN** the character is not heated

#### Scenario: Leave a lit campfire beyond its radius unheated

- **GIVEN** a lit campfire stands beyond the reach of the character
- **WHEN** the gauge is stepped
- **THEN** the character is not heated

#### Scenario: Leave the character unheated where no heat source is placed

- **GIVEN** no heat source is placed in the world
- **WHEN** the gauge is stepped
- **THEN** the character is not heated

### Requirement: The gauge drains where neither the climate nor heat reaches it

The gauge SHALL drain outside the subzero climate with no heat near, and SHALL stay between none and its full scale.

#### Scenario: Drain the gauge outside the climate with no heat

- **GIVEN** the character stands outside the subzero climate with no heat near
- **WHEN** time passes
- **THEN** the gauge drains

#### Scenario: Keep the gauge between none and its maximum

- **GIVEN** the gauge is near empty or near full
- **WHEN** heat or the climate moves it past its end
- **THEN** the gauge stops at none or at its full scale

### Requirement: A full gauge deals damage each interval

A full gauge SHALL deal its share of the character's max HP and a flat amount for each second it stays full, and SHALL deal none while it is not full.

#### Scenario: Deal its share of damage for each interval it stays full

- **GIVEN** the gauge is full
- **WHEN** two intervals pass
- **THEN** the character loses its share of max HP and the flat amount, twice

#### Scenario: Carry a part interval into the next step before dealing damage

- **GIVEN** the gauge has been full for less than one interval
- **WHEN** time passes to complete the interval
- **THEN** the character loses its share of max HP and the flat amount, once

#### Scenario: Lose the share of max HP each interval

- **GIVEN** the gauge is full and a shield on the team is live
- **WHEN** an interval passes
- **THEN** the shield takes the damage first, and the character loses the share of max HP the shield does not absorb

#### Scenario: Deal no damage while the gauge is not full

- **GIVEN** the gauge is not full
- **WHEN** time passes
- **THEN** the character loses no HP

#### Scenario: Clear the time toward the next interval once heat drains the gauge below full

- **GIVEN** the gauge has been full for part of an interval
- **WHEN** heat drains it below full
- **THEN** the time toward the next interval clears

### Requirement: The gauge shows as a bar across the top of the screen

The bar SHALL show while the gauge holds any cold, SHALL fill by the gauge's share of its full scale, and SHALL be labelled with the game's own name for the gauge.

#### Scenario: Show the bar while the gauge holds cold

- **GIVEN** the gauge holds cold
- **WHEN** the screen is drawn
- **THEN** the bar shows, filled by the gauge's share of its full scale

#### Scenario: Label the bar with the game's name for the gauge

- **GIVEN** the bar shows
- **WHEN** assistive technology reads it
- **THEN** it reads the game's own name for the gauge, Sheer Cold, in the reader's language
