## Purpose

Genshin's Archive as built. Its seven sections are the game's own codex tables, read from the dump with each entry's name in the game's text. A bag's items open their entries as they are taken in, the Archive waits on the quest it opens after, and its screen lists each section with a name or a "?" per entry. The sections whose doings are not built yet stay locked.

## Requirements

### Requirement: Seven sections listed in the game's order

The Archive SHALL hold seven sections in the game's order and SHALL show how many of each section's entries are open (`packages/genshin-world/src/components/Archive/Screen/Index.vue`).

#### Scenario: Sections listed once the Archive is unlocked

- **GIVEN** the Archive is unlocked
- **WHEN** the Archive screen opens
- **THEN** its seven sections are listed as Equipment, Living Beings, Tutorials, Geography, Travel Log, Books and Materials (`packages/genshin-world/src/services/archive/ArchiveSectionOrder.ts`)

#### Scenario: Section shows open entries and steps with Q and E

- **GIVEN** the Archive screen is open
- **WHEN** a section is selected
- **THEN** it shows how many of its entries are open over how many it has (`packages/genshin-world/src/components/Archive/Screen/Index.vue`)
- **AND** Q and E step between the sections (`packages/genshin-world/src/services/quest/constants.ts`, `KeyQ` and `KeyE`)

### Requirement: An entry stays locked until its thing is first met

An Archive entry SHALL show a question mark until the player first meets its thing, and SHALL then show its name.

#### Scenario: Entry for an unmet weapon reads a question mark

- **GIVEN** a weapon is not yet in the bag
- **WHEN** the Equipment section is listed
- **THEN** its entry reads "?" (`packages/genshin-world/src/components/Archive/Screen/Index.vue`)

#### Scenario: Picking up a weapon opens its entry

- **GIVEN** a weapon is picked up and enters the bag
- **WHEN** the Equipment section is listed
- **THEN** its entry is open and shows its name (`packages/genshin-world/src/services/archive/openArchiveEntries.ts`)

#### Scenario: Holding a material opens its entry

- **GIVEN** a material enters the bag
- **WHEN** the Materials section is listed
- **THEN** its entry is open and shows its name (`packages/genshin-world/src/services/archive/openArchiveEntries.ts`)

#### Scenario: Meeting the same thing again changes nothing

- **GIVEN** an entry is already open
- **WHEN** the same thing is met again
- **THEN** the entry stays open with the same name (`packages/genshin-world/src/services/archive/openArchiveEntry.ts`)

#### Scenario: Defeating a monster opens its Living Beings entry

- **GIVEN** a monster is defeated for the first time
- **WHEN** the Living Beings section is listed
- **THEN** the monster's entry is open (`packages/genshin-world/src/composables/useWorldArchive.ts`)
- **AND** its entry shows the number of defeats as a multiple (`packages/genshin-world/src/components/Archive/Screen/Index.vue`)

#### Scenario: Wildlife entries stay locked

- **GIVEN** an animal of the wildlife is met
- **WHEN** the Living Beings section is listed
- **THEN** its entry stays locked (only a defeat opens a Living Beings entry, in `packages/genshin-world/src/composables/useWorldArchive.ts`)

#### Scenario: Open entries show only a name

- **GIVEN** an entry is open
- **WHEN** it is shown
- **THEN** only its name is shown, not a description (`packages/genshin-world/src/components/Archive/Screen/Index.vue`)

### Requirement: A collected volume goes into the Archive rather than the bag

A volume's material picked up SHALL open the volume's Books entry instead of entering the bag, and the volume's text SHALL be readable in the reader in the player's game language.

#### Scenario: Picking up a volume opens its Books entry

- **GIVEN** a volume's material is picked up
- **WHEN** it is collected
- **THEN** its Books entry opens (`packages/genshin-world/src/composables/useWorldPickups.ts`)
- **AND** the item does not enter the bag

#### Scenario: Reader shows an open volume

- **GIVEN** a volume's entry is open
- **WHEN** the player opens it from the Books section
- **THEN** the reader shows its title and its text on one page in the player's game language (`packages/genshin-world/src/components/Archive/BookReader/Index.vue`)

#### Scenario: Volume picked up before the Archive opens is not kept

- **GIVEN** the Archive has not opened yet
- **WHEN** a volume is picked up
- **THEN** the volume is not kept (`packages/genshin-world/src/composables/useWorldPickups.ts`, which takes Books only from the loaded Archive)

### Requirement: The Archive stays locked until its unlock quest is done

The Archive SHALL stay locked, with its Paimon menu entry disabled, until the Archon Quest Unexpected Power is complete (`packages/genshin-world/src/services/archive/constants.ts`; quest 353 is in `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/MainQuestExcelConfigData.json`).

#### Scenario: Menu entry disabled before the quest

- **GIVEN** the Archon Quest Unexpected Power is not complete
- **WHEN** the Paimon menu is opened
- **THEN** its Archive entry is disabled (`packages/genshin-world/src/components/World/Session/Index.vue`, whose Archive screen needs `archiveData`)

#### Scenario: Menu entry enabled once the quest is complete

- **GIVEN** the Archon Quest Unexpected Power is complete
- **WHEN** the Paimon menu is opened
- **THEN** its Archive entry is enabled
- **AND** the Archive's sections and names are loaded (`packages/genshin-world/src/composables/useWorldArchive.ts`)

#### Scenario: Quests the world does not yet track keep the Archive locked

- **GIVEN** the world does not yet track the Archon Quest Unexpected Power
- **WHEN** the player finishes every quest the world tracks
- **THEN** the Archive stays locked (`packages/genshin-world/src/services/quest/QuestLoaderMap.ts` has no loader for 353)

### Requirement: Entries list in the codex order and omit dropped rows

Each section SHALL list its entries in the game's codex order, and a codex row the game has left out SHALL not be listed.

#### Scenario: Equipment lists weapons before sets

- **GIVEN** the Equipment section is listed
- **WHEN** its entries are read from top to bottom
- **THEN** the weapons come before the artifact sets (`scripts/src/services/genshinAssets/archive/buildArchive.ts`)
- **AND** every entry follows the codex's sort order (`scripts/src/services/genshinAssets/archive/getNamedCandidates.ts`)

#### Scenario: Dropped codex row is not listed

- **GIVEN** a codex row the game has left out
- **WHEN** its section is listed
- **THEN** that row is not listed (`scripts/src/services/genshinAssets/archive/readEquipmentCandidates.ts`, `isDisuse`)

## Open

- [ ] **The seven sections are listed in the game's order** — no source yet: the game's tab order is not read from a dump table, and the recording `~/Esposter.noindex/genshin-parity/captures/archive-screen.mkv` shows the sections as a ring (Books, Tutorials, Geography, Equipment, Materials at 12 seconds), which does not settle the list's order.
