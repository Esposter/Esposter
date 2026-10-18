## Purpose

Ineffa's kit as built: her four strikes, charged attack, Cleaning Mode as her skill, Cyclonic Exterminator as her burst, a low, high and collision plunge, and her Moonsign Benediction. Her Ascension 4 passive, her Electro particles, Constellation 2's shield and Punishment Edit, and Constellation 4's energy are built; her Ascension 1 passive and Constellations 1 and 6 are not built yet.

## Requirements

### Requirement: Four strikes and charged attack

Ineffa's four strikes and charged attack SHALL be her normal attacks, and the charged attack SHALL cost 25 stamina.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Ineffa is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four strikes play in order
- **AND** none of her normal attacks deals poise

#### Scenario: The charged attack spends 25 stamina

- **GIVEN** Ineffa has at least 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays
- **AND** 25 stamina is spent

### Requirement: Cleaning Mode raises an Electro shield

Cleaning Mode SHALL raise an Electro shield on Ineffa, sized by her ATK as it stands when the shield is set, and the shield SHALL last 20 seconds.

#### Scenario: The shield is set and sized by her ATK

- **GIVEN** Ineffa is the character on the field and Cleaning Mode is off cooldown
- **WHEN** the player casts Cleaning Mode
- **THEN** the shield is placed 4 frames in
- **AND** its amount is a share of her ATK plus a flat amount of HP
- **AND** it lasts 20 seconds from its placement

#### Scenario: Cleaning Mode cannot be cast during its cooldown

- **GIVEN** Cleaning Mode is cooling down
- **WHEN** the player casts Cleaning Mode again
- **THEN** nothing happens

### Requirement: Each Birgitta summon ends the one on the field

Each summon of Birgitta SHALL end the one already on the field, so only one of her stands at a time.

#### Scenario: Cleaning Mode summons Birgitta

- **GIVEN** no Birgitta stands
- **WHEN** the player casts Cleaning Mode
- **THEN** Birgitta is summoned 68 frames in

#### Scenario: Cyclonic Exterminator summons Birgitta again

- **GIVEN** a Birgitta stands
- **WHEN** the hit of Cyclonic Exterminator lands at 111 frames
- **THEN** Birgitta is summoned again
- **AND** the earlier Birgitta ends

### Requirement: Birgitta discharges ten times

Birgitta SHALL discharge ten times on a circle of radius 4 metres centred on the targeted enemy and SHALL stand for 1,200 frames from her spawn.

#### Scenario: Her discharges land on their schedule

- **GIVEN** Birgitta has just been summoned
- **WHEN** 42 frames pass from her spawn
- **THEN** she discharges on the targeted enemy
- **AND** she discharges again every 119 frames, ten discharges in all

#### Scenario: Birgitta stands for 1,200 frames

- **GIVEN** Birgitta has just been summoned
- **WHEN** 1,200 frames pass from her spawn
- **THEN** she stands for the full 1,200 frames and then leaves

### Requirement: Cyclonic Exterminator is the burst

Cyclonic Exterminator SHALL be Ineffa's burst, costing 60 energy and going on a 15-second cooldown, and its hit SHALL summon Birgitta.

#### Scenario: Casting the burst summons Birgitta at its hit

- **GIVEN** Ineffa has 60 energy
- **WHEN** the player casts Cyclonic Exterminator
- **THEN** its hit lands 111 frames in
- **AND** Birgitta is summoned at that hit
- **AND** 60 energy is spent

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts Cyclonic Exterminator again
- **THEN** nothing happens

### Requirement: Moonsign Benediction turns Electro-Charged into Lunar-Charged

Ineffa's Moonsign Benediction SHALL turn the party's Electro-Charged reactions into Lunar-Charged and raise the party's Lunar-Charged Base DMG Bonus with her ATK, up to a cap of 14%.

#### Scenario: Electro-Charged becomes Lunar-Charged

- **GIVEN** Ineffa is on the field
- **WHEN** an Electro-Charged reaction occurs on an enemy hit by the party
- **THEN** the reaction is Lunar-Charged instead

#### Scenario: The Lunar-Charged bonus stops at its cap

