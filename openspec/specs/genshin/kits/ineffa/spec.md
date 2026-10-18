## Purpose

Ineffa's kit as built: her four strikes, charged attack, Cleaning Mode as her skill, Cyclonic Exterminator as her burst, a low, high and collision plunge, and her Moonsign Benediction. Her Lunar-Charged passives and Constellations 1 and 6 are not built yet, and her Constellation 4 energy is built.

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
