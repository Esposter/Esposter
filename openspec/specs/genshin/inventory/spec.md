## Purpose

The game's bag and its currencies as pure state. Nine tabs in the game's order, items stacking to their own limits, weapons and artifacts one each, the bag's room per tab and by kind, each tab sorted as the game sorts it, and a wallet of Mora, Primogems, Genesis Crystals, the two Fates, Starglitter, Stardust, the Masterless Stella Fortuna and Original Resin, which regenerates. The materials the enemies drop are defined from the game's material table and taken into the bag on a pick up. Its screen opens on B, its words the game's own. Nothing is bought with money. (The game's tables are `~/Esposter/genshin-parity/text/ExcelBinOutput/MaterialExcelConfigData.json`, `WeaponExcelConfigData.json` and `ReliquaryExcelConfigData.json`; the behaviour is tested in `packages/genshin-world/src/services/inventory/`, among others `addInventoryItem.test.ts`, `computeInventoryTab.test.ts`, `destroyInventoryItems.test.ts` and `useInventoryEntry.test.ts`.)

## Requirements

### Requirement: The bag has the game's nine tabs in the game's order

The bag SHALL hold everything the player carries in nine tabs, in the game's order, each named in the reader's language.

#### Scenario: The nine tabs appear in the game's order

- **GIVEN** the bag screen is open
- **WHEN** its tabs are listed
- **THEN** the nine tabs appear in the game's order, each with the game's own name

#### Scenario: The bag opens on the weapons tab

- **GIVEN** the player presses B
- **WHEN** the bag screen opens
- **THEN** the weapons tab is open
- **AND** its weapons are sorted by level from the highest

### Requirement: Stacks fill to their item's own limit and weapons and artifacts never stack

An item SHALL stack up to its own stack limit and each weapon or artifact SHALL be an entry of its own.

#### Scenario: A pick up fills an existing stack first

- **GIVEN** the bag holds a stack of an item below its stack limit
- **WHEN** more of that item is picked up
- **THEN** the stack fills up to its limit before a new stack is opened

#### Scenario: A weapon is an entry of its own

- **GIVEN** the player picks up a weapon
- **WHEN** it is added to the bag
- **THEN** it becomes an entry of its own at level one, in its first phase, with no EXP toward the next level and at refinement rank one

#### Scenario: A save holding a stack past the maximum is refused

- **GIVEN** a stack holds more of an item than the maximum quantity allows
- **WHEN** the save is read
- **THEN** the save is refused

### Requirement: A pick up with no room is left over and stays where it lay

When a pick up does not fit the bag's room in its tab, the part that does not fit SHALL be left over and stay where it lay.

#### Scenario: A full tab leaves the weapon behind

- **GIVEN** the weapons tab has no room left
- **WHEN** a weapon is picked up
- **THEN** the weapon is left over where it lay

#### Scenario: The full-bag hint appears on a pick up the bag cannot take

- **GIVEN** a pick up leaves something on the ground because the bag has no room
- **WHEN** the pick up is made
- **THEN** the game's full-bag hint is shown over the world
- **AND** the next pick up clears the hint

### Requirement: Each tab sorts as the game sorts it

Each tab SHALL sort its entries in the order the game shows them, with the equipment tabs sorted by level or quality in the chosen direction.

#### Scenario: Weapons sort by level in the chosen direction

- **GIVEN** the weapons tab is open with a sort by level
- **WHEN** the order is toggled
- **THEN** the weapons run from the highest level to the lowest, or the reverse

#### Scenario: Furnishings run from the first obtained

- **GIVEN** the furnishings tab is open
- **WHEN** its entries are listed
- **THEN** they run from the first obtained

#### Scenario: A tie falls to rank and then to the order obtained

- **GIVEN** two entries tie on the tab's sort key
- **WHEN** the tab is sorted
- **THEN** the tie is broken by rank and then by the order obtained

### Requirement: The wallet holds the game's currencies outside the stacks

The wallet SHALL count Mora, Primogems, Genesis Crystals, the Intertwined and Acquaint Fates, the Masterless Starglitter, Stardust and Stella Fortuna, and Original Resin, each by its own name.

#### Scenario: Wish currencies are counted apart from the bag's kinds

- **GIVEN** the bag holds a wish currency
- **WHEN** the bag's kinds are counted
- **THEN** the wish currency is not counted among them
- **AND** it is shown in the wallet

#### Scenario: Original Resin regenerates from when it last changed

- **GIVEN** the wallet holds Original Resin
- **WHEN** time passes after it last changed
- **THEN** the Original Resin regenerates from that moment

### Requirement: Nothing in the bag is bought with money

The bag SHALL NOT offer any purchase with money, so the wallet's Genesis Crystals stay at none.

#### Scenario: Genesis Crystals stay at none

- **GIVEN** a player opens the wallet
- **WHEN** its Genesis Crystals are read
- **THEN** the count is none

### Requirement: Only an entry whose game rule returns materials can be destroyed

An entry SHALL be destroyable only when the game's destroy rule for it returns materials, and a destruction SHALL return exactly the materials the game's table names.

