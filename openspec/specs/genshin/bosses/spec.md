## Purpose

The game's bosses as pure rules in genshin-world. A normal boss stays defeated until its Trounce Blossom is claimed and comes back five seconds after the claim. A week's weekly-boss claims are counted from the Monday 04:00 reset on the server's clock, the count pricing each claim 30 resin for the first three and 60 after. The fights, the blossom's offer and the boss's rewards are the proposal's still. The rules are built as pure services that the world does not yet call.

## Requirements

### Requirement: A normal boss returns only after its blossom is claimed

A normal boss SHALL stay defeated until its Trounce Blossom is claimed, and SHALL return five seconds after a claim.

#### Scenario: Unclaimed boss stays defeated

- **GIVEN** a normal boss is defeated and its Trounce Blossom is not claimed
- **WHEN** time passes
- **THEN** the boss stays defeated until the player teleports away

#### Scenario: Claimed boss returns five seconds later

- **GIVEN** a normal boss is defeated and its Trounce Blossom is claimed
- **WHEN** the claim is made
- **THEN** the boss returns five seconds after the claim

### Requirement: The weekly reset falls on Monday at 04:00

The weekly reset SHALL fall on Monday at 04:00 on the server's clock.

#### Scenario: Moment before the reset belongs to the week before

- **GIVEN** a moment just before Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the week before

#### Scenario: Moment at or after the reset belongs to the new week

- **GIVEN** a moment at or after Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the new week

### Requirement: The first three weekly claims of a week are priced at 30 resin

The first three weekly-boss claims of each week SHALL cost 30 resin each, every later claim SHALL cost 60 resin, and the count SHALL cover all weekly bosses together.

#### Scenario: First claim of the week costs 30 resin

- **GIVEN** no weekly-boss claim has been made this week
- **WHEN** the player claims a weekly boss
- **THEN** the claim costs 30 resin

#### Scenario: Fourth claim of the week costs 60 resin

- **GIVEN** three claims have been made this week, for any weekly bosses
- **WHEN** the next claim is made
- **THEN** the claim costs 60 resin

#### Scenario: Claim at the reset counts toward the new week

- **GIVEN** a claim is made at exactly Monday 04:00
- **WHEN** it is the week's first claim
- **THEN** it counts toward the new week
