## ADDED Requirements

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
