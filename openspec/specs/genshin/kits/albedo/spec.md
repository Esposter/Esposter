## Purpose

Albedo's kit as built: his strikes, charged attack and plunges, with Solar Isotoma and its Transient Blossoms and Rite of Progeniture's Fatal Blossoms, with his Ascension 1 and 4 passives built, his Constellations 1 and 2 built, his Constellation 4's plunging attack bonus in the field built, and his Constellation 6 left unbuilt.

## Requirements

### Requirement: Albedo's strikes, charged attack and plunges deal their hits on the game's timings

Albedo's five strikes, his charged attack of two hits, his collision and his two plunges SHALL each deal their hits on the timings of the game's animations.

#### Scenario: The charged attack deals two hits

- **GIVEN** Albedo performs his charged attack
- **WHEN** the attack plays through
- **THEN** it deals two hits on the game's timings

### Requirement: Solar Isotoma sets off a Transient Blossom at most once every two seconds

While Solar Isotoma stands, a hit on an enemy within its field SHALL set off a Transient Blossom that ticks on that enemy one frame later, and at most one blossom SHALL be set off every two seconds.

#### Scenario: A hit in the field sets off a blossom

- **GIVEN** Solar Isotoma is standing and an enemy within its field is hit
- **WHEN** the hit lands
- **THEN** a Transient Blossom ticks on that enemy one frame later

#### Scenario: A second hit within two seconds sets off no blossom

- **GIVEN** a Transient Blossom was set off less than two seconds ago
- **WHEN** another enemy in the field is hit
- **THEN** no further blossom is set off

#### Scenario: A blossom's damage scales with Albedo's Defense

- **GIVEN** a Transient Blossom ticks
- **WHEN** its damage is dealt
- **THEN** the damage scales with Albedo's Defense rather than his ATK

### Requirement: Fatal Blossoms appear only while Tectonic Tide stands

Rite of Progeniture's Fatal Blossoms SHALL appear only while the burst's field stands, and each SHALL strike at a frame between 145 and 175 frames into the burst, five frames apart.

#### Scenario: Fatal Blossoms strike in sequence

- **GIVEN** Albedo casts the burst and Tectonic Tide stands
- **WHEN** the burst plays through
- **THEN** seven Fatal Blossoms strike in sequence from 145 frames to 175 frames, five frames apart

#### Scenario: No Fatal Blossom appears after the field ends

- **GIVEN** Tectonic Tide has ended
- **WHEN** the burst's remaining frames pass
- **THEN** no further Fatal Blossom appears

### Requirement: Constellation 2's Fatal Reckoning adds flat damage to the Fatal Blossoms

From Constellation 2, each Transient Blossom SHALL add a stack of Fatal Reckoning, up to four, lasting thirty seconds. Tectonic Tide SHALL consume every stack, and each stack consumed SHALL add 30% of Albedo's DEF to each Fatal Blossom as flat damage.

#### Scenario: Transient Blossoms build up stacks to four

- **GIVEN** Albedo has Constellation 2
- **WHEN** five Transient Blossoms are set off within thirty seconds
- **THEN** Fatal Reckoning holds four stacks

#### Scenario: Tectonic Tide adds the stacks to its Fatal Blossoms

- **GIVEN** Albedo has four stacks of Fatal Reckoning
- **WHEN** she casts Rite of Progeniture: Tectonic Tide
- **THEN** each Fatal Blossom deals 120% of her DEF as flat damage more

#### Scenario: Tectonic Tide consumes the stacks

- **GIVEN** Tectonic Tide has consumed Fatal Reckoning's stacks
- **WHEN** she casts it again without a new Transient Blossom
- **THEN** its Fatal Blossoms deal no Fatal Reckoning damage

#### Scenario: Below Constellation 2 nothing accumulates

- **GIVEN** Albedo has Constellation 1
- **WHEN** Transient Blossoms are set off and Tectonic Tide is cast
- **THEN** its Fatal Blossoms deal no Fatal Reckoning damage

### Requirement: Constellation 4 raises the active member's plunges inside the Solar Isotoma

From Constellation 4, the active party member SHALL have its Plunging Attack DMG raised 30% for a second while it stands within the standing Solar Isotoma's field, as gcsim v2.47.2 gives it. The field SHALL be checked every 0.3 seconds from the Solar Isotoma's spawn, and no other party member SHALL have the bonus.

#### Scenario: A plunge inside the field gets the bonus

- **GIVEN** Albedo has Constellation 4 and a Solar Isotoma stands
- **WHEN** the active member stands within the field and plunges
- **THEN** its plunge deals 30% more DMG

#### Scenario: The bonus waits for the first check

- **GIVEN** Albedo has Constellation 4 and casts Solar Isotoma with the active member within its field
- **WHEN** 0.65 seconds pass
- **THEN** its plunges deal no extra DMG, as the first check that finds the field standing is 0.3 seconds after the spawn

#### Scenario: The bonus is refreshed at each check, not at each step

- **GIVEN** the active member has stood within the field for a second
- **WHEN** each check finds the field standing
- **THEN** the bonus is refreshed once per check, three or four times in a second

#### Scenario: The bonus runs out a second after the member leaves the field

- **GIVEN** the active member has stood within the field
- **WHEN** it leaves the field and a second passes
- **THEN** its plunges deal no extra DMG

#### Scenario: A teammate in the field gets no bonus

- **GIVEN** Albedo has Constellation 4 and a Solar Isotoma stands
- **WHEN** a teammate that is not the active member stands within the field and plunges
- **THEN** its plunges deal no extra DMG

#### Scenario: Below Constellation 4 nothing is raised

- **GIVEN** Albedo has Constellation 3
- **WHEN** the active member stands within a standing Solar Isotoma's field
- **THEN** its plunges deal no extra DMG
