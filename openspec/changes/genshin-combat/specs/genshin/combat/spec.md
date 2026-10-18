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

### Requirement: Stellar Swirl Where A Gadget Stands

Anemo SHALL turn a Swirl into Stellar Swirl where a gadget placed by a kit stands.

#### Scenario: a Swirl starts Stellar Swirl where a placed gadget stands

- **GIVEN** a gadget placed by a kit on an enemy's ground
- **WHEN** an Anemo attack Swirls that enemy where the gadget stands
- **THEN** the reaction is Stellar Swirl

#### Scenario: a Swirl without a placed gadget stays an ordinary Swirl

- **GIVEN** no gadget placed by a kit where the enemy stands
- **WHEN** an Anemo attack Swirls that enemy
- **THEN** the reaction is an ordinary Swirl

### Requirement: Stellar-Conduct Needs Its Gadget

Stellar-Conduct SHALL occur only where a gadget placed by a kit stands.

#### Scenario: Stellar-Conduct occurs where a placed Polestar stands

- **GIVEN** a Polestar placed by a kit
- **WHEN** a reaction is triggered on an enemy within the Polestar
- **THEN** Stellar-Conduct occurs

#### Scenario: no Stellar-Conduct occurs with no gadget placed

- **GIVEN** no gadget placed by a kit
- **WHEN** a reaction is triggered on an enemy
- **THEN** Stellar-Conduct does not occur
