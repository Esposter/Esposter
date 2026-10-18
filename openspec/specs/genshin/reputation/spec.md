## Purpose

Mondstadt's Reputation as the game's table gives it, a level reached by EXP carried up through each level's requirement, every level's reward and unlocks, its requests and weekly bounties paid in the nation's Reputation EXP and Mora, three of each kind claimed a week across nations, and the shop discount's rounding, with the keeper, the bounties' trails and the exploration thresholds not yet on a screen.

## Requirements

### Requirement: Reputation levels rise as EXP carries past each requirement

Mondstadt's Reputation SHALL rise one level at a time as its EXP carries past each level's requirement, and SHALL stop earning EXP at its last level.

#### Scenario: EXP past a requirement raises the level

- **GIVEN** the Reputation is at a level with some EXP held
- **WHEN** enough Reputation EXP is gained to pass that level's requirement
- **THEN** the Reputation moves up to the next level
- **AND** the EXP beyond the requirement carries into the new level

#### Scenario: EXP short of a requirement holds the level

- **GIVEN** the Reputation is at a level
- **WHEN** gained EXP does not pass that level's requirement
- **THEN** the Reputation stays at its level with the EXP held

#### Scenario: The last level earns no further EXP

- **GIVEN** the Reputation is at its last level
- **WHEN** Reputation EXP is gained
- **THEN** the Reputation does not change

### Requirement: Each level pays its reward and opens its unlock

Each Reputation level SHALL pay its reward when reached and SHALL show the feature it unlocks in the game's own words on the reward page.

#### Scenario: Reaching a level pays its reward

- **GIVEN** a level has a reward
- **WHEN** the Reputation reaches that level
- **THEN** its reward is paid

#### Scenario: The reward page lists each level with its items and unlock

- **GIVEN** the reward page is opened on a level
- **WHEN** the page is shown
- **THEN** each level of the nation is listed with its items and the feature it unlocks
- **AND** the list scrolls when it is taller than the panel

#### Scenario: A level not yet reached shows as not achieved

- **GIVEN** the Reputation has not reached a level
- **WHEN** the reward page lists it
- **THEN** that level shows as not achieved

### Requirement: Requests and bounties pay Reputation EXP and Mora

Each request and each bounty SHALL pay the nation's Reputation EXP and Mora, with more of each at the harder difficulties.

#### Scenario: Claiming a request pays its EXP and Mora

- **GIVEN** a request is claimable
- **WHEN** the request is claimed
- **THEN** its Reputation EXP and Mora are paid

#### Scenario: A harder bounty pays more than an easier one

- **GIVEN** two bounties of the same kind differ in difficulty
- **WHEN** each is claimed
- **THEN** the harder one pays more Reputation EXP and more Mora

### Requirement: Requests and bounties are claimable three times a week across nations

Each kind of claim, requests and bounties counted apart, SHALL be limited to three claims a week across all nations, counted from the weekly reset.

#### Scenario: A fourth claim of a kind in the week is refused

- **GIVEN** three claims of a kind have been made this week across nations
- **WHEN** a further claim of that kind is attempted
- **THEN** the claim is refused until the weekly reset

#### Scenario: The weekly reset restarts the count

- **GIVEN** the weekly limit is reached for a kind
- **WHEN** the weekly reset passes
- **THEN** that kind can be claimed again up to the limit

#### Scenario: A claim at the reset counts toward the new week

- **GIVEN** a claim is made at the instant of the weekly reset
- **WHEN** the week's claims are counted
- **THEN** that claim counts toward the new week

### Requirement: The shop discount is 10 percent rounded down to five Mora

A Reputation discount SHALL take ten percent off a price and round the discounted price down to a multiple of five Mora.

#### Scenario: A discounted price rounds in the player's favour

- **GIVEN** a shop good has a price
- **WHEN** the Reputation discount is applied
- **THEN** the price is reduced by ten percent
- **AND** the result is rounded down to a multiple of five Mora

### Requirement: Each exploration threshold pays once

Each exploration threshold SHALL pay its reward once, and only for the thresholds a progress passes between its previous and its new percentage.

#### Scenario: Progress passing a threshold pays its reward

- **GIVEN** an exploration threshold lies between the previous and the new percentage
- **WHEN** the progress rises past it
- **THEN** the threshold's reward is paid

#### Scenario: A threshold already held pays nothing again

- **GIVEN** a threshold was paid earlier
- **WHEN** the progress rises again within the same range
- **THEN** no reward is paid for that threshold a second time
