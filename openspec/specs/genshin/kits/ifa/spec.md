## Purpose

Ifa's kit as built outside her Nightsoul Blessing: her three normal attacks, charged attack, Compound Sedation Field's hit, her low and collision plunges, and her high plunge's reach. Her skill's press enters and leaves the blessing with its points. Tonic Shot, her healing, the sedation marks and her passives and constellations wait on the Nightsoul hook and the sedation-mark hook.

## Requirements

### Requirement: Normal attacks and charged attack outside the Blessing

Ifa's three normal attacks and charged attack SHALL play outside her Nightsoul Blessing.

#### Scenario: The three normal attacks play in order

- **GIVEN** Ifa is the character on the field and outside her Nightsoul Blessing
- **WHEN** the player presses the attack button repeatedly
- **THEN** her three normal attacks play in order

#### Scenario: The charged attack costs 50 stamina

- **GIVEN** Ifa has at least 50 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays
- **AND** 50 stamina is spent

### Requirement: Low plunge and collision outside the Blessing

Ifa's low plunge and its collision SHALL play outside her Nightsoul Blessing without waiting for the Blessing to end.

#### Scenario: The low plunge and its collision land

- **GIVEN** Ifa is in the air outside her Nightsoul Blessing
- **WHEN** the player plunges
- **THEN** the low plunge hits 38 frames into its 71-frame animation
- **AND** its collision lands 32 frames in as a circle of 1.5 metres

### Requirement: Provisional high plunge

Ifa's high plunge SHALL take gcsim's High_Plunge circle as its reach, and its timing SHALL stay provisional until a recording of it settles it.

#### Scenario: The high plunge uses gcsim's High_Plunge reach

- **GIVEN** Ifa is in the air
- **WHEN** the player plunges from a height
- **THEN** the hit lands at frame 0 of a 71-frame animation
- **AND** its reach is a circle of 3.5 metres on her body, as gcsim's `High_Plunge` hitbox gives it

### Requirement: Compound Sedation Field's burst hit

Compound Sedation Field, Ifa's burst, SHALL deal an area hit on the primary target and go on a 15-second cooldown.

#### Scenario: Casting the burst strikes the primary target

- **GIVEN** Ifa has 60 energy
- **WHEN** the player casts Compound Sedation Field
- **THEN** its area hit lands on the primary target
- **AND** 60 energy is spent
- **AND** the burst cools for 15 seconds

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts Compound Sedation Field again
- **THEN** nothing happens

### Requirement: Skill cooldown without a hit yet

Ifa's skill SHALL start its 7.5-second cooldown when pressed and SHALL deal no hit yet.

#### Scenario: Pressing the skill starts its cooldown

- **GIVEN** the skill is off cooldown
- **WHEN** the player presses the skill
- **THEN** no hit lands
- **AND** the 7.5-second cooldown starts at once

#### Scenario: The skill cannot be pressed during its cooldown

- **GIVEN** the skill is cooling down
- **WHEN** the player presses the skill again within 7.5 seconds
- **THEN** nothing happens

### Requirement: Second constellation counts the party's points above 60 three times over

From her second constellation, with her first ascension, the party's Nightsoul points above 60 SHALL count three times over toward Rescue Essentials, and the cap SHALL rise by 50 to 200 points. The rule is gcsim's (`internal/characters/ifa/cons.go`, lines 29 to 45). The in-game text of this constellation is not read: the wiki's Constellation table lists only levels 1, 3 and 6, and the dump's talent rows were not decoded for it.

#### Scenario: Constellation 2 counts 80 party points as 140

- **GIVEN** Ifa is at her second constellation and her first ascension, and her party holds 80 Nightsoul points across her blessing and Iansan's
- **WHEN** a Swirl the party makes is priced
- **THEN** it takes a DMG Bonus of 2.1, which is 1.5% of 140 points

#### Scenario: Constellation 2 lifts the cap to 200 points

- **GIVEN** Ifa is at her second constellation and her first ascension, and her party holds 200 Nightsoul points
- **WHEN** a Swirl the party makes is priced
- **THEN** it takes a DMG Bonus of 3.0, which is 1.5% of 200 points

### Requirement: Below her second constellation the party's points count once