#### Scenario: A one to three star weapon is destroyable

- **GIVEN** a weapon of one to three stars
- **WHEN** it is chosen for destruction
- **THEN** it is destroyed
- **AND** it returns its enhancement ore times its rarity

#### Scenario: A four or five star weapon is not destroyable

- **GIVEN** a weapon of four or five stars
- **WHEN** it is chosen for destruction
- **THEN** it cannot be destroyed

#### Scenario: A selection holding an entry that cannot be destroyed is refused

- **GIVEN** a selection includes an entry that may not be destroyed
- **WHEN** the destruction is confirmed
- **THEN** the whole destruction is refused and nothing is destroyed

### Requirement: The destroy mode selects and confirms destruction of entries

The destroy mode SHALL tick the entries the player picks, offer quick selects by rarity, and destroy the ticked entries only after the player confirms.

#### Scenario: A quick select ticks every entry of one rarity

- **GIVEN** the destroy mode is open on a tab
- **WHEN** the player chooses a quick select for a rarity
- **THEN** every destroyable entry of that rarity on the open tab is ticked

#### Scenario: OK stays off until an entry is ticked

- **GIVEN** the destroy mode is open and no entry is ticked
- **WHEN** the player looks at the Destroy button
- **THEN** the button is off

#### Scenario: The confirm lists the entries and what they return

- **GIVEN** the player chooses Destroy with entries ticked
- **WHEN** the confirm opens
- **THEN** it lists the chosen entries
- **AND** it lists the materials they return under the game's Recovered line
- **AND** it warns that the action cannot be undone

#### Scenario: Leaving the destroy mode drops the ticks

- **GIVEN** entries are ticked in the destroy mode
- **WHEN** the player leaves the destroy mode
- **THEN** no entry remains ticked

### Requirement: A destruction whose returns do not fit is refused

A destruction whose returned materials have no room in the bag SHALL be refused, and nothing SHALL be destroyed.

#### Scenario: Returns with no room refuse the whole destruction

- **GIVEN** the materials a destruction returns have no room in the bag
- **WHEN** the destruction is confirmed
- **THEN** nothing is destroyed
- **AND** the OK button is held off under the game's bag-full line

### Requirement: A take the bag cannot cover is refused

Taking items out of the bag SHALL be refused when the bag does not hold enough of them, and a stack emptied by a take SHALL be removed.

#### Scenario: A take the bag cannot cover is refused

- **GIVEN** the bag holds fewer of an item than a take asks for
- **WHEN** the take is made
- **THEN** the take is refused and the bag is unchanged

#### Scenario: An emptied stack is removed

- **GIVEN** a take empties a stack
- **WHEN** the take is made
- **THEN** that stack is removed from the bag

### Requirement: Materials are named by the game's own table in the reader's language

Each material SHALL be read from the game's material table and named in the reader's language, and each weapon in the saved bag SHALL be rebuilt from the game's weapon table when the save loads.

#### Scenario: A picked up material shows its name in the reader's language

- **GIVEN** the reader's language is set
- **WHEN** a material is picked up
- **THEN** its name is shown in that language

#### Scenario: A saved weapon is rebuilt on load

- **GIVEN** the save holds a weapon's entry with its kind, its item id and its state
- **WHEN** the save loads
- **THEN** the weapon is rebuilt from the weapon table with its name and rarity

### Requirement: Using a food heals its own target

Using a food SHALL take one of that food from the bag and apply its heal to the target the food names, never raising a character's health past full.

#### Scenario: Using a recovery dish heals the selected character

- **GIVEN** the bag holds a recovery dish and the selected character is below full health
- **WHEN** the player uses the dish
- **THEN** one of the dish is taken from the bag
- **AND** the selected character's health rises by the dish's heal

#### Scenario: Using a party dish heals every party member

- **GIVEN** the bag holds a dish that heals the whole party and members are below full health
- **WHEN** the player uses the dish
- **THEN** one of the dish is taken from the bag
- **AND** every party member's health rises by the dish's heal

#### Scenario: A heal stops at full health

- **GIVEN** the selected character is within a dish's heal of full health
- **WHEN** the player uses the dish
- **THEN** the character's health is full
- **AND** the health does not rise past full

#### Scenario: A food with none in the bag cannot be used

- **GIVEN** the bag holds none of a food
- **WHEN** the player tries to use that food
- **THEN** the food is not used
- **AND** no health changes

## Open

