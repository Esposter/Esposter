## Purpose

The Genshin world's save as one blob per signed-in player, written under a session lease so one game runs per account, with the save's slices owned beside their models and the systems outside it named, the blob-state path that carries its ETag as If-Match and answers a lost write as a conflict, a blob that no longer parses that is never overwritten, a start that fails blocking the page until it takes, a retried start answering the start it already took, the save a page has not had acknowledged kept in a journal the next start adopts, saves sent one at a time by value on the autosave interval and at each grant, the server's clock offset kept by the client, a guest's save merged on sign-in, a replaced session told at once and refused on its next write, and the write budget the cadence sets.

## Requirements

### Requirement: One game runs per account under a session lease

A signed-in player's save SHALL be held as one record under the session that most recently started the game, so that starting the game in a new session replaces the one before it.

#### Scenario: Starting the game in a second tab takes the lease

- **GIVEN** the game is open in one tab for a signed-in player
- **WHEN** the game is started in a second tab
- **THEN** the second tab takes the lease and resumes the saved game
- **AND** the first tab is replaced

#### Scenario: A replaced session's next save is refused

- **GIVEN** a tab's session has been replaced by another start
- **WHEN** that tab saves its game
- **THEN** the save is refused as a replacement

### Requirement: The save holds what the player did and nothing derived

The save SHALL hold the player's characters with their copies, wallet, bag, carried quest progress, unlocked landmarks, opened chests, achievement progress, learned recipes, wish counters, Adventure EXP, Reputation, the bounty taken, the week's bounty claims and the week's request claims, Companionship EXP, World Level setting and chosen name, and SHALL hold nothing that is derived on load.

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

### Requirement: A write from a replaced session is refused and never merged

A write from a session that is no longer current SHALL be refused as a replacement, and its changes SHALL NOT be merged into the save.

#### Scenario: A stale session's changes are dropped

- **GIVEN** another session has taken the lease since this tab last saved
- **WHEN** this tab sends a save
- **THEN** the save is refused as a replacement
- **AND** none of the stale session's changes reach the stored save

### Requirement: A stored save that does not parse is never overwritten

A stored save that does not parse SHALL be left as it is, and the start or save that found it SHALL answer with a logged error.

#### Scenario: An unreadable save is left in place

- **GIVEN** the stored save does not parse
- **WHEN** a start or a save reads it
- **THEN** the call answers with a logged error
- **AND** the stored save is left unchanged

#### Scenario: A player with no stored save starts a new one

- **GIVEN** no stored save exists for the account
- **WHEN** the game is started
- **THEN** a new player's save is written

### Requirement: A start that fails holds the page until it takes

A signed-in player whose start fails SHALL see the loading screen held, with the start retried after a growing wait, and SHALL NOT play the browser's copy of the game in its place.

#### Scenario: A failed start holds the loading screen and retries

- **GIVEN** a signed-in player's start fails
- **WHEN** the failure is shown
- **THEN** the loading screen holds
- **AND** the start is retried after a wait that grows toward a cap

#### Scenario: Retry ends the wait early

- **GIVEN** the start is waiting before its next attempt
- **WHEN** the player presses Retry
- **THEN** the next attempt begins at once

### Requirement: A retried start is answered by the start it already took

A start retried under the same session SHALL be answered by the start that its first write took, rather than replacing the player's own session.

#### Scenario: A lost response does not replace the player's own session

- **GIVEN** a start's write landed but its response was lost
- **WHEN** the same page retries the start
- **THEN** the retry is answered with the start that already took
- **AND** the player's own session is not replaced

#### Scenario: A guest's save is not uploaded again over the account

- **GIVEN** a start created the account on its first attempt
- **WHEN** the start is retried
- **THEN** the guest's save is not uploaded again

### Requirement: An unacknowledged save is journaled and adopted by the same session's next start

A save the server has not acknowledged SHALL be kept in the browser under the account, and the next start SHALL adopt it only when it replaced the session that wrote it.

#### Scenario: A hidden page keeps its unsent save

- **GIVEN** a save has not been acknowledged
- **WHEN** the page is hidden or left
- **THEN** the save is kept in the browser under the account

#### Scenario: The next start adopts a journal of the session it replaced

- **GIVEN** a journal holds an unacknowledged save
- **WHEN** a start replaces the session that wrote the journal
- **THEN** the journaled save is adopted

#### Scenario: A journal of another session is discarded

