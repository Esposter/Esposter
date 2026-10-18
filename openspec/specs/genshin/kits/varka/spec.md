## Purpose

Varka's kit as built: his five strikes, charged attack, plunges, Anemo skill and Anemo burst's two hits, with his Four Winds state and passives left waiting on their hooks.

## Requirements

### Requirement: Varka's strikes, charged attack and plunges

Varka's five normal attacks SHALL deal Physical damage, his charged attack of two hits SHALL need 50 stamina to start, and his plunges SHALL land on the enemies within reach.

#### Scenario: Five normal attacks in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order and deal Physical damage

#### Scenario: Charged attack refused without stamina

- **GIVEN** Varka has less than 50 stamina
- **WHEN** the player uses the charged attack
- **THEN** the charged attack does not start

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Varka's Anemo skill

Varka's skill SHALL deal Anemo damage in a 5-metre circle round his body and SHALL go on a 16-second cooldown.

#### Scenario: Skill hits the circle round Varka

- **WHEN** the player presses Varka's skill
- **THEN** Anemo damage lands within a 5-metre circle round his body
- **AND** the skill goes on a 16-second cooldown

### Requirement: Varka's Anemo burst

Varka's burst SHALL cost 60 energy, go on a 15-second cooldown, and deal two Anemo hits in a 9-metre area reaching from the circle set 2 metres ahead of his body.

#### Scenario: Burst with enough energy

- **GIVEN** Varka has at least 60 energy
- **WHEN** the player casts the burst
- **THEN** two Anemo hits land in the 9-metre area
- **AND** the burst goes on a 15-second cooldown

#### Scenario: Burst refused without enough energy

- **GIVEN** Varka has less than 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: Four Winds and passives not yet built

Varka's Four Winds conversion, his passives and his burst's converted element SHALL NOT take effect.

#### Scenario: Second skill press does not convert

- **WHEN** the player presses Varka's skill a second time
- **THEN** no Four Winds conversion takes effect
