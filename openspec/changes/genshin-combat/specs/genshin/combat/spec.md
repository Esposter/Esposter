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

### Requirement: Starlight Prism Sustains a Polestar Field

A Stellar-Conduct SHALL leave a Starlight Prism that lasts 7 seconds and sustains a Polestar Field of radius 15 around it, the field standing for as long as the prism does. A Stellar-Conduct triggered while a field stands SHALL set its time back to 7 seconds rather than leave a second field.

#### Scenario: a Stellar-Conduct sustains its Polestar Field for 7 seconds

- **WHEN** a Stellar-Conduct is triggered and no Polestar Field stands
- **THEN** a Polestar Field of radius 15 stands at the body on the field for 7 seconds, as gcsim places it at the player (`stellarconduct_gadget.go`), placed by the reaction path for any enabler

#### Scenario: a Stellar-Conduct refreshes a standing Polestar Field

- **WHEN** a Stellar-Conduct is triggered while a Polestar Field stands
- **THEN** the field's time is set back to 7 seconds, and no second field stands

### Requirement: Starlight Prism Buffs by Recorded Hits

Inside the field, a Cryo or Electro hit on an enemy that applies an element, as its internal cooldown allows, SHALL be recorded by the prism, the hit that created the prism excepted. Every 4 seconds the count resets, and the buffs it grants last 4 seconds: the Base Reaction Coefficient of the Stellar-Conduct, the Cryo and Electro DMG Bonus of the characters in the field, and the Physical RES reduction of the enemies in it.

#### Scenario: a recorded hit raises the Stellar-Conduct's coefficient

- **WHEN** one Cryo or Electro hit is recorded
- **THEN** the Base Reaction Coefficient is 1.45, rising by 0.05 for each further hit up to 12 hits, where it is 2

#### Scenario: a field with no recorded hit gives a 20% Cryo and Electro DMG Bonus

- **WHEN** no Cryo or Electro hit is recorded
- **THEN** the characters in the field have a 20% Cryo and Electro DMG Bonus

#### Scenario: a field with recorded hits gives 28% plus 1% a hit

- **WHEN** one Cryo or Electro hit is recorded
- **THEN** the characters in the field have a 29% Cryo and Electro DMG Bonus, rising by 1% for each further hit up to 12 hits, where it is 40%

#### Scenario: a field lowers the enemies' Physical RES by 40%

- **WHEN** an enemy stands in the field
- **THEN** its Physical RES is reduced by 40%

### Requirement: Stellar Swirl Places a Stellar Vortex

A Stellar Swirl SHALL deal Anemo damage to its target and then leave one Stellar Vortex lasting 3 seconds, and a standing vortex SHALL NOT be doubled. A vortex SHALL explode after a delay for AoE Cryo damage. The third Stellar Swirl SHALL level it to Lv. 2, which deals more damage across a wider area, and three further Stellar Swirls SHALL explode it at once.

#### Scenario: a Stellar Swirl leaves one Stellar Vortex for 3 seconds

- **WHEN** a Stellar Swirl is triggered and no vortex stands
- **THEN** one Lv. 1 Stellar Vortex stands for 3 seconds

#### Scenario: the third Stellar Swirl levels the vortex up

- **WHEN** the third Stellar Swirl is triggered
- **THEN** the vortex is Lv. 2

#### Scenario: three more Stellar Swirls explode a vortex at once

- **WHEN** three more Stellar Swirls are triggered after the vortex levels up
- **THEN** the vortex explodes at once

### Requirement: Stellar Vortex Explosion Coefficient

A Stellar Vortex's explosion SHALL be priced at a Base Reaction Coefficient of 2 at Lv. 1 and 3 at Lv. 2, and a Stellar Swirl's Anemo instance at 0.75, as the wiki's Damage page gives them for the indirect Stellar Glimmer damage. Its contributors' damage is weighted as the Glimmer Reaction Damage requirement above states.

#### Scenario: a Stellar Vortex explodes at a coefficient of 2 for its first two stacks

- **WHEN** a vortex has one or two stacks of Stellar Swirl
- **THEN** its explosion's Base Reaction Coefficient is 2

#### Scenario: a Stellar Vortex explodes at a coefficient of 3 from its third stack

- **WHEN** a vortex has three or more stacks of Stellar Swirl
- **THEN** its explosion's Base Reaction Coefficient is 3

#### Scenario: a Stellar Swirl's Anemo instance has a coefficient of 0.75

- **WHEN** a Stellar Swirl is triggered
- **THEN** its Anemo instance's Base Reaction Coefficient is 0.75
