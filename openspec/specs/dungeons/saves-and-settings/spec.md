## Purpose

The Dungeons save blob, saving from the world menu, the settings scene, and achievements. The game keeps one run and one set of settings per player, and saving only happens when the player asks for it.

## Requirements

### Requirement: One saved run per player

The game SHALL keep at most one saved run per player, stored beside the player's settings.

#### Scenario: Continue appears only when a save exists

- **WHEN** a visitor opens the title screen and a saved run exists
- **THEN** the Continue option is offered

#### Scenario: Continue is hidden without a save

- **WHEN** a visitor opens the title screen and no saved run exists
- **THEN** the Continue option is not offered

### Requirement: Saved data loads when the page opens

The game SHALL load the player's saved data when the page opens, from the player's account for signed-in players and from the browser for anonymous visitors.

#### Scenario: A signed-in player's save loads from the account

- **GIVEN** the player is signed in
- **WHEN** the page opens
- **THEN** the saved data is loaded from the player's account

#### Scenario: An anonymous visitor's save loads from the browser

- **GIVEN** the visitor is not signed in
- **WHEN** the page opens
- **THEN** the saved data is loaded from the browser

### Requirement: Saving is manual

The game SHALL save the run only when the player chooses Save from the world menu, and SHALL never save automatically.

#### Scenario: Choosing Save from the world menu saves the run

- **WHEN** the player chooses Save from the world menu
- **THEN** the current run replaces the saved run

#### Scenario: Playing without saving keeps the last save

- **GIVEN** the player has saved a run
- **WHEN** the player keeps playing without choosing Save
- **THEN** the saved run is unchanged

### Requirement: Settings apply across runs

The settings scene SHALL let the player change text speed, battle style, animations, sound, and theme mode, and the chosen settings SHALL apply to every run and be stored in the same save as the run.

#### Scenario: Text speed changes how fast dialog appears

- **GIVEN** the player has set text speed to Fast
- **WHEN** dialog is shown
- **THEN** the dialog text appears faster than at Slow

#### Scenario: Settings carry over to a new run

- **GIVEN** the player has changed the settings
- **WHEN** the player starts a new game
- **THEN** the changed settings still apply

### Requirement: Animations off changes timing, never outcome

With animations off, every presentation SHALL reach the same end state it reaches animated, and only the time it takes SHALL change.

#### Scenario: A presentation with animations off ends where the animated one does

- **GIVEN** the player has turned Animations off
- **WHEN** a monster appears, a ball is thrown, the camera mask closes, or a battle attack plays
- **THEN** the presentation shows its end state without playing the animation

#### Scenario: Dialog text appears in full with animations off

- **GIVEN** the player has turned Animations off
- **WHEN** a dialog message is shown
- **THEN** its full text is on screen before the input prompt appears

### Requirement: The settings cursor saves only the value it lands on

The settings cursor SHALL move between options with direction input and SHALL save a setting only when it lands on one of that option's value cells. An option with no value cell — Volume, Theme Mode, and Close — SHALL take no value from the cursor: its own controls change its value, and Close changes nothing.

#### Scenario: Moving between options saves nothing

- **GIVEN** the cursor is on Sound
- **WHEN** the player presses down
- **THEN** the cursor moves to Animations
- **AND** no setting is saved

#### Scenario: The cursor rests on the current value

- **WHEN** the cursor moves onto an option with value cells
- **THEN** it rests on the cell holding that option's current setting

#### Scenario: Left and right step through an option's values and save each one

- **GIVEN** the cursor rests on Mid for Text Speed
- **WHEN** the player presses right
- **THEN** the cursor moves to Fast
- **AND** the text speed setting is saved as Fast

#### Scenario: Stepping past either end of an option's values does nothing

- **GIVEN** the cursor rests on Fast for Text Speed
- **WHEN** the player presses right
- **THEN** the cursor stays on Fast
- **AND** no setting is saved

