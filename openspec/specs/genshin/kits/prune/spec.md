## Purpose

Prune's kit as built: her normal attacks, charged attack, plunges, Anemo skill press and burst's initial hit, with her skill's Clang Clang convert, the burst's Witchlure Bell DoT and her passives left waiting on their hooks.

## Requirements

### Requirement: Prune's normal attacks, charged attack and plunges

Prune's normal attacks, charged attack, collision and plunges SHALL land on the enemies within reach.

#### Scenario: Normal attack lands

- **WHEN** the player uses normal attack
- **THEN** the strikes land on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Ring-A-Ding-Ding press

Prune's skill press SHALL deal Anemo damage in a 2.5-metre circle offset 1.4 metres ahead of her, and SHALL go on a 15-second cooldown.

#### Scenario: Press hits the circle ahead

- **WHEN** the player presses Prune's skill
- **THEN** Anemo damage lands in the 2.5-metre circle offset 1.4 metres ahead
- **AND** the skill goes on a 15-second cooldown

#### Scenario: Press refused during cooldown

- **GIVEN** Prune's skill is on cooldown
- **WHEN** the player presses it
- **THEN** the press is not used

### Requirement: Prune's burst initial hit

Prune's burst SHALL cost 70 energy, deal Anemo damage in a 6.5-metre circle on the primary target, and go on an 18-second cooldown.

#### Scenario: Burst with enough energy

- **GIVEN** Prune has at least 70 energy
- **WHEN** the player casts the burst
- **THEN** Anemo damage lands in the 6.5-metre circle
- **AND** the burst goes on an 18-second cooldown

#### Scenario: Burst refused without enough energy

- **GIVEN** Prune has less than 70 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: Clang Clang convert and Witchlure Bell not yet built

Prune's Clang Clang convert on a second press, the burst's Witchlure Bell damage over time and her passives SHALL NOT take effect.

#### Scenario: Second press does not convert

- **WHEN** the player presses Prune's skill a second time
- **THEN** no Clang Clang convert takes effect

#### Scenario: Burst leaves no bell damage

- **WHEN** the player casts Prune's burst
- **THEN** no Witchlure Bell damage over time is dealt
