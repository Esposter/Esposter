## MODIFIED Requirements

### Requirement: The save holds what the player did and nothing derived

The save SHALL hold the player's characters with their copies, wallet, bag, carried quest progress, unlocked landmarks, opened chests, achievement progress, learned recipes, wish counters, Adventure EXP, Reputation, Companionship EXP, World Level setting and chosen name, and SHALL hold nothing that is derived on load.

#### Scenario: Items bought before a reload are still in the bag

- **GIVEN** the player has bought an item and the save has been acknowledged
- **WHEN** the page is reloaded
- **THEN** the item is still in the bag

#### Scenario: Wish counters survive a reload

- **GIVEN** the player has made wishes and the save has been acknowledged
- **WHEN** the page is reloaded
- **THEN** the wish counters are as they were

#### Scenario: A derived value is read from its source on load

- **GIVEN** a character's Friendship Level is shown
- **WHEN** the save is loaded
- **THEN** the level is read from the character's Companionship EXP rather than from a saved level

## REMOVED Requirements

### Requirement: Systems not yet saved reset on reload

## ADDED Requirements

### Requirement: The save keeps the characters the player holds

The save SHALL keep each character the player holds with its level, ascension, constellations, talent levels, weapon, artifacts and copy count.

#### Scenario: A held character survives a reload

- **GIVEN** a player whose wish granted a character at level five with two copies
- **WHEN** the world is reloaded
- **THEN** the character is held again at level five with two copies
- **AND** its weapon and artifacts are the ones it had

#### Scenario: A new player starts with the Traveler alone

- **GIVEN** a save that holds no characters
- **WHEN** the world opens
- **THEN** the player's party holds the Traveler alone

#### Scenario: A save past the character limit is refused

- **GIVEN** a save that holds more characters than the save allows
- **WHEN** the save is read
- **THEN** the read fails and no character is loaded

### Requirement: Companionship EXP is kept once, on the character it was earned by

The save SHALL keep each character's Companionship EXP under that character's id, and SHALL keep the saved Companionship EXP of a character the roster does not hold.

#### Scenario: Companionship EXP is restored on the character it was earned by

- **GIVEN** a save that holds a character and Companionship EXP for that character
- **WHEN** the world is loaded
- **THEN** the character shows that Companionship EXP

#### Scenario: A character missing from the roster keeps its saved Companionship EXP

- **GIVEN** a save that holds Companionship EXP for a character the roster does not hold
- **WHEN** the world is saved
- **THEN** the save still holds that Companionship EXP

### Requirement: A merge keeps one copy of a character both saves hold

The merge SHALL keep a character both saves hold as the copy further on by level and then constellations, with its copy count the larger of the two, and SHALL keep a character only one save holds.

#### Scenario: The copy further on is kept when both saves hold a character

- **GIVEN** a guest save holding a character at level ten and an account save holding it at level seven
- **WHEN** the two saves are merged
- **THEN** the merged save holds the guest's copy of the character at level ten
- **AND** its copy count is the larger of the two copy counts

#### Scenario: Equal levels are settled by constellations

- **GIVEN** a guest save and an account save each holding a character at level ten, the guest's with two constellations and the account's with four
- **WHEN** the two saves are merged
- **THEN** the merged save holds the account's copy of the character

#### Scenario: A character only the guest holds is kept

- **GIVEN** a guest save holding a character the account save does not hold
- **WHEN** the two saves are merged
- **THEN** the merged save holds that character

### Requirement: Systems not yet saved start fresh after a reload

The save SHALL NOT hold commissions, expeditions, forge queues, enemy respawn times or exploration progress, and those SHALL start fresh after a reload.

#### Scenario: A defeated enemy returns after a reload

- **GIVEN** the player has defeated an enemy
- **WHEN** the page is reloaded
- **THEN** the enemy is back in its place
