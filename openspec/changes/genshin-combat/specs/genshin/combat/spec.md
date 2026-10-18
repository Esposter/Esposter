## ADDED Requirements

### Requirement: Glimmer Reaction Damage

Stellar-Conduct and Stellar Swirl SHALL deal damage weighted across the four highest contributors, at 0.6, 0.3, 0.05 and 0.05, each contributor's damage worked out alone with standard crit.

#### Scenario: a Glimmer reaction weights its four highest contributors

- **GIVEN** a Stellar-Conduct with four contributors of differing damage
- **WHEN** the reaction deals its damage
- **THEN** the highest contributor counts for 60%, the next for 30%, and the two lowest of the four for 5% each

#### Scenario: a Glimmer reaction with a lower contributor is not counted

- **GIVEN** a Stellar Swirl with five contributors
- **WHEN** the reaction deals its damage
- **THEN** only the four highest contributors are counted

### Requirement: Stellar Swirl Once Enabled

Anemo SHALL turn a Cryo Swirl into Stellar Swirl while the party holds a Stellar Jubilee passive that enables Stellar Swirl.

#### Scenario: a Cryo Swirl starts Stellar Swirl while the party enables it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction is Stellar Swirl

#### Scenario: a Cryo Swirl stays an ordinary Swirl without the enabler

- **GIVEN** no party member holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction is an ordinary Swirl

#### Scenario: a Stellar Swirl spreads no Cryo beside it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction carries no spread gauge

### Requirement: Stellar-Conduct Once Enabled

A Superconduct SHALL become Stellar-Conduct while the party holds a Stellar Jubilee passive that enables Stellar-Conduct, and Stellar-Conduct SHALL NOT occur without one.

#### Scenario: a Superconduct becomes Stellar-Conduct while the party enables it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar-Conduct
- **WHEN** Electro meets a Cryo aura
- **THEN** the reaction is Stellar-Conduct

#### Scenario: no Stellar-Conduct occurs without the enabler

- **GIVEN** no party member holds a Stellar Jubilee passive that enables Stellar-Conduct
- **WHEN** Electro meets a Cryo aura
- **THEN** the reaction is an ordinary Superconduct

### Requirement: Stellar Jubilee Enables Both Reactions

A Stellar Linchpin user's Stellar Jubilee passive SHALL enable Stellar Swirl and Stellar-Conduct for the party it is in.

#### Scenario: a Stellar Jubilee passive enables both reactions for its party

- **GIVEN** a party member holds a Stellar Jubilee passive
- **WHEN** the party's reactions are read
- **THEN** Stellar Swirl and Stellar-Conduct are both enabled
