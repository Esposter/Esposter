## Purpose

Wriothesley's kit as built, with his five strikes, charged attack, plunges and Darkgold Wolfbite, Icefang Rush's enhancement of his normal attacks and Prosecution Edict, and what is left of his enhanced damage and hitboxes, Surging Blade, Gracious Rebuke and constellations.

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

### Requirement: Icefang Rush enhances his normal attacks

Icefang Rush SHALL hold for ten seconds and end when Wriothesley swaps off. While it holds and his HP is above half of his Max HP, each strike of his normal attacks SHALL drain him 4.5% of his Max HP as Chilling Penalty, once every 6 frames, and SHALL give one Cryo particle every two seconds, collected 100 frames after it is given.

#### Scenario: Icefang Rush lasts ten seconds and ends when he swaps off

- **WHEN** the player presses Icefang Rush and then swaps off Wriothesley
- **THEN** the enhancement holds for ten seconds and ends on the swap

#### Scenario: a normal attack drains 4.5% of his Max HP as Chilling Penalty while Icefang Rush holds, once per 6 frames

- **GIVEN** Icefang Rush holds and Wriothesley's HP is above half
- **WHEN** the player uses normal attacks within 5 frames of a drain, and then after 7 frames
- **THEN** the first drain takes 4.5% of his Max HP, the strike within 5 frames gives no drain, and the strike after 7 frames drains him again

#### Scenario: his normal attacks drain nothing while Icefang Rush is off or his HP is at half or less

- **WHEN** the player uses a normal attack while Icefang Rush is off, or while his HP is at half or less
- **THEN** no drain is taken

#### Scenario: his enhanced normal attacks give one Cryo particle every two seconds, collected 100 frames after it is given

- **GIVEN** Icefang Rush holds and Wriothesley's HP is above half
- **WHEN** the player uses normal attacks within two seconds of a particle, and then the particle expires
- **THEN** one particle is given and collected by Wriothesley's energy, and the strike within two seconds gives none

### Requirement: Prosecution Edict

From Ascension 4, each self-drain of Wriothesley's HP, and each heal that restores some of it, while Icefang Rush holds and he is on the field SHALL add a stack of Prosecution Edict, up to five. Each stack SHALL raise his ATK by 6% for as long as the skill does, and recasting Icefang Rush SHALL reset the stacks.

#### Scenario: from Ascension 4, each self-drain adds a Prosecution Edict stack, up to five, each raising his ATK 6%

- **GIVEN** Wriothesley is at Ascension 4 and Icefang Rush holds
- **WHEN** he drains his own HP six times
- **THEN** Prosecution Edict holds five stacks and raises his ATK by 30%

#### Scenario: a heal that restores no HP adds no Prosecution Edict stack

- **GIVEN** Wriothesley is at Ascension 4 and Icefang Rush holds
- **WHEN** he is healed by an amount that overflows his Max HP entirely
- **THEN** no stack is added

#### Scenario: below Ascension 4, a self-drain gives no Prosecution Edict

- **GIVEN** Wriothesley is below Ascension 4
- **WHEN** he drains his own HP while Icefang Rush holds
- **THEN** no Prosecution Edict is held

#### Scenario: recasting Icefang Rush resets Prosecution Edict's stacks and its ATK

- **GIVEN** Prosecution Edict holds a stack
- **WHEN** the player recasts Icefang Rush
- **THEN** Prosecution Edict holds no stacks and raises his ATK by nothing

### Requirement: Unbuilt Wriothesley effects

The damage multiplier and the larger hitboxes of Icefang Rush's enhanced strikes, Surging Blade, Gracious Rebuke and Wriothesley's constellations SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Wriothesley has an enhanced strike, Surging Blade, Gracious Rebuke or a constellation unlocked
- **WHEN** the player fights with Wriothesley
- **THEN** the enhanced strike deals its base damage on its base hitbox, and that other effect has no effect
