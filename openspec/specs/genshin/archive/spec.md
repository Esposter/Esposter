## Purpose

Genshin's Archive as built. Its seven sections are the game's own codex tables, read from the dump with each entry's name in the game's text. A bag's items open their entries as they are taken in, the Archive waits on the quest it opens after, and its screen shows one section at a time with a name or a "?" per entry. The sections whose doings are not built yet stay locked.

## Requirements

### Requirement: Seven sections in the game's order

The Archive SHALL hold seven sections in the game's order and SHALL show how many entries are open across all of them.

#### Scenario: Sections step in order once the Archive is unlocked

- **GIVEN** the Archive is unlocked
- **WHEN** the Archive screen opens
- **THEN** its seven sections step in the order Equipment, Living Beings, Tutorials, Geography, Travel Log, Books and Materials

#### Scenario: Counter shows open entries and Q and E step between sections

- **GIVEN** the Archive screen is open
- **WHEN** a section is selected
- **THEN** its entries are shown in a grid, and the counter shows how many entries are open across every section
- **AND** Q, E and the arrows at the screen's edges step between the sections

### Requirement: An entry stays locked until its thing is first met

An Archive entry SHALL show a question mark until the player first meets its thing, and SHALL then show its name.

#### Scenario: Entry for an unmet weapon reads a question mark

- **GIVEN** a weapon is not yet in the bag
- **WHEN** the Equipment section is listed
- **THEN** its entry reads "?"

#### Scenario: Picking up a weapon opens its entry

- **GIVEN** a weapon is picked up and enters the bag
- **WHEN** the Equipment section is listed
- **THEN** its entry is open and shows its name

#### Scenario: Holding a material opens its entry

- **GIVEN** a material enters the bag
- **WHEN** the Materials section is listed
- **THEN** its entry is open and shows its name

#### Scenario: Meeting the same thing again changes nothing

- **GIVEN** an entry is already open
- **WHEN** the same thing is met again
- **THEN** the entry stays open with the same name

#### Scenario: Defeating a monster opens its Living Beings entry

- **GIVEN** a monster is defeated for the first time
- **WHEN** the Living Beings section is listed
- **THEN** the monster's entry is open
- **AND** its entry shows the number of defeats as a multiple

#### Scenario: Wildlife entries stay locked

- **GIVEN** an animal of the wildlife is met
- **WHEN** the Living Beings section is listed
- **THEN** its entry stays locked

#### Scenario: Open entries show their name, and the picked one its description

- **GIVEN** an entry is open
- **WHEN** it is shown
- **THEN** its name is shown on its tile
- **AND** when it is the picked entry, its name is shown down the right with its description beneath, if it has one

### Requirement: A collected volume goes into the Archive rather than the bag

A volume's material picked up SHALL open the volume's Books entry instead of entering the bag, and the volume's text SHALL be readable in the reader in the player's game language.

#### Scenario: Picking up a volume opens its Books entry

- **GIVEN** a volume's material is picked up
- **WHEN** it is collected
- **THEN** its Books entry opens
- **AND** the item does not enter the bag

#### Scenario: Reader shows an open volume

- **GIVEN** a volume's entry is open
- **WHEN** the player opens it from the Books section
- **THEN** the reader shows its title and its text on one page in the player's game language

#### Scenario: Volume picked up before the Archive opens is not kept

- **GIVEN** the Archive has not opened yet
- **WHEN** a volume is picked up
- **THEN** the volume is not kept

### Requirement: The Archive stays locked until its unlock quest is done

The Archive SHALL stay locked, with its Paimon menu entry disabled, until the Archon Quest Unexpected Power is complete.

#### Scenario: Menu entry disabled before the quest

- **GIVEN** the Archon Quest Unexpected Power is not complete
- **WHEN** the Paimon menu is opened
- **THEN** its Archive entry is disabled

#### Scenario: Menu entry enabled once the quest is complete

- **GIVEN** the Archon Quest Unexpected Power is complete
- **WHEN** the Paimon menu is opened
- **THEN** its Archive entry is enabled
- **AND** the Archive's sections and names are loaded

#### Scenario: Quests the world does not yet track keep the Archive locked

- **GIVEN** the world does not yet track the Archon Quest Unexpected Power
- **WHEN** the player finishes every quest the world tracks
- **THEN** the Archive stays locked

### Requirement: Entries list in the codex order and omit dropped rows

Each section SHALL list its entries in the game's codex order, and a codex row the game has left out SHALL not be listed.

#### Scenario: Equipment lists weapons before sets

- **GIVEN** the Equipment section is listed
- **WHEN** its entries are read from top to bottom
- **THEN** the weapons come before the artifact sets
- **AND** every entry follows the codex's sort order

#### Scenario: Dropped codex row is not listed

- **GIVEN** a codex row the game has left out
- **WHEN** its section is listed
- **THEN** that row is not listed

## Open

- [ ] **The seven sections are listed in the game's order** — no source yet: the dump table that holds the Archive's section order; the Archive screen recording shows the sections as a ring (Books, Tutorials, Geography, Equipment, Materials at 12 seconds), which does not settle the order.
