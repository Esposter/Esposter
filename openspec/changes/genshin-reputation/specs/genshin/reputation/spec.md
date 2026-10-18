## ADDED Requirements

### Requirement: Talking to the keeper opens the nation's Reputation screen

Talking to a nation's keeper SHALL open that nation's Reputation screen with its level, its EXP toward the next level, each level's reward and its four sources.

#### Scenario: Talking to Mondstadt's keeper opens its Reputation screen

- **GIVEN** the player stands by Mondstadt's keeper
- **WHEN** the player talks to her
- **THEN** Mondstadt's Reputation screen opens
- **AND** it shows the level, the EXP toward the next level and each level's reward

#### Scenario: The Reputation screen is not reached before the keeper stands

- **GIVEN** the keeper is not yet placed in the world
- **WHEN** the player looks for her in Mondstadt
- **THEN** no keeper is found and no Reputation screen opens from the world

### Requirement: Requests run as world quests from level two

From level 2 the keeper SHALL offer requests, run as world quests that pay Reputation EXP and Mora when completed.

#### Scenario: A request is not offered before level two

- **GIVEN** Mondstadt's Reputation is below level 2
- **WHEN** the player talks to the keeper
- **THEN** no request is offered

#### Scenario: A delivery request pays on completion

- **GIVEN** the player has accepted a delivery request at level 2
- **WHEN** the player delivers the items asked for
- **THEN** the request pays its Reputation EXP and Mora

#### Scenario: A group delivery request pays on completion

- **GIVEN** the player has accepted a request for any one of a group's items
- **WHEN** the player collects that many of the group's items
- **THEN** the request pays its Reputation EXP and Mora

### Requirement: Bounties are claimed back with the keeper after their target is defeated

From level 2 the keeper SHALL offer bounties, whose target spawns when the bounty is taken and is claimed back with the keeper once defeated.

#### Scenario: A bounty's target spawns when the bounty is taken

- **GIVEN** the player talks to the keeper at level 2
- **WHEN** the player takes a bounty
- **THEN** its target spawns at the place the bounty names

#### Scenario: A bounty cannot be claimed before its target is defeated

- **GIVEN** the player has taken a bounty and its target is alive
- **WHEN** the player talks to the keeper to claim it
- **THEN** the bounty is not claimed

#### Scenario: Natlan's keeper offers bounties from level one

- **GIVEN** the player is at level 1 in Natlan
- **WHEN** the player talks to the keeper there
- **THEN** a bounty is offered

### Requirement: Exploration thresholds pay Reputation once each

A nation's exploration threshold SHALL pay its Reputation EXP once, when the nation's exploration percentage first passes it.

#### Scenario: Passing an exploration threshold pays once

- **GIVEN** the nation's exploration percentage is below a threshold
- **WHEN** the percentage passes the threshold
- **THEN** the threshold pays its Reputation EXP once

#### Scenario: A passed threshold does not pay again

- **GIVEN** the threshold has already paid
- **WHEN** the exploration percentage stays above it
- **THEN** no further EXP is paid for it

### Requirement: A Reputation quest pays once

A Reputation quest SHALL pay its Reputation EXP once, when it is finished.

#### Scenario: A finished Reputation quest pays once

- **GIVEN** a Reputation quest is finished
- **WHEN** its reward is granted
- **THEN** its Reputation EXP is paid once

### Requirement: A discount applies only at the shops it names

A discount SHALL apply to the prices of the shops its text names and to no other shop.

#### Scenario: A discount applies at its named shop

- **GIVEN** a discount names a shop
- **WHEN** the player buys at that shop
- **THEN** the discount lowers its prices

#### Scenario: A discount does not apply at an unnamed shop

- **GIVEN** a discount names a shop
- **WHEN** the player buys at another shop
- **THEN** the prices stay as they were

### Requirement: Supply notices pay their tribe for donations

A Natlan supply notice SHALL take donated items, three a week shared between tribes, and each donation SHALL give 160 Reputation EXP to its tribe and a Sanctifying Unction.

#### Scenario: A donation to a supply notice pays its tribe and the player

- **GIVEN** the player holds the items a supply notice asks for
- **WHEN** the player donates them
- **THEN** the donor's tribe gains 160 Reputation EXP
- **AND** the player receives a Sanctifying Unction

#### Scenario: A fourth supply notice in a week is refused

- **GIVEN** three supply notices have been donated to this week across the tribes
- **WHEN** the player tries to donate to another
- **THEN** the donation is refused
