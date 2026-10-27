## Purpose

Zibai's kit as built: her four strikes, charged attack, plunges and burst's two hits, Lunar Phase Shift with its own strikes and the fourth strike's extra instance at Ascendant Gleam, with her timings provisional.

## Requirements

### Requirement: Borrowed strike and burst timing

Zibai's four strikes, charged attack and burst's two hits SHALL land with the timing and reach of Keqing's, and her plunges with Bennett's, provisionally.

#### Scenario: Strikes land on Keqing's timing

- **WHEN** the player strikes with Zibai's normal attack
- **THEN** its four strikes land with Keqing's timing and reach

#### Scenario: Burst lands two hits

- **WHEN** the player casts Zibai's burst
- **THEN** two hits land, one for each of its two damage entries

### Requirement: Lunar Phase Shift plays its own strikes

Zibai's skill SHALL enter Lunar Phase Shift for its record's seconds, where her normal attacks and charged attack are Geo, as a stance with its own four normal attacks.

#### Scenario: Skill enters the shift

- **WHEN** the player uses Zibai's skill
- **THEN** Lunar Phase Shift holds for its seconds, where her strikes are Geo

### Requirement: Fourth normal attack's extra instance waits on Ascendant Gleam

In Lunar Phase Shift, Zibai's fourth normal attack SHALL deal its second hit, an extra instance of Geo DMG, only while the team is at Ascendant Gleam.

#### Scenario: Ascendant Gleam lands the extra instance

- **GIVEN** Zibai is in Lunar Phase Shift and the team is at Ascendant Gleam
- **WHEN** her fourth normal attack lands
- **THEN** both of its hits land

#### Scenario: Without Ascendant Gleam only the first hit lands

- **GIVEN** Zibai is in Lunar Phase Shift and the team is not at Ascendant Gleam
- **WHEN** her fourth normal attack lands
- **THEN** only its first hit lands
