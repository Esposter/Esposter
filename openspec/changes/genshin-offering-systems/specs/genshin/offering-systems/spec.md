## ADDED Requirements

### Requirement: Every offering follows one rule for its levels

Each offering SHALL take its items, thresholds and rewards from the rule the Frostbearing Tree uses.

#### Scenario: Offering the items for a level raises the offering

- **GIVEN** the player holds the items a level asks for
- **WHEN** the player offers them all at once
- **THEN** the offering reaches that level
- **AND** the level's reward is granted

#### Scenario: Offering fewer items than the next threshold changes nothing

- **GIVEN** the player holds fewer items than the next threshold asks for
- **WHEN** the player offers them
- **THEN** the offering stays at its level
- **AND** no reward is granted

### Requirement: Each offering stands at its map point

Each offering SHALL stand at the point the official map gives it in its region.

#### Scenario: An offering appears at its map point

- **GIVEN** the player enters the region that holds the offering's point
- **WHEN** the player walks to the point
- **THEN** the offering stands there and can be offered to

### Requirement: An offering's items are found in its place

Each offering's items SHALL be found at the spawned places in its area or come from its region's quests.

#### Scenario: An item for an offering is found exploring its place

- **GIVEN** an offering's item spawns at a place in its area
- **WHEN** the player gathers the item there
- **THEN** the item goes into the bag
