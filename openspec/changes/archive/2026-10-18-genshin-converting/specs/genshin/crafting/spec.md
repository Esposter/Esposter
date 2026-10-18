## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Open recipes are listed under one tab per combine type

Open recipes SHALL be listed under one tab per combine type, each named by the game's own text, in the table's order, with the first tab shown until one is picked. A conversion SHALL be listed under its own tab, apart from the craft tab of the same combine type.

#### Scenario: The bench opens on its first tab

- **GIVEN** open recipes under more than one combine type
- **WHEN** the bench is opened
- **THEN** the first tab is shown
- **AND** each tab carries the game's own name for its combine type

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
