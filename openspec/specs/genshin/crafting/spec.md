## Purpose

The bench's recipes are read from the game's combine table into the world's data, and the rules of crafting run over them: which recipes a player has open, how many of a recipe the bag and wallet pay for, a batch crafted whole or refused, and a recipe learned from its instruction. This page is the first build of the crafting proposal, covering the tiers, potions, baits, Condensed Resin and the gadgets. The bench is not placed in the world yet.

## Requirements

### Requirement: A recipe is offered only once its rank is reached and any instruction is learned

A recipe SHALL be offered only once the player's Adventure Rank reaches its rank and, for a recipe an instruction opens, once the recipe is learned.

#### Scenario: A recipe at a reached rank is offered

- **GIVEN** a recipe open from the start at a rank the player has reached
- **WHEN** the bench is opened
- **THEN** the recipe is offered

#### Scenario: A recipe above the player's rank is not offered

- **GIVEN** a recipe whose rank is above the player's
- **WHEN** the bench is opened
- **THEN** the recipe is not offered

#### Scenario: A hidden recipe not yet learned is not offered

- **GIVEN** a recipe an instruction opens and not yet learned
- **WHEN** the bench is opened
- **THEN** the recipe is not offered

### Requirement: An instruction teaches its recipe once

Using an instruction SHALL take one from the bag and teach the recipe it names, once, and only when the recipe names that instruction and the bag holds it.

#### Scenario: Using an instruction teaches its recipe

- **GIVEN** an instruction in the bag that names a recipe not yet learned
- **WHEN** the instruction is used
- **THEN** one instruction is taken from the bag
- **AND** the recipe is learned

#### Scenario: An instruction for a recipe already learned is refused

- **GIVEN** an instruction in the bag naming a recipe already learned
- **WHEN** the instruction is used
- **THEN** the use is refused
- **AND** the bag is unchanged

#### Scenario: An instruction the recipe does not name is refused

- **GIVEN** an instruction in the bag that the recipe does not name
- **WHEN** the instruction is used for that recipe
- **THEN** the use is refused

### Requirement: A craft is paid and given whole or refused

A craft SHALL spend its materials, Original Resin and Mora and put its results into the bag as one batch, or else refuse the whole batch with nothing spent.

#### Scenario: A batch with room for every result is crafted

- **GIVEN** enough materials, resin and Mora for the batch and room in the bag for every result
- **WHEN** the batch is crafted
- **THEN** its materials, resin and Mora are spent
- **AND** its results are put in the bag

#### Scenario: A batch the bag has no room for is refused

- **GIVEN** enough materials for the batch and not enough room in the bag for every result
- **WHEN** the batch is crafted
- **THEN** the batch is refused
- **AND** nothing is spent

### Requirement: The craftable count is the least that materials and Mora allow

The number of a recipe that can be crafted SHALL be the least count its materials and Mora allow, with Original Resin counted from the wallet including its regeneration.

#### Scenario: Materials for five crafts and Mora for three give three

- **GIVEN** materials for five crafts and Mora for three
- **WHEN** the craftable count is read
- **THEN** it is three

#### Scenario: Original Resin is counted from the wallet with its regeneration

- **GIVEN** a recipe that takes Original Resin
- **WHEN** the craftable count is read
- **THEN** the Original Resin is counted from the wallet, regenerated to the moment of the craft
- **AND** every other material is counted from the bag

### Requirement: Condensed Resin stops at the five a player can hold

Crafting Condensed Resin SHALL be refused once the bag has no room for another.

#### Scenario: A craft of Condensed Resin is refused with five held

- **GIVEN** the bag holding five Condensed Resin
- **WHEN** a craft of Condensed Resin is asked for
- **THEN** the craft is refused

### Requirement: A crafting talent may add extra results and a character without one crafts plainly

A character with a crafting talent SHALL draw its extra results, refunds or regional materials at the talent's chance on each craft it applies to, and a character without one SHALL craft only the recipe's own results.

#### Scenario: A talent adds an extra result to a craft

- **GIVEN** a character whose talent doubles the result of a recipe
- **WHEN** a craft of that recipe's result is made and the talent's chance comes up
- **THEN** the extra result is added to the batch

#### Scenario: A character with no talent crafts plainly

- **GIVEN** a character with no crafting talent
- **WHEN** a batch is crafted
- **THEN** only the recipe's own results are put in the bag

#### Scenario: A talent's extra with no room in the bag is dropped

- **GIVEN** a batch whose talent extra has no room in the bag
- **WHEN** the batch is crafted
- **THEN** the extra is dropped
- **AND** the craft is not refused

### Requirement: Open recipes are listed under one tab per combine type

Open recipes SHALL be listed under one tab per combine type, each named by the game's own text, in the table's order, with the first tab shown until one is picked. A conversion SHALL be listed under its own tab, apart from the craft tab of the same combine type.

#### Scenario: The bench opens on its first tab

- **GIVEN** open recipes under more than one combine type
- **WHEN** the bench is opened
- **THEN** the first tab is shown
- **AND** each tab carries the game's own name for its combine type

### Requirement: Crafting Performed counts every batch since the first craft

The save SHALL count each recipe's batches since the player first crafted it, across visits, and a guest's counts SHALL merge into the account's by the larger.

