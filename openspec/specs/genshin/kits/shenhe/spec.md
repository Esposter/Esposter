## Purpose

Shenhe's kit as built: Spring Spirit Summoning's press and hold, which give the other party members her Icy Quill, and Divine Maiden's Deliverance field with its DoT, with Constellation 1's extra charge, Constellation 2's six extra field seconds and its Cryo CRIT DMG on the active character, and Constellations 4 and 6's Icy Quill effects built, and her other passives left unbuilt.

## Requirements

### Requirement: Shenhe's strikes, charged attack and plunges

Shenhe's five strikes, charged attack, collision and two plunges SHALL land on the enemies within reach, and her five strikes SHALL deal poise per strike, 46.08, 43.44, 56.31, 27.88 and 73.6, with 27.88 on each of the fourth strike's two hits, provisionally.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach

### Requirement: Spring Spirit Summoning's press

Spring Spirit Summoning SHALL deal its press on tap.

#### Scenario: Tap plays the press

- **WHEN** the player taps Spring Spirit Summoning
- **THEN** the press's hit lands on the enemies within reach

### Requirement: Spring Spirit Summoning's hold past half a second

Holding Spring Spirit Summoning past half a second SHALL release its hold, provisionally.

#### Scenario: Hold past half a second plays the hold

- **WHEN** the player holds Spring Spirit Summoning past half a second and releases it
- **THEN** the hold's hit lands on the enemies within reach

### Requirement: Divine Maiden's Deliverance initial hit and field

Divine Maiden's Deliverance SHALL deal an initial hit and leave a field 2 metres ahead of Shenhe, whose DoT ticks summon two hits there.

#### Scenario: Initial hit and field

- **WHEN** the player casts Divine Maiden's Deliverance
- **THEN** the initial hit lands
- **AND** a field stands 2 metres ahead of Shenhe

### Requirement: Divine Maiden's Deliverance field RES Decrease

Each field tick SHALL hold an RES Decrease on the enemies within the field for one tick interval, 117 frames (see Open).

#### Scenario: DoT tick holds the RES Decrease

- **GIVEN** Divine Maiden's Deliverance's field is standing
- **WHEN** a DoT tick strikes an enemy
- **THEN** that enemy's RES is decreased for one tick interval, 117 frames (see Open)

### Requirement: Ascension 1 Cryo DMG Bonus in the field

From Ascension 1, the active character standing in Divine Maiden's Deliverance field SHALL gain a Cryo DMG Bonus.

#### Scenario: Active character in the field gets the bonus

- **GIVEN** Shenhe has Ascension 1 and the active character stands in the field
- **WHEN** that character deals Cryo damage
- **THEN** the Cryo DMG Bonus applies

### Requirement: Constellation 1 charge

From Constellation 1, Spring Spirit Summoning SHALL have one more charge than its base.

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Shenhe has Constellation 1
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Shenhe has no constellation
- **WHEN** her skill's charges are read
- **THEN** no charge is added

### Requirement: Constellation 2 extends the field

From Constellation 2, Divine Maiden's Deliverance's field SHALL last six seconds longer than its base.

#### Scenario: Constellation 2 extends the field

- **GIVEN** Shenhe has Constellation 2
- **WHEN** Divine Maiden's Deliverance is cast
- **THEN** its field lasts six seconds longer

#### Scenario: Constellation 1 leaves the field as its base

- **GIVEN** Shenhe has Constellation 1
- **WHEN** Divine Maiden's Deliverance is cast
- **THEN** its field lasts its base

### Requirement: Constellation 2 gives the active character Cryo CRIT DMG in the field

From Constellation 2, the active character standing in Divine Maiden's Deliverance's field SHALL gain 15% CRIT DMG on her Cryo strikes, refreshed each tick the field runs while she stands in it.

#### Scenario: The active character in the field gains Cryo CRIT DMG

- **GIVEN** Shenhe has Constellation 2 and Divine Maiden's Deliverance's field is up
- **WHEN** the active character stands in the field and the field ticks
- **THEN** her Cryo strikes take 15% more CRIT DMG, and her other strikes take none

#### Scenario: A character outside the field gains nothing

- **GIVEN** Shenhe has Constellation 2 and Divine Maiden's Deliverance's field is up
- **WHEN** the field ticks with the active character standing outside it
- **THEN** no character's strikes take CRIT DMG from it

#### Scenario: Constellation 1 gives no CRIT DMG

- **GIVEN** Shenhe has Constellation 1
- **WHEN** the active character stands in Divine Maiden's Deliverance's field
- **THEN** her strikes take no CRIT DMG from it

### Requirement: Icy Quill from Spring Spirit Summoning's press

