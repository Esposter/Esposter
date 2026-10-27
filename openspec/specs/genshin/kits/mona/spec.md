## Purpose

Mona's kit as built: four strikes, a charged attack, Mirror Reflection of Doom's summon, Stellaris Phantasm's bubble and Omen, A1's phantom, A4's Hydro bonus, Constellations 1, 2, 4 and 6 (Constellation 1's Frozen duration left out, as gcsim marks it bugged), with her plunges' reach provisional.

## Requirements

### Requirement: Mona's strikes and charged attack

Mona's four strikes and charged attack SHALL deal Hydro damage to the enemies around her.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order and deal Hydro damage to the enemies around Mona

#### Scenario: Charged attack deals Hydro damage

- **WHEN** the player uses the charged attack
- **THEN** its hits deal Hydro damage to the enemies around Mona

### Requirement: Mirror Reflection of Doom

Mona's skill SHALL summon Mirror Reflection of Doom.

#### Scenario: Skill summons the mirror

- **WHEN** the player presses Mona's skill
- **THEN** Mirror Reflection of Doom is summoned

### Requirement: Stellaris Phantasm's bubble

Stellaris Phantasm SHALL hold each enemy it strikes in a bubble for 8 seconds.

#### Scenario: Bubble holds the enemy

- **WHEN** the player casts Stellaris Phantasm
- **THEN** each enemy it strikes is held in a bubble for 8 seconds

### Requirement: Stellaris Phantasm's Omen

A hit with poise damage on an enemy held in a bubble SHALL burst the bubble and start an Omen lasting 4 seconds that adds 42% damage to hits on that enemy.

#### Scenario: Poise hit bursts the bubble into an Omen

- **GIVEN** an enemy is held in a bubble
- **WHEN** a hit with poise damage strikes it
- **THEN** the bubble bursts
- **AND** an Omen adds 42% damage to hits on that enemy for 4 seconds

### Requirement: Stellaris Phantasm's explosion

Stellaris Phantasm's explosion SHALL deal Hydro damage to a single target on the step after the burst.

#### Scenario: Explosion hits one enemy

- **WHEN** the player casts Stellaris Phantasm
- **THEN** the explosion deals Hydro damage to one target on the step after the burst
- **AND** the explosion does not spread to a neighbouring enemy

### Requirement: A1 phantom while sprinting

While Mona sprints, Ascension 1 SHALL cast a phantom every 2 seconds where she stands, and each phantom SHALL explode at its end.

#### Scenario: Sprinting casts phantoms

- **GIVEN** Mona has Ascension 1
- **WHEN** Mona sprints for 2 seconds
- **THEN** a phantom is cast where she stands
- **AND** it explodes at its end

### Requirement: A4 Hydro DMG Bonus

Mona's Ascension 4 SHALL add 20% of her Energy Recharge to her Hydro DMG Bonus on every hit she prices, including her summons' hits.

#### Scenario: Energy Recharge raises Hydro damage

- **GIVEN** Mona has Ascension 4 and Energy Recharge
- **WHEN** a Hydro hit of hers, or of her summon, lands
- **THEN** its Hydro DMG Bonus includes 20% of her Energy Recharge

### Requirement: Constellation 1 adds to a striker's Hydro-related reactions while an Omen holds

From Constellation 1, a party member's hit on an enemy under the Omen SHALL give that member's Electro-Charged, Vaporize, Lunar-Charged, Lunar-Crystallize and Hydro Swirl 15% more DMG for eight seconds, and 160% of that for an off-field member while Mona is Hexerei with a second Hexerei member on the team.

#### Scenario: A hit on an Omen adds 15% to the striker's reactions for eight seconds

- **GIVEN** Mona has Constellation 1
- **WHEN** a party member hits an enemy under the Omen, and then its Electro-Charged reaction lands
- **THEN** that reaction deals 15% more DMG, and the bonus is gone eight seconds after the hit

#### Scenario: A Hydro Swirl gains the bonus, and another Swirl does not

- **GIVEN** Mona has Constellation 1
- **WHEN** a party member hits an enemy under the Omen, and then a Hydro Swirl and an Anemo Swirl land on it
- **THEN** the Hydro Swirl deals 15% more DMG, and the Anemo Swirl deals no more

#### Scenario: An off-field member gets 160% while Mona is Hexerei with a second Hexerei member