- [ ] **Every one- to three-star weapon is destroyable** — contradicted by `~/Esposter/genshin-parity/text/ExcelBinOutput/WeaponExcelConfigData.json`: ten one-star weapons (`rankLevel` 1) have no `destroyRule`.
- [ ] **The bag holds everything in nine tabs, in the game's order, each with the game's own name** — the wiki's Inventory page (checked: Inventory), whose Inventory Categories section lists the nine in this order under their own names
- [ ] **The bag opens on the weapons tab, with its weapons sorted by level from the highest** — no source yet: a recording of the bag opened on B with nothing chosen, showing the tab and sort it opens on
- [ ] **An item stacks up to its own stack limit, and each weapon or artifact is an entry of its own** — the wiki's Inventory page (checked: Inventory), whose Maximum Item Quantities section gives each item's limit by type; that each weapon or artifact is an entry of its own has no source yet: a recording of two copies of one weapon held in the bag
- [ ] **A picked up weapon becomes an entry at level one, in its first phase, with no EXP and at refinement rank one** — no source yet: the wiki's Weapon page (not in the cache) for the starting level, phase, EXP and refinement rank; the wiki's Refinement Rank page (checked: Refinement Rank) says that 1- and 2-star weapons cannot be refined, and no page checked gives the starting state
- [ ] **A pick up the bag has no room for is left over where it lay** — the wiki's Inventory page (checked: Inventory), for each tab's room and the full-bag message; that the pick up stays where it lay has no source yet: a recording of a pick up with no room in its tab
- [ ] **The game's full-bag hint shows over the world on such a pick up, and the next pick up clears it** — the wiki's Inventory page (checked: Inventory) shows the full-bag message on a pick up at the maximum amount; its showing over the world and its clearing on the next pick up have no source yet: a recording of a pick up with the bag full
- [ ] **Each tab sorts as the game sorts it: weapons by level, furnishings from the first obtained, and ties by rank and then the order obtained** — the wiki's Inventory page (checked: Inventory), which sorts weapons by Level or Quantity and furnishings from oldest to newest, and gives no tie rule; the tie rule has no source yet: a recording of two entries tied on the sort key
- [ ] **The wallet counts the game's currencies: Mora, Primogems, Genesis Crystals, the Intertwined and Acquaint Fates, Masterless Starglitter, Stardust, Stella Fortuna and Original Resin** — the wiki's Genesis Crystal page (checked: Genesis Crystal) for Genesis Crystals, and the wiki's Inventory page (checked: Inventory), which files the Fates and the Masterless Starglitter and Stardust under Precious Items; no source yet for Mora, Primogems or Masterless Stella Fortuna: the wiki's Mora, Primogem and Masterless Stella Fortuna pages, none in the cache. Owner decides: the Inventory page's 2,300 kinds limit excludes only Weapons, Artifacts and Furnishings, so it counts Precious Items, the Fates among them, which the wish-currency scenario keeps out of the bag's kinds
- [ ] **Original Resin regenerates from the moment it last changed** — the wiki's Original Resin page (checked: Original Resin) gives the rate, 1 unit every 8 minutes, and not the moment it counts from; that anchor has no source yet
- [ ] **An entry is destroyable only when the game's destroy rule returns materials, and returns exactly the materials its table names** — `~/Esposter/genshin-parity/text/ExcelBinOutput/WeaponExcelConfigData.json`, its `destroyRule`, `destroyReturnMaterial` and `destroyReturnMaterialCount` fields, for weapons; the wiki's Inventory page (checked: Inventory) says which categories and rarities can be destroyed, not which items
- [ ] **A one to three star weapon returns its enhancement ore times its rarity when destroyed** — the wiki's Weapon EXP page (checked: Weapon EXP), which gives 400, 800 and 1,200 experience for a 1-, 2- or 3-star weapon destroyed to Enhancement Ore; and `WeaponExcelConfigData.json`'s `destroyReturnMaterialCount` field
- [ ] **A four or five star weapon cannot be destroyed** — the wiki's Inventory page (checked: Inventory), Weapons section, which says 4 and 5 Weapons cannot be destroyed
- [ ] **The destroy mode ticks the entries the player picks, offers quick selects by rarity, and destroys only after confirmation** — no source yet: a recording of the bag's destroy mode in the English PC client, showing the ticks, the quick selects by rarity and the count beside Destroy
- [ ] **The confirm lists the chosen entries and the materials they return under the game's Recovered line, and warns that the action cannot be undone** — for its Recovered line, the text id UI_STC_BAGPAGE_DESTROY_CONFIRM_2 in `~/Esposter/genshin-parity/text/ManualTextMapConfigData.json`; the warning's text id is not looked up yet, and the list of chosen entries has no source yet: a recording of the destroy confirm
- [ ] **The OK button is held off under the game's bag-full line when the returns have no room** — the bag-full line, text id UI_BEYOND_RUNTIME_UI_DROP_PICKTIPS_FAIL in `~/Esposter/genshin-parity/text/ManualTextMapConfigData.json`; that OK is held off under it has no source yet: a recording of a destruction whose returns overflow the bag
- [ ] **Using a food takes one of it from the bag and applies its heal to the target it names, never past full health** — the wiki's Inventory page (checked: Inventory), Food section, says a recovering food is used on a chosen party character; the heal's cap at full health and a party-wide heal have no source yet: a recording of a Use on a party-healing dish and of a Use on a character at full health. Owner decides: the same section says a Use is by "selecting the amount to use", so it may take more than one, where the built rule takes one
- [ ] **A picked up material shows its name in the reader's language** — `~/Esposter/genshin-parity/text/ExcelBinOutput/MaterialExcelConfigData.json`, its `nameTextMapHash` field, read through the reader's language's text map in `~/Esposter/genshin-parity/text/TextMap/`