Spring Spirit Summoning's press SHALL give each other party member Shenhe's Icy Quill for ten seconds and five triggers.

#### Scenario: A press gives the quill to the other members

- **WHEN** the player uses Spring Spirit Summoning's press
- **THEN** each other party member carries the Icy Quill for ten seconds and five triggers
- **AND** Shenhe carries none

### Requirement: Icy Quill from Spring Spirit Summoning's hold

Spring Spirit Summoning's hold SHALL give each other party member Shenhe's Icy Quill for fifteen seconds and seven triggers.

#### Scenario: A hold gives the quill for longer

- **WHEN** the player holds Spring Spirit Summoning and releases it
- **THEN** each other party member carries the Icy Quill for fifteen seconds and seven triggers

### Requirement: Icy Quill's bonus and trigger on a Cryo hit

Each Cryo hit a member carrying the Icy Quill strikes from an attack kind, normal, charged or plunging attack, elemental skill or burst, SHALL add Shenhe's current ATK times the quill's ratio, 45.656% at her start level, to the hit's base damage, and SHALL spend one trigger, the last of which ends the quill.

#### Scenario: A Cryo hit adds Shenhe's ATK and spends a trigger

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member strikes an enemy with Cryo
- **THEN** the hit's base damage gains Shenhe's current ATK times the quill's ratio
- **AND** the quill spends one trigger

#### Scenario: Other hits add nothing

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member strikes with a non-Cryo element, or a member without the quill strikes with Cryo
- **THEN** no Icy Quill bonus applies

#### Scenario: A hit from no attack kind adds nothing

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member lands a Cryo hit that is dealt as no attack kind, such as a reaction; a field's tick is an elemental burst, so it is not one
- **THEN** no Icy Quill bonus applies
- **AND** the quill spends no trigger

### Requirement: Constellation 4 Skyfrost Mantra stacks

Each Icy Quill trigger SHALL give Shenhe a Skyfrost Mantra stack from Constellation 4, up to fifty, which lasts sixty seconds and is restarted by each stack gained.

#### Scenario: A trigger gives a stack from Constellation 4

- **GIVEN** Shenhe has Constellation 4 and a party member carries the Icy Quill
- **WHEN** that member's Cryo hit from an attack kind triggers the quill
- **THEN** Shenhe gains one Skyfrost Mantra stack, up to fifty

#### Scenario: No stack below Constellation 4

- **GIVEN** Shenhe has Constellation 3 or less
- **WHEN** a quilled member's Cryo hit triggers the quill
- **THEN** Shenhe gains no Skyfrost Mantra stack

### Requirement: Constellation 4 Skyfrost Mantra consumed by Spring Spirit Summoning

Shenhe's Spring Spirit Summoning SHALL consume all of her stacks as it starts, adding 5% DMG to each of its hits for each stack consumed, for the seconds the summoning plays. The window is the press action's length, flagged rather than read: no source gives it (see Open).

#### Scenario: Spring Spirit Summoning consumes the stacks

- **GIVEN** Shenhe holds three Skyfrost Mantra stacks
- **WHEN** she starts Spring Spirit Summoning
- **THEN** the stacks are gone
- **AND** each of the summoning's hits gains 15% DMG

### Requirement: Constellation 6 exempts normal and charged attack triggers

At Constellation 6, a quilled member's Cryo hit from a normal or charged attack SHALL still give the quill's bonus, but SHALL NOT spend one of the quill's triggers. Hits from her other attack kinds spend a trigger as before.

#### Scenario: A normal attack does not spend the quota

- **GIVEN** Shenhe has Constellation 6 and a quilled member carries five triggers
- **WHEN** that member's Cryo normal attack hits an enemy
- **THEN** the hit gains the quill's bonus
- **AND** the member still carries five triggers

#### Scenario: A skill still spends the quota

- **GIVEN** Shenhe has Constellation 6 and a quilled member carries five triggers
- **WHEN** that member's Cryo elemental skill hits an enemy
- **THEN** the member carries four triggers

### Requirement: Unbuilt Shenhe effects

Shenhe's other passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Shenhe has a passive unlocked
- **WHEN** the player fights with Shenhe
- **THEN** that effect has no effect

## Open

- [ ] **Each tick's RES Decrease lasts one tick interval** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go`: the RES mod lasts 36 frames, two 18-frame field ticks.
- [ ] **Holding Spring Spirit Summoning past half a second releases its hold** — no source yet: gcsim reads hold as a flag (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 50 to 53), and no recording of the threshold is on disk.
- [ ] **The Skyfrost Mantra bonus lasts the press action's length** — no source yet: the wiki gives no window, and gcsim applies the bonus once to the summoning's damage snapshot (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 74 and 136) with no length stated.
