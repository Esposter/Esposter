## Purpose

Nahida's kit as built, with her strikes, charged attack, plunges, All Schemes to Know's press and full hold, and what is left of Tri-Karma Purification, Illusory Heart's field and her passives.

## Requirements

### Requirement: Nahida's strikes and charged attack

Nahida's four strikes and charged attack SHALL land on the enemies within reach, dealing Dendro damage.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hit lands on the enemies within reach

### Requirement: Nahida's plunge attacks

Nahida's collision and two plunges SHALL land on the enemies within reach, with timing and poise provisional.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: All Schemes to Know's press and full hold

All Schemes to Know's press SHALL strike the enemies within reach as Dendro, and holding it for the full 300 frames SHALL release its full hold, while a shorter hold SHALL release the press.

#### Scenario: Press strikes the enemies in reach

- **WHEN** the player presses All Schemes to Know
- **THEN** the press strikes the enemies within its reach as Dendro

#### Scenario: Full hold releases the full hold

- **WHEN** the player holds All Schemes to Know for 300 frames and releases it
- **THEN** the full hold strikes the enemies within its reach

#### Scenario: Short hold releases the press

- **WHEN** the player holds All Schemes to Know for less than the full hold and releases it
- **THEN** the press plays instead

### Requirement: Unbuilt Nahida effects

Tri-Karma Purification, Illusory Heart's field and Nahida's Ascension and constellation passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Nahida has a passive, constellation or field unlocked
- **WHEN** the player fights with Nahida
- **THEN** those effects have no effect