Below her second constellation the party's points above 60 SHALL count once, and the cap SHALL stay at 150.

#### Scenario: Below her second constellation the points above 60 count once

- **GIVEN** Ifa is at her first constellation and her first ascension, and her party holds 80 Nightsoul points
- **WHEN** a Swirl the party makes is priced
- **THEN** it takes a DMG Bonus of 1.2, which is 1.5% of 80 points

### Requirement: Fourth constellation adds 100 Elemental Mastery for 15 seconds after her burst

From constellation 4, Ifa SHALL gain 100 Elemental Mastery for 15 seconds when her burst starts. Her wind current's three extra seconds are not built.

#### Scenario: A burst at constellation 4 adds the Elemental Mastery

- **GIVEN** Ifa is at constellation 4
- **WHEN** she casts her burst
- **THEN** she gains 100 Elemental Mastery for 15 seconds

#### Scenario: A burst below constellation 4 adds nothing

- **GIVEN** Ifa is at constellation 3
- **WHEN** she casts her burst
- **THEN** no Elemental Mastery buff is added

### Requirement: Skill press enters the Nightsoul Blessing

Ifa's skill press SHALL enter her Nightsoul Blessing with 80 Nightsoul points, which drain eight a second, when she is not in it, and SHALL leave the blessing when she is. Neither press SHALL deal a hit yet.

#### Scenario: Press enters the blessing and its points drain

- **WHEN** the player presses Ifa's skill outside the blessing
- **THEN** Ifa is in the Nightsoul Blessing with 80 points
- **AND** her points drop by eight a second

#### Scenario: A press in the blessing leaves it

- **GIVEN** Ifa is in the Nightsoul Blessing
- **WHEN** the player presses Ifa's skill
- **THEN** she is no longer in the blessing and her points are gone

### Requirement: First ascension's Rescue Essentials add to the party's reactions

From her first ascension, Ifa's Rescue Essentials SHALL add 1.5% DMG to each Swirl and Electro-Charged reaction her party makes, and 0.2% to each Lunar-Charged, for each of her Nightsoul points up to 150, or up to 200 from her second constellation. The points SHALL be the Nightsoul points of her whole deployed party, up to 150, and they SHALL count only while her own blessing lasts. Below her first ascension they SHALL add nothing. Stellar Swirl SHALL NOT take them yet.

#### Scenario: Swirl and Electro-Charged take 1.5% a point, up to 150 points

- **GIVEN** Ifa is at her first ascension and in the Nightsoul Blessing with 80 points
- **WHEN** a Swirl or Electro-Charged the party makes is priced
- **THEN** it takes a DMG Bonus of 1.2
- **AND** with 200 points it takes the DMG Bonus of 150 points, 2.25

#### Scenario: A direct Lunar-Charged hit takes the same DMG Bonus

- **GIVEN** Ifa is at her first ascension and in the Nightsoul Blessing with 80 points
- **WHEN** a direct Lunar-Charged hit the party makes is priced
- **THEN** it takes a DMG Bonus of 0.16 into its reaction bonus, as a Lunar-Charged reaction does

#### Scenario: The party's points count, not Ifa's alone

- **GIVEN** Ifa is at her first ascension and in the Nightsoul Blessing with 40 points
- **AND** a party member is in the Nightsoul Blessing with 40 points
- **WHEN** a Swirl the party makes is priced
- **THEN** it takes a DMG Bonus of 1.2

#### Scenario: Lunar-Charged takes 0.2% a point

- **GIVEN** Ifa is at her first ascension and in the Nightsoul Blessing with 80 points
- **WHEN** a Lunar-Charged is priced for each contributor
- **THEN** each contributor's Lunar-Charged takes a DMG Bonus of 0.16

#### Scenario: Below her first ascension it adds nothing

- **GIVEN** Ifa is at her base ascension and in the Nightsoul Blessing
- **WHEN** a Swirl or Lunar-Charged the party makes is priced
- **THEN** it takes no DMG Bonus from her

#### Scenario: Leaving the blessing clears the points

- **GIVEN** Ifa is at her first ascension in the Nightsoul Blessing
- **WHEN** the player presses her skill to leave it
- **THEN** a Swirl the party makes takes no DMG Bonus from her
