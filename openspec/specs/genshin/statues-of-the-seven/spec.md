## Purpose

The rules of a Statue of The Seven past being a jump, built and tested but not yet on a screen. Mondstadt's levels read from the game's level-up table with their rewards and stamina, the Oculi offered to level them, the maximum stamina they raise to 240 at most, and the Statue's Blessing's pool with its click heal and auto-recover.

## Requirements

### Requirement: Oculi reach a region's levels in turn

Oculi offered to a region SHALL be added to its held count, and each level SHALL be reached in turn as the held Oculi cover its cost, the Oculi it takes being taken off the count.

#### Scenario: Offering reaches a level

- **GIVEN** a region's next level costs its Oculi and enough are offered
- **WHEN** the Oculi are offered to the region
- **THEN** that level is reached
- **AND** its Oculi are taken off the held count

#### Scenario: Oculi held toward the next level

- **GIVEN** a region's next level costs more Oculi than are held
- **WHEN** the Oculi are offered to the region
- **THEN** they are held toward the next level

#### Scenario: Past the last level

- **GIVEN** a region has reached its last level
- **WHEN** an Oculus is offered to it
- **THEN** the Oculus is held with no level left to reach

### Requirement: Maximum stamina rises with reached levels up to 240

The maximum stamina SHALL rise with the stamina share of every reached level in every region, and SHALL never exceed two hundred and forty.

#### Scenario: Mondstadt's tenth level

- **GIVEN** Mondstadt's levels are reached up to the tenth
- **WHEN** the maximum stamina is computed
- **THEN** the maximum is one hundred and seventy

#### Scenario: Maximum held at the limit

- **GIVEN** the reached levels would raise the maximum past two hundred and forty
- **WHEN** the maximum stamina is computed
- **THEN** the maximum is two hundred and forty

### Requirement: Restorative Power pool refills over time

The Restorative Power SHALL hold five thousand for each unlocked statue as its maximum, and SHALL refill one percent of that maximum every fifteen seconds until it is full.

#### Scenario: Refill every fifteen seconds

- **GIVEN** the pool is below its maximum
- **WHEN** fifteen seconds pass
- **THEN** one percent of the maximum is added to the pool

#### Scenario: Full pool stops refilling

- **GIVEN** the pool is at its maximum
- **WHEN** time passes
- **THEN** the pool stays at its maximum

### Requirement: A click heals a tenth of a member's maximum HP from the pool

A click SHALL heal a standing party member who is hurt by a tenth of their maximum HP, paid from the pool, and SHALL heal nothing for a fallen member or a member at full HP.

#### Scenario: Pool covers the full heal

- **GIVEN** a hurt standing party member and a pool holding at least a tenth of their maximum HP
- **WHEN** the member is clicked
- **THEN** the member is healed by a tenth of their maximum HP
- **AND** that amount is taken from the pool

#### Scenario: Pool runs short

- **GIVEN** a hurt standing party member and a pool holding less than a tenth of their maximum HP
- **WHEN** the member is clicked
- **THEN** the member is healed by what the pool holds
- **AND** the pool is emptied

#### Scenario: Fallen member not healed by a click

- **GIVEN** a fallen party member
- **WHEN** the member is clicked
- **THEN** the member is not healed
- **AND** the pool is unchanged

### Requirement: Auto-recover revives the fallen and heals the hurt to a threshold

Auto-recover SHALL revive the deployed team's fallen members at thirty-five percent of their HP at no cost to the pool, and then SHALL heal every member under its threshold up to that threshold from the pool, slot by slot.

#### Scenario: Fallen member revived for free

- **GIVEN** a deployed team member has fallen
- **WHEN** auto-recover runs
- **THEN** the member is revived at thirty-five percent of their HP
- **AND** the pool is unchanged by the revival

#### Scenario: Pool runs out part way

- **GIVEN** several members are under the threshold and the pool holds less than the heal they need
- **WHEN** auto-recover runs
- **THEN** the earlier slots are healed up to the threshold
- **AND** the later slots stay where they stand

### Requirement: Statues stay jumps until the world wires them

Until the world screen holds the region's level, the pool and the auto-recover setting, a statue SHALL act only as a jump and the maximum stamina SHALL stay at its start.

#### Scenario: Statue used before it is wired

- **GIVEN** the world screen does not yet hold a region's statue level or pool
- **WHEN** a player uses a statue
- **THEN** the statue acts as a jump
- **AND** no Oculus is offered to the region