#### Scenario: Clicking a value saves it

- **WHEN** the player clicks a value cell
- **THEN** the cursor moves there
- **AND** that value is saved

#### Scenario: Clicking an option's name saves nothing

- **WHEN** the player clicks an option's name
- **THEN** the cursor moves to that option's row, resting on its current value
- **AND** no setting is saved

#### Scenario: Selecting the Volume row saves nothing

- **WHEN** the player selects the Volume row, by a click or by moving onto it
- **THEN** no setting is saved
- **AND** the volume keeps its value

#### Scenario: Confirming Close leaves the settings

- **GIVEN** the cursor is on Close
- **WHEN** the player confirms
- **THEN** the game returns to the title

### Requirement: Stored data in an unreadable or older shape starts a fresh run

The game SHALL accept only the current save shape, and stored data that cannot be read or is in an older shape SHALL start a fresh run.

#### Scenario: Unreadable stored data starts a fresh run

- **WHEN** the page opens and the stored data cannot be read
- **THEN** a fresh run starts

#### Scenario: Older-shape stored data starts a fresh run

- **WHEN** the page opens and the stored data is in an older shape
- **THEN** a fresh run starts

### Requirement: Saves are refused when the stored copy has changed

A save SHALL be written only against the version of the saved data the player last read, and a refused save SHALL reload the page so the player takes the server's copy.

#### Scenario: A save writes the run

- **WHEN** the player saves and the saved data has not changed since it was read
- **THEN** the run is stored

#### Scenario: A save over changed data is refused

- **GIVEN** the saved data has changed since the player read it
- **WHEN** the player saves
- **THEN** the save is refused
- **AND** the page reloads with the server's copy

### Requirement: A party wipe respawns without rolling back

A party wipe SHALL send the player to their respawn location with the party healed, and SHALL keep the progress made since the last save.

#### Scenario: Party wipe respawns the player

- **WHEN** every monster in the player's party faints
- **THEN** the player appears at their respawn location
- **AND** the party is healed

#### Scenario: Progress since the last save is kept

- **GIVEN** the player has progressed since the last save
- **WHEN** the party is wiped
- **THEN** the progress since the last save is kept

### Requirement: Count achievements track saves

The game SHALL unlock the DungeonCrawler achievement on the first save and the DungeonMaster achievement on the fiftieth save.

#### Scenario: The first save unlocks DungeonCrawler

- **WHEN** the player saves for the first time
- **THEN** the DungeonCrawler achievement is unlocked

#### Scenario: The fiftieth save unlocks DungeonMaster

- **WHEN** the player saves for the fiftieth time
- **THEN** the DungeonMaster achievement is unlocked

### Requirement: Play milestone achievements read the saved run

The game SHALL unlock play milestone achievements from the saved run when the player saves, covering party size, monster levels, species collected, and chests opened.

#### Scenario: Two party monsters unlock MonsterCatcher

- **WHEN** the player saves with two monsters in the party
- **THEN** the MonsterCatcher achievement is unlocked

#### Scenario: One party monster does not unlock MonsterCatcher

- **WHEN** the player saves with only one monster in the party
- **THEN** the MonsterCatcher achievement is not unlocked

#### Scenario: A monster at level 10 unlocks MonsterTrainer

- **WHEN** the player saves with a monster at level 10
- **THEN** the MonsterTrainer achievement is unlocked

#### Scenario: A monster at level 25 unlocks MonsterElite

- **WHEN** the player saves with a monster at level 25
- **THEN** the MonsterElite achievement is unlocked

#### Scenario: Every species in the party unlocks MonsterCollector

- **WHEN** the player saves with a monster of every species in the party
- **THEN** the MonsterCollector achievement is unlocked

#### Scenario: Every discovered chest opened unlocks DungeonHomeowner

- **WHEN** the player saves with every discovered chest on every map opened
- **THEN** the DungeonHomeowner achievement is unlocked
