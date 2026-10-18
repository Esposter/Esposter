## Purpose

Emilie's kit as built, with her four strikes, charged attack, collision and plunges, the Lumidouce Case's summon hit with Spiritbreath Thorn, Constellation 2 and Ascension 4, and what is left waiting on the Cleardew hook.

## Requirements

### Requirement: Basic attacks

Emilie's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks, all dealing physical damage.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Emilie is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order
- **AND** each strike deals physical damage with no element and no gauge

### Requirement: Plunge poise

Emilie's low and high plunges SHALL deal 100 and 150 poise, and her collision attack SHALL deal none.

#### Scenario: The low and high plunges deal poise

- **GIVEN** Emilie is in the air
- **WHEN** her low plunge hits an enemy
- **THEN** the enemy takes 100 poise damage
- **AND** her high plunge deals 150 poise damage

#### Scenario: The collision attack deals no poise

- **GIVEN** Emilie is in the air
- **WHEN** her collision attack hits an enemy
- **THEN** the enemy takes no poise damage

### Requirement: Lumidouce Case and Spiritbreath Thorn

Pressing Lumidouce Case SHALL summon a case that hits once, and Spiritbreath Thorn SHALL land 62 frames after the press, with the skill cooling for 14 seconds before it can be pressed again.

#### Scenario: A press summons the case and Thorn lands

- **GIVEN** Emilie is the character on the field
- **WHEN** the player presses Lumidouce Case
- **THEN** the case's summon hit lands
- **AND** Spiritbreath Thorn lands 62 frames after the press

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Lumidouce Case was pressed less than 14 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Constellation 2 Dendro RES cut

From constellation 2, the skill's hits SHALL lower each struck enemy's Dendro RES by 30 percent for 10 seconds.

#### Scenario: A struck enemy loses Dendro RES

- **GIVEN** Emilie is at constellation 2
- **WHEN** a hit from Lumidouce Case strikes an enemy
- **THEN** that enemy's Dendro RES is lowered by 30 percent for 10 seconds

### Requirement: Ascension 4 DMG Bonus from total ATK

From Ascension 4, each strike that lands on a Burning enemy SHALL gain a DMG Bonus that grows with Emilie's total ATK.

#### Scenario: A strike on a Burning enemy gains the bonus

- **GIVEN** Emilie is at Ascension 4 and her total ATK is high
- **WHEN** one of her strikes lands on a Burning enemy
- **THEN** the strike gains the DMG Bonus

#### Scenario: The bonus is capped at 36 percent

- **GIVEN** Emilie is at Ascension 4
- **WHEN** the DMG Bonus from her total ATK would exceed 36 percent
- **THEN** the bonus stays at 36 percent

### Requirement: Burst placeholder until Cleardew is built

Emilie's burst SHALL spend 50 energy and start a thirteen and a half second cooldown, and it SHALL deal no damage until its Cleardew mechanic is built.

#### Scenario: The burst spends energy and deals no damage

- **GIVEN** Emilie has 50 energy
- **WHEN** the player casts the burst
- **THEN** the 50 energy is spent and the cooldown starts
- **AND** no damage is dealt

#### Scenario: The burst is refused without enough energy

- **GIVEN** Emilie has less than 50 energy
- **WHEN** the player casts the burst
- **THEN** it does not cast
