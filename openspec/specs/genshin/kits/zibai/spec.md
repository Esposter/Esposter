## Purpose

Zibai's kit as built: her four strikes, charged attack, plunges and burst's two hits, with her skill's Lunar Phase Shift not built and her timings provisional.

## Requirements

### Requirement: Borrowed strike and burst timing

Zibai's four strikes, charged attack, plunges and burst's two hits SHALL land with the timing and reach of Keqing's, provisionally.

#### Scenario: Strikes land on Keqing's timing

- **WHEN** the player strikes with Zibai's normal attack
- **THEN** its four strikes land with Keqing's timing and reach

#### Scenario: Burst lands two hits

- **WHEN** the player casts Zibai's burst
- **THEN** two hits land, one for each of its two damage entries

### Requirement: Lunar Phase Shift waits on its record

Zibai's skill SHALL play out its animation with no hit until its record holds the labels it needs.

#### Scenario: Skill deals no damage

- **WHEN** the player uses Zibai's skill
- **THEN** its sequence plays and no damage is dealt
