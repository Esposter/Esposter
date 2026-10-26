## Purpose

The game's characters, weapons and artifacts as data in the game's own shapes, read from the community's dump of the game's tables by genshin:assets stats (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/`) and fetched from the hosted game data as the world opens (`packages/genshin-world/src/generated/gameDataLock.json`), and a character's attributes summed from them as the game sums them — each base grown along its curve and raised by its ascension, a weapon's and artifacts' lines added, and Max HP, ATK and DEF each built from its base, percentage and flat.

## Requirements

### Requirement: Max HP, ATK and DEF are built from base, percentage and flat

A character's Max HP, ATK and DEF SHALL each be its base multiplied by one plus its percentage bonuses, plus its flat bonuses, summed from every line the character carries.

#### Scenario: Traveler at level 90 with a Dull Blade

- **GIVEN** the Traveler is at level 90 with a Dull Blade
- **WHEN** its attributes are summed
- **THEN** its Max HP is 10,874.91
- **AND** its DEF is 682.52
- (the wiki's pair is open below)

#### Scenario: A weapon's ATK percentage raises both ATK bases

- **GIVEN** a character with a weapon whose lines add an ATK percentage
- **WHEN** its attributes are summed
- **THEN** the percentage raises the character's ATK and the weapon's base ATK alike

### Requirement: Base attributes grow along the level curve and rise with ascension

A character's and weapon's base attributes SHALL grow along the game's level curve and rise with each ascension phase they have reached.

#### Scenario: Base grows to its level within its phase

- **GIVEN** a character at a level within its current ascension phase
- **WHEN** its base attributes are read
- **THEN** each growing base is its level-one value times the curve's multiplier at that level
- **AND** the attributes added by each reached phase are included

#### Scenario: Level outside the phase is refused

- **GIVEN** a phase covers a range of levels
- **WHEN** a level outside that range is requested for it
- **THEN** the request is refused

### Requirement: Every line a character carries counts toward its attributes

Every line a character carries SHALL count toward its attributes, including its own, its weapon's, its artifacts' main and minor affixes and its sets' bonuses.

#### Scenario: Four pieces of a set count both bonuses

- **GIVEN** four pieces of one artifact set are worn
- **WHEN** attributes are summed
- **THEN** both the two-piece bonus and the four-piece bonus are counted

#### Scenario: Conditional set bonus adds no line

- **GIVEN** a set bonus depends on a condition met only in combat
- **WHEN** attributes are summed
- **THEN** that bonus adds no line to the attributes

### Requirement: Game data loads before the world opens and a failed load keeps it shut

The game's characters, weapons and artifacts SHALL be available as data in the game's own identifiers, loaded before the world opens.

#### Scenario: World opens once its tables load

- **GIVEN** the player opens the world
- **WHEN** the tables finish loading
- **THEN** the world opens

#### Scenario: Failed table keeps the world shut

- **GIVEN** a table fails to load
- **WHEN** the world is opened
- **THEN** the world stays shut
- **AND** the host waiting on the world moves on

### Requirement: A new character starts at level 1 with its own weapon

A newly created character SHALL start at level 1 in its first ascension phase, with the weapon it comes with at level 1 and no artifacts.

#### Scenario: New character starts fresh

- **GIVEN** a playable character is created
- **WHEN** it is first shown
- **THEN** it is at level 1 in its first phase
- **AND** it holds the weapon it comes with at level 1
- **AND** it wears no artifacts

### Requirement: A character's region comes from its association

A character's region SHALL be the region its association names, with the Fatui counted as Snezhnaya's and characters with no nation counted in none.

#### Scenario: Fatui character belongs to Snezhnaya

- **GIVEN** a Fatui character
- **WHEN** its region is shown
- **THEN** the region is Snezhnaya's

#### Scenario: Traveler, visitors and others belong to no region

- **GIVEN** the Traveler, a visitor or any character with no nation
- **WHEN** its region is shown
- **THEN** it has no region

### Requirement: The Traveler has no element until it resonates with a statue

The Traveler SHALL have no element until it resonates with a statue (the Traveler's default depots 501 and 701, whose skills carry no `energySkill`).

#### Scenario: Traveler before resonance has no element

- **GIVEN** the Traveler has not resonated with a statue
- **WHEN** its element is read
- **THEN** it has no element

## Open

- [ ] **The Traveler at level 90 matches the wiki's Max HP and DEF** — no source yet: the wiki's Traveler page is not cached, and the test holds the pair as the wiki's without a recording.
- [ ] **A conditional set bonus adds no line** — no source yet: no test holds that a conditional bonus adds nothing.
- [ ] **The world opens once its tables load, and a failed table keeps it shut** — no source yet: no test holds the load order or the failure path.
- [ ] **A new character starts at level 1 with its weapon at level 1 and no artifacts** — no source yet: no test holds `createCharacter`'s starting state.
- [ ] **The Fatui count as Snezhnaya's region** — no source yet: the wiki's count is not cached, and the dump's two Fatui associations name no region of their own.
- [ ] **The Snezhnaya association names Snezhnaya's region** — no source yet: `AssociationRegionIdMap` maps `ASSOC_TYPE_FATUI` but not `ASSOC_TYPE_SNEZHNAYA` or `ASSOC_TYPE_SNEZHNAYA_STAR`, which the dump files two and three characters under.
- [ ] **The Traveler has no element in the world before its statue resonance** — no source yet: no test holds the Traveler's element before resonance; the element test holds only its alignment mark.
- [ ] **Max HP, ATK and DEF are each built from base, percentage and flat** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A weapon's ATK percentage raises the character's and the weapon's ATK bases** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Base attributes grow along the level curve and rise with ascension** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Every line a character carries counts toward its attributes** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Four pieces of a set count both the two-piece and four-piece bonuses** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A character's region is the one its association names** — no source yet: game data or a snapshot that holds this behaviour