- **GIVEN** Ineffa's ATK is high enough that the bonus would pass 14%
- **WHEN** a Lunar-Charged reaction occurs in the party
- **THEN** the party's Lunar-Charged Base DMG Bonus rises 0.7% for each 100 of her ATK
- **AND** the rise stops at 14%

### Requirement: Constellation 4 energy on Lunar-Charged

From Constellation 4, a Lunar-Charged reaction in Ineffa's party SHALL restore 5 Energy to her, once every 4 seconds.

#### Scenario: Constellation 4 restores energy

- **GIVEN** Ineffa has Constellation 4
- **WHEN** a Lunar-Charged reaction occurs in the party
- **THEN** Ineffa gains 5 Energy

#### Scenario: The energy waits out its cooldown

- **GIVEN** Ineffa has just gained energy from a Lunar-Charged reaction at Constellation 4
- **WHEN** another Lunar-Charged reaction occurs within 4 seconds
- **THEN** no energy is gained

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Ineffa has Constellation 3
- **WHEN** a Lunar-Charged reaction occurs in the party
- **THEN** no energy is gained

### Requirement: Birgitta's discharges drop Electro particles

Each discharge of Birgitta that lands SHALL drop an Electro particle two times in three, and the particle SHALL land 100 frames later.

#### Scenario: A landed discharge drops a particle 100 frames later

- **GIVEN** a discharge of Birgitta lands 110 frames into her stay
- **WHEN** its roll is under two in three
- **THEN** the particle lands 100 frames later, its energy going to the party as a drop's does

#### Scenario: A roll of two in three or more drops no particle

- **GIVEN** a discharge of Birgitta lands
- **WHEN** its roll is two in three or more
- **THEN** no particle drops

### Requirement: Constellation 2 places a shield and marks the burst's first enemy

From Constellation 2, Ineffa's burst SHALL place its Electro shield 37 frames in, and SHALL mark the first enemy it hits for a Punishment Edit.

#### Scenario: The burst's shield comes 37 frames in

- **GIVEN** Ineffa has Constellation 2
- **WHEN** 37 frames pass from her burst
- **THEN** an Electro shield stands, and none stood at 36 frames

#### Scenario: The first enemy the burst hits takes a Punishment Edit 60 frames later

- **GIVEN** Ineffa has Constellation 2
- **WHEN** her burst hits an enemy and no other hit comes first
- **THEN** a Lunar-Charged hit of 3 times her ATK in a radius of 6 metres strikes that enemy 60 frames after the burst's hit

#### Scenario: The enemy's next hit fires the Punishment Edit when it comes sooner

- **GIVEN** an enemy carries Ineffa's Punishment Edit mark
- **WHEN** a hit lands on it before 60 frames pass
- **THEN** the Punishment Edit fires on that hit

#### Scenario: The burst marks only the first enemy it hits

- **GIVEN** Ineffa's burst hits two enemies in turn
- **WHEN** the first carries the mark
- **THEN** the second carries none

### Requirement: Birgitta's discharges queue a Lunar-Charged hit while a Lunar-Charged reaction holds

From Ascension 1, each discharge of Birgitta SHALL queue a Lunar-Charged Electro hit 38 frames after it, of 0.65 of Ineffa's ATK and ignoring all of the enemy's DEF, on the primary target's circle of radius 4, when a Lunar-Charged reaction of the party has been triggered within the last 5.5 seconds.

#### Scenario: A discharge in the window queues the hit 38 frames later

- **GIVEN** Ineffa is at Ascension 1 and a Lunar-Charged reaction is triggered at the cast
- **WHEN** a discharge of Birgitta falls due 110 frames in
- **THEN** the Lunar-Charged hit is queued 148 frames in, on the primary target

#### Scenario: A discharge after the window queues nothing

- **GIVEN** a Lunar-Charged reaction is triggered at the cast
- **WHEN** a discharge falls due 348 frames in, more than 5.5 seconds after the reaction
- **THEN** no hit is queued

#### Scenario: Below Ascension 1 nothing is queued

- **GIVEN** Ineffa is below Ascension 1
- **WHEN** a discharge falls due in a Lunar-Charged window
- **THEN** no hit is queued

#### Scenario: No primary target means no hit

- **GIVEN** no enemy is the primary target
- **WHEN** a discharge falls due in a Lunar-Charged window
- **THEN** no hit is queued