- **GIVEN** Mona has Constellation 1, is Hexerei with a second Hexerei member on the team, and the member that hit the Omen is off the field
- **WHEN** that member's reaction lands
- **THEN** the bonus is 24% more DMG

### Requirement: Constellation 4 adds CRIT to strikes on an Omen or a bubble

From Constellation 4, each party member's strike on an enemy under the Omen or Mona's bubble SHALL gain 15% CRIT Rate, and a Hexerei member's strike SHALL gain 15% CRIT DMG while Mona is Hexerei with a second Hexerei member on the team.

#### Scenario: A strike on an Omen or a bubble gains CRIT Rate

- **GIVEN** Mona has Constellation 4
- **WHEN** any party member strikes an enemy under the Omen or in her bubble
- **THEN** that strike gains 15% CRIT Rate

#### Scenario: A Hexerei strike gains CRIT DMG while the team is Hexerei

- **GIVEN** Mona has Constellation 4 and is Hexerei with a second Hexerei member on the team
- **WHEN** a Hexerei member strikes an enemy under the Omen
- **THEN** that strike gains 15% CRIT DMG

### Requirement: Constellation 4 adds CRIT to Lunar reactions on an Omen or a bubble

From Constellation 4, each party member's Lunar-Charged and Lunar-Crystallize reaction on an enemy under the Omen or Mona's bubble SHALL gain 15% CRIT Rate, and a Hexerei member's such reaction 15% CRIT DMG while Mona is Hexerei with a second Hexerei member on the team.

#### Scenario: A Lunar reaction on an Omen gains CRIT

- **GIVEN** Mona has Constellation 4 and is Hexerei with a second Hexerei member on the team
- **WHEN** a Hexerei member's Lunar-Crystallize lands on an enemy under the Omen
- **THEN** that reaction gains 15% CRIT Rate and 15% CRIT DMG

### Requirement: Constellation 2's Charged Attack follow-up

From Constellation 2, a normal attack's last hit SHALL have a 20% chance to be followed by her Charged Attack's hit at that hit's hitmark, and no follow-up SHALL land within 5 seconds of the last one.

#### Scenario: A normal attack may be followed by a Charged Attack

- **GIVEN** Mona has Constellation 2
- **WHEN** a normal attack's last hit lands and the roll is under 20%
- **THEN** her Charged Attack's hit lands at that hit's hitmark

#### Scenario: Follow-up is limited to once in 5 seconds

- **GIVEN** Mona has Constellation 2 and a follow-up has just landed
- **WHEN** a normal attack's last hit lands within 5 seconds of it
- **THEN** no follow-up lands

#### Scenario: Below Constellation 2 nothing follows

- **GIVEN** Mona has Constellation 1
- **WHEN** a normal attack's last hit lands
- **THEN** no follow-up lands

### Requirement: Constellation 6's sprint stacks on her Charged Attack

From Constellation 6, each second of sprint SHALL give her next Charged Attack 60% more DMG, up to three seconds' worth, for eight seconds from the last stack.

#### Scenario: Each sprinted second adds a stack, up to three

- **GIVEN** Mona has Constellation 6
- **WHEN** she sprints for 3.5 seconds and then lands a Charged Attack
- **THEN** that attack deals 180% more DMG, from three stacks

#### Scenario: Stacks run out eight seconds after the last one

- **GIVEN** Mona has Constellation 6 and has sprinted for 1.5 seconds
- **WHEN** eight seconds pass without a new stack
- **THEN** the bonus is gone

#### Scenario: Below Constellation 6 nothing is added

- **GIVEN** Mona has Constellation 5
- **WHEN** she sprints and lands a Charged Attack
- **THEN** the attack gains nothing

### Requirement: Constellation 6's stack reset

A Charged Attack that strikes SHALL reset the sprint stacks.

#### Scenario: The stacks reset when a Charged Attack strikes

- **GIVEN** Mona has Constellation 6 and has sprinted for 2.5 seconds
- **WHEN** her Charged Attack strikes
- **THEN** the stacks are gone and the next Charged Attack gains nothing

### Requirement: Unbuilt Mona effects

Constellation 1's Frozen duration and Hexerei's post-burst follow-up SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Mona has Constellation 1, or is Hexerei
- **WHEN** the player fights with Mona
- **THEN** those effects have no effect

### Requirement: Mona's plunge reach

Mona's plunge reach SHALL be provisional.

#### Scenario: Plunge reach is provisional

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands within a provisional reach
