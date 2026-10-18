## Purpose

Wriothesley's kit as built, with his five strikes, charged attack, plunges and Darkgold Wolfbite, and what is left of his Icefang Rush's enhanced strikes, Surging Blade, Chilling Penalty and passives.

## Requirements

### Requirement: Wriothesley's cryo strikes, charged attack and plunges

Wriothesley's five cryo strikes SHALL land in order, and his charged attack and plunges SHALL land on the enemies within reach, each strike hitting the target's reach as a circle of the box's length, provisionally.

#### Scenario: Five cryo strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five cryo strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Darkgold Wolfbite

Darkgold Wolfbite SHALL land five cryo strikes on the target from 99 frames, and the skill SHALL go on its cooldown when cast.

#### Scenario: Burst strikes the target five times

- **WHEN** the player casts Darkgold Wolfbite
- **THEN** five cryo strikes land on the target from 99 frames

### Requirement: Icefang Rush deals no damage

Icefang Rush SHALL deal no damage, and its animation and cooldown SHALL play when pressed.

#### Scenario: Icefang Rush deals no damage

- **WHEN** the player presses Icefang Rush
- **THEN** its animation plays and no damage is dealt

### Requirement: Unbuilt Wriothesley effects

Icefang Rush's enhanced normal attacks, Surging Blade, Chilling Penalty and Wriothesley's passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Wriothesley has an enhanced attack, Surging Blade, Chilling Penalty or passive unlocked
- **WHEN** the player fights with Wriothesley
- **THEN** that effect has no effect