#### Scenario: Batches count across visits

- **GIVEN** a recipe crafted on an earlier visit
- **WHEN** it is crafted again on a later visit
- **THEN** the count includes both visits' batches

#### Scenario: A guest's counts merge into the account by the larger

- **GIVEN** a guest's count and an account's count for the same recipe
- **WHEN** the guest's save merges into the account
- **THEN** the count kept is the larger of the two

### Requirement: The recipe build refuses a table it cannot read

The recipe build SHALL refuse a three-for-one tier that is not three of one material, a conversion that is not one material and its catalyst, and a hidden recipe that no instruction opens.

#### Scenario: A tier row that is not three of one material refuses the build

- **GIVEN** a tier row that does not take three of one material
- **WHEN** the recipe build runs
- **THEN** the build fails

#### Scenario: a conversion that is not one material and its catalyst is refused

- **GIVEN** a conversion row that does not take exactly one material and its catalyst
- **WHEN** the recipe build runs
- **THEN** the build fails

#### Scenario: A hidden recipe no instruction opens refuses the build

- **GIVEN** a recipe the table hides and no instruction opens
- **WHEN** the recipe build runs
- **THEN** the build fails

### Requirement: The crafting bench stands at its city's recorded place

A city's crafting bench SHALL stand in the world at the place its scene group record gives.

#### Scenario: Mondstadt's bench stands at its recorded place

- **GIVEN** the player is in Mondstadt's Market District
- **WHEN** the player looks for the crafting bench
- **THEN** the bench stands at the place its scene group record gives

### Requirement: Using the bench opens crafting

The crafting bench SHALL offer its prompt only within the character's reach, and using it SHALL open the crafting screen with the party's crafter picked.

#### Scenario: The bench offers its prompt within reach

- **GIVEN** the character is within reach of the bench
- **WHEN** the player looks at the bench
- **THEN** the bench's interaction prompt is shown

#### Scenario: The bench offers no prompt out of reach

- **GIVEN** the character is out of reach of the bench
- **WHEN** the player looks at the bench
- **THEN** no interaction prompt is shown

#### Scenario: Using the bench opens crafting with the party's crafter picked

- **GIVEN** the character is within reach of the bench
- **WHEN** the player uses the bench from its prompt
- **THEN** the crafting screen opens with the party's crafter picked

### Requirement: Crafting spends its materials and mora

Crafting a recipe at the bench SHALL spend the recipe's materials from the bag and its mora from the wallet.

#### Scenario: A craft spends its materials and mora

- **GIVEN** the bag holds the recipe's materials and the wallet holds its mora
- **WHEN** the player crafts the recipe
- **THEN** the bag loses the recipe's materials and the wallet loses its mora

### Requirement: Condensed Resin takes its resin from Original Resin

Crafting Condensed Resin SHALL spend its resin from the Original Resin wallet.

#### Scenario: Condensed Resin draws its resin from the Original Resin wallet

- **GIVEN** the Original Resin wallet holds enough resin for the recipe
- **WHEN** the player crafts Condensed Resin
- **THEN** the Original Resin wallet loses the resin the recipe takes

### Requirement: The bench shows learned recipes and their crafted counts

The crafting bench SHALL show each recipe the party has learned together with its crafted count.

#### Scenario: The bench lists learned recipes with their crafted counts

- **GIVEN** the party has learned some recipes and crafted some of them
- **WHEN** the player opens the bench's crafting screen
- **THEN** each learned recipe is listed with the count crafted so far

### Requirement: A conversion turns one material into another with its catalyst

The bench SHALL hold each conversion of the game's conversion sections as a recipe that takes one material and the catalyst it names, makes one item and costs no Mora. A conversion SHALL be open from the start.

#### Scenario: a conversion takes its material and its catalyst

- **GIVEN** a conversion row of combine type nine that takes a boss material and Dream Solvent
- **WHEN** the recipe build runs
- **THEN** the conversion is held with its material and its catalyst, one result and no Mora

#### Scenario: the disassembly rows are not recipes

- **GIVEN** a row of combine type eleven, which disassembles a mechanical fish into drops
- **WHEN** the recipe build runs
- **THEN** the row is left out of the bench's recipes

#### Scenario: a conversion is limited by its catalyst, not by Mora

- **GIVEN** the bag holds more of a conversion's material than its catalyst pays for
- **WHEN** the times the conversion can be crafted are counted
- **THEN** the count is the least the catalyst pays for, with no limit from Mora

#### Scenario: a conversion spends its material and its catalyst from the bag

- **GIVEN** the bag holds a conversion's material and enough of its catalyst
- **WHEN** the player crafts the conversion twice
- **THEN** the material and the catalyst the two crafts take are removed from the bag
- **AND** the two results are put in the bag

### Requirement: A conversion's tab is apart from the craft tab of its combine type

A conversion SHALL be listed under a tab of its own, apart from the craft tab of the combine type it is filed under, so the two never share a tab.

#### Scenario: a conversion's tab is apart from the craft tab of its combine type

- **GIVEN** an open craft and an open conversion, both filed under the same combine type
- **WHEN** the bench lists its tabs
- **THEN** the craft is listed under its combine type's tab
- **AND** the conversion is listed under a tab of its own, with only the conversion in it