- **GIVEN** a journal holds an unacknowledged save from another session
- **WHEN** a start is answered
- **THEN** the journal is discarded

### Requirement: Saves are sent by value, one at a time, on the autosave interval and at each grant

Saves SHALL be sent one at a time, each carrying the whole game state, on the autosave interval, after each grant and when the page is left.

#### Scenario: A save requested during another save runs once after it

- **GIVEN** a save is in flight
- **WHEN** further changes are made
- **THEN** one further save follows the one in flight
- **AND** it carries the newest state

#### Scenario: Idle play sends no save

- **GIVEN** nothing in the game has changed since the last stored save
- **WHEN** the autosave interval passes
- **THEN** no save is sent

#### Scenario: A save the schema refuses is not sent

- **GIVEN** the game state fails the save schema
- **WHEN** a save is requested
- **THEN** the save is not sent
- **AND** the failure is logged and shown to the player

### Requirement: A guest's save merges into the account's by fixed rules

A guest's save SHALL merge into a signed-in account's save by fixed rules, with landmarks and achievements only growing, and a new account SHALL take the guest's save whole.

#### Scenario: A new account takes the guest's save whole

- **GIVEN** a guest signs in to an account with no save
- **WHEN** the sign-in completes
- **THEN** the account's save is the guest's save

#### Scenario: Landmarks and achievements keep the larger progress

- **GIVEN** a guest and the account each hold unlocked landmarks and achievement progress
- **WHEN** the guest signs in
- **THEN** the unlocked landmarks are the union of both
- **AND** each achievement keeps the larger count and the earlier finish

#### Scenario: The account's bag and wallet are kept

- **GIVEN** a guest and an account each hold a bag and a wallet
- **WHEN** the guest signs in
- **THEN** the account's bag and wallet are kept

#### Scenario: A mail is kept once by its id, and read or claimed on either copy stays so

- **GIVEN** a guest and the account each hold a mail with the same id, the account having read it and the guest having claimed it
- **WHEN** the guest signs in
- **THEN** the account holds that mail once, read and claimed
- **AND** a mail only the guest holds is kept

### Requirement: A replaced player is told at once when subscribed and otherwise at the next refused save

A player whose session is replaced SHALL be told at once while the page is subscribed, and otherwise at the next save refused for that reason.

#### Scenario: A subscribed page is told at once

- **GIVEN** a page is subscribed to session replacement for the player
- **WHEN** another start replaces the session
- **THEN** the page is told at once that its session was replaced

#### Scenario: A page not subscribed is told at its next refused save

- **GIVEN** a page is not subscribed to session replacement
- **WHEN** its next save is refused as a replacement
- **THEN** the page stops saving
- **AND** it offers the player the chance to take the game back

### Requirement: A save over its bounds is refused

A save whose bag, achievements, identifiers or serialized size pass their bounds SHALL be refused rather than stored.

#### Scenario: A save past the serialized size bound is refused

- **GIVEN** a save would exceed the largest size a save may take
- **WHEN** the save is sent
- **THEN** the save is refused
- **AND** the stored save is unchanged

#### Scenario: A save at every bound is accepted

- **GIVEN** every collection in a save is at its own bound
- **WHEN** the save is sent
- **THEN** the save is accepted

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

The save SHALL NOT hold expeditions, forge queues or the camps cleared, and those SHALL start fresh after a reload.

#### Scenario: An expedition starts fresh after a reload

- **GIVEN** the player has a character on an expedition
- **WHEN** the page is reloaded
- **THEN** the expedition is not kept

### Requirement: The save holds each defeated enemy's respawn time in a camp with no boss

The save SHALL hold the instant each defeated enemy in a camp with no boss comes back, by its spawn key, as an ISO string on the server's clock, and SHALL NOT hold one for an enemy in a camp with a boss. A merge SHALL keep the later of the two copies' instants for each enemy.

#### Scenario: A defeat in a camp with no boss is saved with its respawn time

- **GIVEN** a common enemy defeated
- **WHEN** the save is written
- **THEN** it holds the enemy's spawn key with the instant twelve hours after its defeat

#### Scenario: A defeat in a camp with a boss is not saved

- **GIVEN** a camp with a boss and a member defeated
- **WHEN** the save is written
- **THEN** it holds no instant for the member

#### Scenario: The later respawn time is kept when two saves merge

- **GIVEN** a guest save and an account save each holding a respawn time for the same enemy, the guest's the later
- **WHEN** the two saves are merged
- **THEN** the merged save holds the guest's respawn time for the enemy
