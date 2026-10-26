## Purpose

Kujou Sara's kit as built: five strikes, a fully charged shot, Tengu Stormcall's Cover with its Ambush, Subjugation: Koukou Sendou's Titanbreaker with its Stormclusters, Ascension 4's Decorum, Constellation 1's skill cooldown cut and Constellation 6's mark.

## Requirements

### Requirement: Kujou Sara's five strikes

Kujou Sara's normal attack SHALL land five strikes in order, each hitting the enemies within its reach.

#### Scenario: Five strikes in sequence

- **WHEN** the player uses normal attack five times in a row
- **THEN** the five strikes land in order on the enemies within reach

### Requirement: Fully charged shot and the Cover

Tengu Stormcall's Cover SHALL last eighteen seconds, and while it stands a fully charged shot from Ascension 1 SHALL spend it to set out an Ambush at the target.

#### Scenario: Covered shot sets out the Ambush

- **GIVEN** the Cover is standing and Kujou Sara has Ascension 1
- **WHEN** the player lands a fully charged shot
- **THEN** the Cover is spent
- **AND** an Ambush is set out at the target 150 frames later

#### Scenario: Uncovered shot leaves the Cover alone

- **GIVEN** the Cover is not standing
- **WHEN** the player lands a fully charged shot
- **THEN** no Ambush is set out

### Requirement: Electro ATK bonus for the character on the field

Kujou Sara's Electro hits SHALL give the character on the field an ATK Bonus, a share of Kujou Sara's base ATK, for six seconds.

#### Scenario: Electro hit gives the bonus

- **WHEN** a Kujou Sara Electro hit lands
- **THEN** the character on the field gains the ATK Bonus for six seconds

### Requirement: Titanbreaker and its Stormclusters

Subjugation: Koukou Sendou's Titanbreaker SHALL set off Stormclusters in four bouts of six ticks each, and in six bouts from Constellation 4.

#### Scenario: Four bouts without Constellation 4

- **GIVEN** Kujou Sara has fewer than four constellations
- **WHEN** the player casts Titanbreaker
- **THEN** four bouts of six Stormcluster ticks land

#### Scenario: Six bouts from Constellation 4

- **GIVEN** Kujou Sara has Constellation 4
- **WHEN** the player casts Titanbreaker
- **THEN** six bouts of six Stormcluster ticks land

### Requirement: Constellation 6's mark on the character the ATK Bonus reaches

From Constellation 6, Kujou Sara's ATK Bonus SHALL also mark the character it reaches for six seconds, giving that character's Electro DMG 60% CRIT DMG, and its Lunar-Charged reactions 60% CRIT DMG.

#### Scenario: Electro strike of the marked character

- **GIVEN** Kujou Sara has Constellation 6 and the mark stands on a character
- **WHEN** that character lands an Electro strike
- **THEN** the strike takes 60% CRIT DMG

#### Scenario: Lunar-Charged reaction by the marked character

- **GIVEN** the mark stands on a character
- **WHEN** that character causes a Lunar-Charged reaction
- **THEN** the reaction takes 60% CRIT DMG

#### Scenario: Mark runs out after six seconds

- **GIVEN** the mark stands on a character
- **WHEN** six seconds pass
- **THEN** the mark is gone and its strikes take no CRIT DMG from it

### Requirement: Decorum restores Energy from Ascension 4

From Ascension 4, Kujou Sara's Ambush SHALL restore 1.2 Energy to every party member for each 100% of Energy Recharge she has, once every three seconds.

#### Scenario: Ambush restores Energy from Ascension 4

- **GIVEN** Kujou Sara has Ascension 4
- **WHEN** an Ambush hits an opponent
- **THEN** every party member gains Energy

#### Scenario: Below Ascension 4 nothing is restored

- **GIVEN** Kujou Sara has Ascension 3 or lower
- **WHEN** an Ambush hits an opponent
- **THEN** no Energy is restored

### Requirement: Constellation 1 cuts the skill cooldown

From Constellation 1, a Tengu Juurai hit that strikes an enemy SHALL cut a second off Kujou Sara's skill cooldown, at most once every 3 seconds.

#### Scenario: The burst's first hit cuts the skill cooldown

- **GIVEN** Kujou Sara has Constellation 1 and her skill is cooling down
- **WHEN** her burst's first hit strikes an enemy
- **THEN** her skill's cooldown is cut by 1 second

#### Scenario: A cut waits out its cooldown

- **GIVEN** a cut was given within the last 3 seconds
- **WHEN** another Tengu Juurai hit strikes an enemy
- **THEN** no cut is given

## Open

- [ ] **five strikes land in order on the enemies within reach** — no source yet: gcsim's `attack.go` strike list was not opened.
- [ ] **six bouts of Stormcluster ticks from Constellation 4** — no source yet: gcsim's Constellation 4 stormcluster count was not opened.
