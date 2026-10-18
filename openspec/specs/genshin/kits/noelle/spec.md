## Purpose

Noelle's kit as built: four strikes, a charged attack, Breastplate's press with its shield and heal, and Sweeping Time's slashes with its Geo infusion and ATK bonus, with her constellations I Got Your Back, Combat Maid, To Be Cleaned and Must Be Spotless built.

## Requirements

### Requirement: Noelle's four strikes and charged attack

Noelle's four strikes SHALL land in order, and her charged attack SHALL hit once and then once more on the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack hits twice

- **WHEN** the player uses the charged attack
- **THEN** it hits once and then once more

### Requirement: Breastplate's shield

Breastplate SHALL set a shield on Noelle equal to 160% of her DEF plus 769, lasting 12 seconds, and recasting it SHALL replace the shield she holds.

#### Scenario: Press sets the shield

- **WHEN** the player presses Breastplate
- **THEN** a shield of 160% of Noelle's DEF plus 769 stands for 12 seconds

#### Scenario: Recast replaces the shield

- **GIVEN** a shield is standing
- **WHEN** the player presses Breastplate again
- **THEN** the new shield replaces the old one

### Requirement: Breastplate's heal

While Breastplate's shield stands, Noelle's normal and charged attacks and her press SHALL heal the party when they strike an enemy, a 50% chance that heals each party member by 21.28% of Noelle's DEF plus 102.7 as a share of its own Max HP.

#### Scenario: Attack rolls for the heal

- **GIVEN** Breastplate's shield is standing
- **WHEN** a normal attack strikes an enemy
- **THEN** the heal rolls with a 50% chance on each enemy struck until one passes
- **AND** a pass heals every party member

#### Scenario: No heal without the shield

- **GIVEN** no Breastplate shield is standing
- **WHEN** a normal attack strikes an enemy
- **THEN** no heal rolls

### Requirement: Constellation 1 and 4

From Constellation 1, Sweeping Time's Geo infusion SHALL make the heal roll certain, and from Constellation 4, the shield's end SHALL explode for 400% of Noelle's ATK as Geo damage.

#### Scenario: I Got Your Back makes the heal certain

- **GIVEN** Noelle has Constellation 1 and Sweeping Time is infusing her attacks
- **WHEN** Breastplate's shield is standing and an attack strikes an enemy
- **THEN** the heal always passes

#### Scenario: To Be Cleaned explodes the shield

- **GIVEN** Noelle has Constellation 4
- **WHEN** Breastplate's shield ends
- **THEN** the shield explodes for 400% of Noelle's ATK as Geo damage on the character on the field

### Requirement: Constellation 6 Sweeping Time's extra ATK and seconds

From Constellation 6, Sweeping Time's ATK bonus SHALL take an additional 50% of Noelle's DEF, and each enemy she defeats during it SHALL add one second to its duration, up to 10 seconds in all.

#### Scenario: Constellation 6 adds half her DEF to the ATK bonus

- **GIVEN** Noelle has Constellation 6
- **WHEN** she uses Sweeping Time
- **THEN** its ATK bonus takes an additional 50% of her DEF

#### Scenario: Each enemy she defeats adds a second, up to 10 seconds

- **GIVEN** Noelle has Constellation 6 and Sweeping Time is standing
- **WHEN** she defeats enemies during it
- **THEN** each defeat adds one second, and its duration stops at 10 seconds in all

#### Scenario: Another character's defeat, or a lower constellation, adds nothing

- **GIVEN** Noelle has Constellation 5, or another character defeats the enemy
- **WHEN** the enemy is defeated during Sweeping Time
- **THEN** its duration is not extended

### Requirement: Constellation 2 Charged Attack stamina and DMG

From Constellation 2, Noelle's Charged Attacks SHALL cost 20% less stamina and each of their hits SHALL deal 15% more DMG.

#### Scenario: Constellation 2 changes her Charged Attacks

- **GIVEN** Noelle has Constellation 2
- **WHEN** her Charged Attack's stamina is read and its hits deal DMG
- **THEN** the stamina is cut by 20% and each Charged Attack hit gains 15% DMG

#### Scenario: Constellation 1 changes nothing here

- **GIVEN** Noelle has Constellation 1
- **WHEN** her Charged Attacks are read
- **THEN** their stamina and DMG are unchanged

### Requirement: Sweeping Time's infusion and ATK bonus

Sweeping Time SHALL convert Noelle's normal attacks to Geo with their own poise, and SHALL give her an ATK bonus of 40% of her DEF, for 15 seconds after an 80-frame start.

#### Scenario: Infusion converts normal attacks

- **WHEN** the player uses Sweeping Time
- **THEN** Noelle's normal attacks deal Geo damage with their converted poise

#### Scenario: ATK bonus lasts 15 seconds

- **WHEN** Sweeping Time starts
- **THEN** Noelle gains an ATK bonus of 40% of her DEF after 80 frames for 15 seconds
