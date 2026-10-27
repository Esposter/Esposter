## Purpose

Columbina's kit as built: her three strikes, charged attack, plunges, Gravity Interference's press with its DoT field and gravity, the Gravity Ripple with its Lunacy and Constellations 1 and 2, and the burst's hit, with her Moonsign Benediction, her Dew and her Moondew Cleanse built, and her Lunar reactions, Constellation 4 and her Ascension 4's Lunar-Charged and Lunar-Crystallize hits left waiting on their hooks.

## Requirements

### Requirement: Basic attacks deal Hydro, and Moondew Cleanse deals Dendro

Columbina's normal attacks SHALL be three strikes, a charged attack, a collision attack and two plunging attacks. Her strikes SHALL deal Hydro damage that applies one unit of Hydro gauge, her plunges SHALL deal Hydro damage that applies one unit on landing and none on the collision, and her charged attack SHALL deal Hydro damage at one unit while no Dew stands. While Dew stands her charged attack is Moondew Cleanse, which deals Dendro damage and applies no gauge. The wiki's Normal Attack and Plunging Attack text and its gauge units give these.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Columbina is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order
- **AND** each hit deals Hydro damage

#### Scenario: Charged attack costs 50 stamina

- **GIVEN** Columbina has 50 stamina
- **AND** the party holds no Dew
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack spends 50 stamina

### Requirement: Gravity Interference press

Gravity Interference SHALL deal damage scaled to Columbina's max HP and SHALL set a damage-over-time field, which a further press restarts rather than stacks.

#### Scenario: Pressing Gravity Interference sets its field

- **GIVEN** Columbina is the character on the field
- **WHEN** the player presses Gravity Interference
- **THEN** its damage lands, scaled to her max HP
- **AND** its damage-over-time field starts

#### Scenario: A press during the field restarts its duration

- **GIVEN** the damage-over-time field is running
- **WHEN** the player presses Gravity Interference again
- **THEN** the field's duration restarts and no second field starts

### Requirement: Gravity builds from Lunar reactions and fires a Gravity Ripple

Gravity Interference SHALL build gravity while it stands from the Lunar reactions in the team.

A Gravity Ripple SHALL fire when the gravity reaches 60, clearing it.

#### Scenario: A Lunar reaction builds gravity for two seconds

- **GIVEN** Gravity Interference's field is standing
- **WHEN** a Lunar reaction forms in the team
- **THEN** gravity builds at 10 a second for the reaction's type for the next two seconds

#### Scenario: Gravity at 60 fires a Gravity Ripple

- **GIVEN** the gravity built has reached 60
- **WHEN** the step ends
- **THEN** a Gravity Ripple fires and the gravity clears

#### Scenario: Constellation 1's press fires a Gravity Ripple once every 15 seconds

- **GIVEN** Columbina has Constellation 1 and has not pressed Gravity Interference in the last 15 seconds
- **WHEN** the player presses Gravity Interference
- **THEN** a Gravity Ripple fires at once

### Requirement: Damage-over-time reach

The damage-over-time field SHALL reach enemies within 4 metres, or within 6 metres while her team is at Ascendant Gleam, as gcsim reaches them from Moonsign level 2.

#### Scenario: An enemy within 4 metres takes the field's damage

- **GIVEN** the damage-over-time field is running and her team is short of Ascendant Gleam
- **WHEN** an enemy stands within 4 metres of the field
- **THEN** the enemy takes the field's damage on each tick

#### Scenario: An enemy beyond 4 metres takes no field damage

- **GIVEN** the damage-over-time field is running and her team is short of Ascendant Gleam
- **WHEN** an enemy stands beyond 4 metres of the field
- **THEN** the enemy takes no damage from the field

#### Scenario: An enemy within 6 metres takes the field's damage at Ascendant Gleam

- **GIVEN** the damage-over-time field is running and her team is at Ascendant Gleam
- **WHEN** an enemy stands within 6 metres of the field
- **THEN** the enemy takes the field's damage on each tick

### Requirement: Burst hit

Columbina's burst SHALL deal its hit, scaled to her max HP.

#### Scenario: The burst deals its hit

- **GIVEN** Columbina is the character on the field
- **WHEN** the player casts the burst
- **THEN** its hit lands, scaled to her max HP

### Requirement: Poise from strikes, the charged attack and plunges

Columbina's strikes SHALL deal the poise the wiki gives, 8.8, 6.9 and 11 by the strike's place in the chain, her charged attack SHALL deal 100, and her plunges SHALL deal 50 when low and 100 when high, as the cached Advanced Properties give them.

#### Scenario: A strike deals its poise

- **GIVEN** Columbina is the character on the field
- **WHEN** one of her strikes hits an enemy
- **THEN** the enemy takes 8.8, 6.9 or 11 poise damage, by the strike's place in the chain

### Requirement: Plunge landing time

Columbina's plunges SHALL take a provisional four tenths of a second to land, the standard time and not one measured for her.

#### Scenario: A plunge lands after four tenths of a second

- **GIVEN** Columbina is in the air
- **WHEN** the player plunges
- **THEN** the plunge lands four tenths of a second later

### Requirement: Her Moonsign Benediction turns her team's reactions Lunar and adds Base DMG from her max HP

Columbina SHALL count toward the Moonsign level.

