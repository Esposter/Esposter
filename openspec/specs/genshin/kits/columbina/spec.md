## Purpose

Columbina's kit as built: her three strikes, charged attack, plunges, Gravity Interference's press with its DoT field, and the burst's hit, with her Moonsign Benediction built, and her Lunar reactions, Dew and her passives and constellations left waiting on their hooks.

## Requirements

### Requirement: Basic attacks deal Hydro

Columbina's normal attacks SHALL be three strikes, a charged attack, a collision attack and two plunging attacks, and every hit SHALL deal Hydro damage that applies one unit of Hydro gauge.

#### Scenario: Strike chain plays three strikes in order

- **GIVEN** Columbina is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three strikes play in order
- **AND** each hit deals Hydro damage

#### Scenario: Charged attack costs 50 stamina

- **GIVEN** Columbina has 50 stamina
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

### Requirement: No poise from strikes and plunges

Columbina's strikes and plunges SHALL deal no poise, a provisional zero until a source gives her values.

#### Scenario: A strike deals no poise

- **GIVEN** Columbina is the character on the field
- **WHEN** one of her strikes hits an enemy
- **THEN** the enemy takes no poise damage

### Requirement: Plunge landing time

Columbina's plunges SHALL take a provisional four tenths of a second to land, the standard time and not one measured for her.

#### Scenario: A plunge lands after four tenths of a second

- **GIVEN** Columbina is in the air
- **WHEN** the player plunges
- **THEN** the plunge lands four tenths of a second later

### Requirement: Her Moonsign Benediction turns her team's reactions Lunar and adds Base DMG from her max HP

Columbina SHALL count toward the Moonsign level, turn her team's Electro-Charged, Bloom and Hydro-Crystallize reactions Lunar, and add Base DMG to their Lunar damage at 0.2% for every 1,000 of her max HP, up to 7%.

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
