## Purpose

Shenhe's kit as built: Spring Spirit Summoning's press and hold, which give the other party members her Icy Quill, and Divine Maiden's Deliverance field with its DoT, with Constellation 1's extra charge, Constellation 2's six extra field seconds and its Cryo CRIT DMG on the active character, and Constellations 4 and 6's Icy Quill effects built, and her other passives left unbuilt.

## Requirements

### Requirement: Shenhe's strikes, charged attack and plunges

Shenhe's five strikes, charged attack, collision and two plunges SHALL land on the enemies within reach, and her five strikes SHALL deal the wiki's poise per strike, 46.08, 43.44, 56.31, 27.88 and 73.6, with 27.88 on each of the fourth strike's two hits (`~/Esposter/cache/genshin-wiki/Category_Shenhe_Talents.json`), provisionally.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/attack.go` line 24)

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and plunge hits land on the enemies within reach (`~/Esposter/cache/genshin-wiki/Category_Shenhe_Talents.json`, the Plunging Attack text)

### Requirement: Spring Spirit Summoning's press and hold

Spring Spirit Summoning SHALL deal its press on tap, and holding it past half a second SHALL release its hold (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 50 to 53), provisionally.

#### Scenario: Tap plays the press

- **WHEN** the player taps Spring Spirit Summoning
- **THEN** the press's hit lands on the enemies within reach (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` line 87)

#### Scenario: Hold past half a second plays the hold

- **WHEN** the player holds Spring Spirit Summoning past half a second and releases it
- **THEN** the hold's hit lands on the enemies within reach (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 137 to 144)

### Requirement: Divine Maiden's Deliverance field

Divine Maiden's Deliverance SHALL deal an initial hit (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` lines 50 to 55) and leave a field 2 metres ahead of Shenhe (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` line 48), whose DoT ticks summon two hits there (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` lines 82 to 86), and each field tick SHALL hold an RES Decrease on the enemies within the field for one tick interval, 117 frames, as the kit's record reads (`packages/genshin-world/src/services/kit/characters/shenheKit.ts` line 151); gcsim holds it for 36 frames instead (see Open).

#### Scenario: Initial hit and field

- **WHEN** the player casts Divine Maiden's Deliverance
- **THEN** the initial hit lands
- **AND** a field stands 2 metres ahead of Shenhe (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` line 48)

#### Scenario: DoT tick holds the RES Decrease

- **GIVEN** Divine Maiden's Deliverance's field is standing
- **WHEN** a DoT tick strikes an enemy
- **THEN** that enemy's RES is decreased for one tick interval, 117 frames (`packages/genshin-world/src/services/kit/characters/shenheKit.ts` line 151; see Open)

### Requirement: Ascension 1 Cryo DMG Bonus in the field

From Ascension 1, the active character standing in Divine Maiden's Deliverance field SHALL gain a Cryo DMG Bonus (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` lines 97 to 104).

#### Scenario: Active character in the field gets the bonus

- **GIVEN** Shenhe has Ascension 1 and the active character stands in the field
- **WHEN** that character deals Cryo damage
- **THEN** the Cryo DMG Bonus applies

### Requirement: Constellation 1 charge

From Constellation 1, Spring Spirit Summoning SHALL have one more charge than its base (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/shenhe.go` lines 31 to 32).

#### Scenario: Constellation 1 adds a charge

- **GIVEN** Shenhe has Constellation 1
- **WHEN** her skill's charges are read
- **THEN** it has one more charge than the base (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/shenhe.go` line 32)

#### Scenario: Constellation 0 adds nothing

- **GIVEN** Shenhe has no constellation
- **WHEN** her skill's charges are read
- **THEN** no charge is added (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/shenhe.go` line 31)

### Requirement: Constellation 2 extends the field

From Constellation 2, Divine Maiden's Deliverance's field SHALL last six seconds longer than its base (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` lines 59 to 62).

#### Scenario: Constellation 2 extends the field

- **GIVEN** Shenhe has Constellation 2
- **WHEN** Divine Maiden's Deliverance is cast
- **THEN** its field lasts six seconds longer (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` line 62)

#### Scenario: Constellation 1 leaves the field as its base

- **GIVEN** Shenhe has Constellation 1
- **WHEN** Divine Maiden's Deliverance is cast
- **THEN** its field lasts its base (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` line 60)

### Requirement: Constellation 2 gives the active character Cryo CRIT DMG in the field

From Constellation 2, the active character standing in Divine Maiden's Deliverance's field SHALL gain 15% CRIT DMG on her Cryo strikes (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` lines 13 to 22; `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/shenhe.go` lines 48 to 50), refreshed each tick the field runs while she stands in it (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` lines 107 to 108).

#### Scenario: The active character in the field gains Cryo CRIT DMG

- **GIVEN** Shenhe has Constellation 2 and Divine Maiden's Deliverance's field is up
- **WHEN** the active character stands in the field and the field ticks
- **THEN** her Cryo strikes take 15% more CRIT DMG, and her other strikes take none (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` lines 17 to 20)

#### Scenario: A character outside the field gains nothing

- **GIVEN** Shenhe has Constellation 2 and Divine Maiden's Deliverance's field is up
- **WHEN** the field ticks with the active character standing outside it
- **THEN** no character's strikes take CRIT DMG from it (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go` line 94)

#### Scenario: Constellation 1 gives no CRIT DMG