Columbina SHALL turn her team's Electro-Charged, Bloom and Hydro-Crystallize reactions Lunar.

Columbina SHALL add Base DMG to her team's Lunar reaction damage at 0.2% for every 1,000 of her max HP, up to 7%.

#### Scenario: Her Benediction counts her toward the Moonsign level

- **GIVEN** Columbina and one other Moonsign character are in the party
- **WHEN** the party's Moonsign level is read
- **THEN** it reads Ascendant Gleam, as it would with two Moonsign characters of any kind

#### Scenario: A Bloom of the team becomes Lunar-Bloom

- **GIVEN** Columbina is in the party and a party member's Bloom forms
- **WHEN** the reaction is recorded
- **THEN** it is Lunar-Bloom, consuming as Bloom does

#### Scenario: The Base DMG bonus scales with her max HP and stops at 7%

- **GIVEN** Columbina's max HP is 10,000 and a party member's Lunar reaction deals damage
- **WHEN** the damage is priced
- **THEN** its Base DMG carries a 2% bonus, and at 35,000 max HP or more the bonus is 7%

### Requirement: Constellation 6 adds CRIT DMG to strikes after a Lunar reaction in the burst's window

Columbina at Constellation 6 SHALL give each party member's strikes of the elements a Lunar reaction covers 80% CRIT DMG for 8 seconds, once that reaction forms within the 1.2 seconds her burst's window holds open.

#### Scenario: A Lunar-Charged reaction in the burst's window buffs the team's Electro and Hydro strikes

- **GIVEN** Columbina is at Constellation 6 and has just cast her burst
- **WHEN** a party member's Lunar-Charged reaction forms within the 1.2 seconds
- **THEN** every party member's Electro and Hydro strikes gain 80% CRIT DMG for 8 seconds, Columbina's own included, and a Geo strike gains none

#### Scenario: A Lunar reaction after the window does not buff

- **GIVEN** Columbina is at Constellation 6 and 1.2 seconds have passed since her burst
- **WHEN** a Lunar-Charged reaction forms
- **THEN** no party member gains the buff

#### Scenario: A Lunar-Charged and a Lunar-Crystallize reaction add on a Hydro strike

- **GIVEN** Columbina is at Constellation 6, and within her burst's window a Lunar-Charged and a Lunar-Crystallize reaction both form
- **WHEN** a party member's Hydro strike is priced
- **THEN** it gains 160% CRIT DMG, as each reaction's buff adds

#### Scenario: Below Constellation 6 nothing buffs

- **GIVEN** Columbina is at Constellation 5 and casts her burst
- **WHEN** a Lunar-Charged reaction forms within the window
- **THEN** no party member gains the buff

### Requirement: Ascension 4 gives a Moonridge Dew on a Lunar-Bloom in the burst's window

From Ascension 4, a Lunar-Bloom reaction while her burst's window is open SHALL give the party one Moonridge Dew, at most one every three frames and three in each eighteen seconds.

#### Scenario: A Lunar-Bloom in the window gives Moonridge Dew

- **GIVEN** Columbina has Ascension 4 and her burst's window is open
- **WHEN** a Lunar-Bloom reaction occurs
- **THEN** the party gains one Moonridge Dew

#### Scenario: A Lunar-Charged reaction gives no Moonridge Dew

- **GIVEN** Columbina has Ascension 4 and her burst's window is open
- **WHEN** a Lunar-Charged reaction occurs
- **THEN** the party gains no Moonridge Dew

#### Scenario: A fourth Lunar-Bloom in eighteen seconds gives none

- **GIVEN** three Moonridge Dew were gained in the current eighteen seconds
- **WHEN** a Lunar-Bloom occurs in the window
- **THEN** the party gains none

### Requirement: Moondew Cleanse replaces her charged attack while Dew is there to spend

While the party holds Dew, her charged attack SHALL be Moondew Cleanse, which spends one Dew, the verdant first.

While the party holds Dew, Moondew Cleanse SHALL cost no stamina.

Moondew Cleanse SHALL strike three Lunar-Bloom hits that ignore all of each enemy's DEF.

#### Scenario: A charged attack with Dew plays Moondew Cleanse and spends one Dew

- **GIVEN** the party holds a Moonridge or Verdant Dew
- **WHEN** the player presses a charged attack
- **THEN** Moondew Cleanse plays, and one Dew is spent, the verdant first

#### Scenario: Moondew Cleanse spends no stamina

- **GIVEN** the party holds a Moonridge or Verdant Dew
- **AND** Columbina has 50 stamina
- **WHEN** the player presses a charged attack
- **THEN** Moondew Cleanse plays and spends no stamina

#### Scenario: A charged attack with no Dew is her normal charged attack

- **GIVEN** the party holds no Dew
- **WHEN** the player presses a charged attack
- **THEN** her normal charged attack plays and no Dew is spent

#### Scenario: Moondew Cleanse's Lunar-Bloom hits ignore all of each enemy's DEF

- **GIVEN** Moondew Cleanse is playing
- **WHEN** each of its three hits strikes an enemy
- **THEN** each hit ignores all of that enemy's DEF, and her normal charged attack ignores none

## Open

- [ ] **A Lunar-Bloom consumes its auras as Bloom does** — no source yet: no cached line states how a Lunar-Bloom consumes its element.
