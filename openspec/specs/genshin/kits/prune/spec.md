## Purpose

Prune's kit as built: her normal attacks, charged attack, plunges, Anemo skill press and burst's initial hit, with her skill's Clang Clang convert and her passives left waiting on their hooks, and the burst's Witchlure Bell DoT built on the nearest enemy.

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

### Requirement: Witchlure Bell damage over time

Prune's burst SHALL leave the Witchlure Bell, which ticks Anemo damage over time on the enemy nearest her within 10 metres: its first tick 137 frames after the cast, each later tick 117 frames after the last, for the burst's 813 frames.

#### Scenario: Bell ticks on the nearest enemy

- **GIVEN** an enemy stands within 10 metres of Prune
- **WHEN** a tick falls
- **THEN** the damage over time lands on the nearest enemy within 10 metres

#### Scenario: Bell ticks nothing with no enemy in reach

- **GIVEN** no enemy stands within 10 metres of Prune
- **WHEN** a tick falls
- **THEN** no damage over time is dealt

### Requirement: Clang Clang convert and passives not yet built

Prune's Clang Clang convert on a second press and her passives SHALL NOT take effect.

#### Scenario: Second press does not convert

- **WHEN** the player presses Prune's skill a second time
- **THEN** no Clang Clang convert takes effect
