## Purpose

The single 60 FPS game tick, click handling, autosave, and the normalized id-based save persisted per user to Azure blob or localStorage.

## Requirements

### Requirement: Production continues while the tab is in the background

The clicker SHALL keep producing points while the game page is open, including while its browser tab is in the background.

#### Scenario: Production continues in a background tab

- **GIVEN** a player who owns a building
- **WHEN** the game tab stays in the background for a minute
- **THEN** the player's points have still increased over that minute

### Requirement: A purchase takes effect on the next tick

The clicker SHALL apply a purchase to production on the next game tick without a page reload.

#### Scenario: Purchase raises production without a reload

- **GIVEN** a player who has just bought a building
- **WHEN** the next game tick runs
- **THEN** the building's production is included in the points added

### Requirement: A click adds points and shows the amount

The clicker SHALL add the click's power to the player's points on each click of the central item and SHALL show a floating amount at the cursor.

#### Scenario: Click adds points and shows a popup

- **GIVEN** a player on the clicker page
- **WHEN** the player clicks the central item
- **THEN** the player's points increase by the click's power
- **AND** a floating amount appears at the cursor

#### Scenario: Floating amount disappears after ten seconds

- **GIVEN** a floating amount shown by a click
- **WHEN** ten seconds pass
- **THEN** the floating amount is removed

### Requirement: The game saves automatically every minute

The clicker SHALL save the player's full game state at least once every minute while the player is playing.

#### Scenario: Autosave runs during play

- **GIVEN** a player who is playing and has changed nothing since the last save
- **WHEN** a minute passes
- **THEN** the full game state is saved

### Requirement: Purchases and type changes are saved at once

The clicker SHALL save a purchase or a change of type immediately instead of waiting for the next autosave.

#### Scenario: Purchase is saved straight away

- **GIVEN** a player on the clicker page
- **WHEN** the player buys a building
- **THEN** the game state is saved without waiting for the next autosave

### Requirement: A signed-in player's save follows the account

The clicker SHALL keep a signed-in player's save with their account, and SHALL keep an anonymous player's save in their browser.

#### Scenario: Signed-in save is restored on another device

- **GIVEN** a signed-in player whose save was made on one device
- **WHEN** the player opens the clicker on another device
- **THEN** the game resumes from that save

#### Scenario: Anonymous save is restored in the same browser

- **GIVEN** an anonymous player whose save was made in one browser
- **WHEN** the player returns to the clicker in that browser
- **THEN** the game resumes from that save

### Requirement: Item balance changes reach existing saves

The clicker SHALL apply the current definitions of buildings and upgrades to a saved game when it loads.

#### Scenario: Retuned building applies to an old save

- **GIVEN** a save made before a building's value was changed
- **WHEN** the save loads
- **THEN** the building produces at its current value

### Requirement: A save that cannot be read starts a fresh game

The clicker SHALL start a fresh game when a saved game cannot be read in its current shape or refers to items that no longer exist.

#### Scenario: Save in an old shape

- **GIVEN** a saved game in an earlier format
- **WHEN** the page loads
- **THEN** the player starts a fresh game

#### Scenario: Save referring to a removed item

- **GIVEN** a saved game that refers to an upgrade that no longer exists
- **WHEN** the page loads
- **THEN** the player starts a fresh game

### Requirement: A save made against an outdated copy is refused

The clicker SHALL refuse a save when the stored copy has changed since the player last read or saved it, and SHALL reload the page to take the stored copy.

#### Scenario: Save from a second session is refused

- **GIVEN** a player whose stored save was changed from another session
- **WHEN** this session tries to save
- **THEN** the save is refused
- **AND** the page reloads with the stored copy

### Requirement: Clicker milestones unlock their achievements

The clicker SHALL unlock a milestone achievement within a minute of the player reaching its condition, and SHALL record each achievement once.

#### Scenario: Reaching a million points unlocks the millionaire achievement

- **GIVEN** a player whose points reach one million
- **WHEN** the next autosave runs
- **THEN** the millionaire achievement is unlocked

#### Scenario: Owning every building unlocks the architect achievement

- **GIVEN** a player who owns at least one unit of every building
- **WHEN** the next autosave runs
- **THEN** the architect achievement is unlocked

#### Scenario: Milestone already earned is not recorded twice

- **GIVEN** a player who has already unlocked a milestone achievement
- **WHEN** the next autosave runs
- **THEN** the achievement is still recorded once