- **GIVEN** Shenhe has Constellation 1
- **WHEN** the active character stands in Divine Maiden's Deliverance's field
- **THEN** her strikes take no CRIT DMG from it (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/shenhe.go` line 48)

### Requirement: Icy Quill from Spring Spirit Summoning

Spring Spirit Summoning's press SHALL give each other party member Shenhe's Icy Quill for ten seconds and five triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 91 to 92), and its hold for fifteen seconds and seven triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 148 to 149). Each Cryo hit a member carrying the Icy Quill strikes from an attack kind, normal, charged or plunging attack, elemental skill or burst, SHALL add Shenhe's current ATK times the quill's ratio, 45.656% at her start level (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 176 to 217; `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/zz_shenhe.dm.go` line 197), to the hit's base damage, and SHALL spend one trigger, the last of which ends the quill (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 203 to 206).

#### Scenario: A press gives the quill to the other members

- **WHEN** the player uses Spring Spirit Summoning's press
- **THEN** each other party member carries the Icy Quill for ten seconds and five triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 91 to 92)
- **AND** Shenhe carries none

#### Scenario: A hold gives the quill for longer

- **WHEN** the player holds Spring Spirit Summoning and releases it
- **THEN** each other party member carries the Icy Quill for fifteen seconds and seven triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 148 to 149)

#### Scenario: A Cryo hit adds Shenhe's ATK and spends a trigger

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member strikes an enemy with Cryo
- **THEN** the hit's base damage gains Shenhe's current ATK times the quill's ratio (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 204 and 217)
- **AND** the quill spends one trigger (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` line 206)

#### Scenario: Other hits add nothing

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member strikes with a non-Cryo element, or a member without the quill strikes with Cryo
- **THEN** no Icy Quill bonus applies (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 180 to 181 and 199 to 200)

#### Scenario: A hit from no attack kind adds nothing

- **GIVEN** a party member carries the Icy Quill
- **WHEN** that member lands a Cryo hit that is dealt as no attack kind, such as a reaction
- **THEN** no Icy Quill bonus applies (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 193 to 194)
- **AND** the quill spends no trigger

### Requirement: Constellation 4 Skyfrost Mantra

Each Icy Quill trigger SHALL give Shenhe a Skyfrost Mantra stack from Constellation 4, up to fifty, which lasts sixty seconds and is restarted by each stack gained (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` lines 54 to 59). Her Spring Spirit Summoning SHALL consume all of her stacks as it starts, adding 5% DMG to each of its hits for each stack consumed (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` lines 37 to 38 and 42; `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 74 and 136), for the seconds the summoning plays. The wiki gives no window of its own for that bonus (`~/Esposter/cache/genshin-wiki/Category_Shenhe_Talents.json`, the Insight text), so the window is the press action's length, and it is flagged rather than read.

#### Scenario: A trigger gives a stack from Constellation 4

- **GIVEN** Shenhe has Constellation 4 and a party member carries the Icy Quill
- **WHEN** that member's Cryo hit from an attack kind triggers the quill
- **THEN** Shenhe gains one Skyfrost Mantra stack, up to fifty (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` lines 54 to 55; `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 218 to 220)

#### Scenario: No stack below Constellation 4

- **GIVEN** Shenhe has Constellation 3 or less
- **WHEN** a quilled member's Cryo hit triggers the quill
- **THEN** Shenhe gains no Skyfrost Mantra stack (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` line 31)

#### Scenario: Spring Spirit Summoning consumes the stacks

- **GIVEN** Shenhe holds three Skyfrost Mantra stacks
- **WHEN** she starts Spring Spirit Summoning
- **THEN** the stacks are gone (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` line 42)
- **AND** each of the summoning's hits gains 15% DMG (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/cons.go` line 38)

### Requirement: Constellation 6 exempts normal and charged attack triggers

At Constellation 6, a quilled member's Cryo hit from a normal or charged attack SHALL still give the quill's bonus, but SHALL NOT spend one of the quill's triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 189 and 191). Hits from her other attack kinds spend a trigger as before.

#### Scenario: A normal attack does not spend the quota

- **GIVEN** Shenhe has Constellation 6 and a quilled member carries five triggers
- **WHEN** that member's Cryo normal attack hits an enemy
- **THEN** the hit gains the quill's bonus
- **AND** the member still carries five triggers

#### Scenario: A skill still spends the quota

- **GIVEN** Shenhe has Constellation 6 and a quilled member carries five triggers
- **WHEN** that member's Cryo elemental skill hits an enemy
- **THEN** the member carries four triggers (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 186 and 205 to 206)

### Requirement: Unbuilt Shenhe effects

Shenhe's other passives SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Shenhe has a passive unlocked
- **WHEN** the player fights with Shenhe
- **THEN** that effect has no effect

## Open

- [ ] **Shenhe's normal attacks deal no poise damage** — contradicted by `~/Esposter/cache/genshin-wiki/Category_Shenhe_Talents.json`: the wiki lists 46.08 poise for a normal attack hit.
- [ ] **Each tick's RES Decrease lasts one tick interval** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go`: the RES mod lasts 36 frames, two 18-frame field ticks.
- [ ] **A field's tick is dealt as no attack kind** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/burst.go`: the field's DoT is tagged elemental burst (line 69).
- [ ] **Holding Spring Spirit Summoning past half a second releases its hold** — no source yet: gcsim reads hold as a flag (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 50 to 53), and no recording of the threshold is on disk.
- [ ] **The Skyfrost Mantra bonus lasts the press action's length** — no source yet: the wiki gives no window, and gcsim applies the bonus once to the summoning's damage snapshot (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/shenhe/skill.go` lines 74 and 136) with no length stated.
