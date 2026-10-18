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

The save SHALL hold the player's wallet, bag, carried quest progress, unlocked landmarks, opened chests, achievement progress, learned recipes, wish counters, Adventure EXP, Reputation, Companionship EXP, World Level setting and chosen name, and SHALL hold nothing that is derived on load.

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

### Requirement: Systems not yet saved reset on reload

The save SHALL NOT hold the characters a player owns, commissions, expeditions, forge queues, enemy respawn times or exploration progress, and those SHALL start fresh after a reload.

#### Scenario: Characters granted by a wish are lost on reload

- **GIVEN** a wish has granted a character and the page is reloaded
- **WHEN** the save is read back
- **THEN** that character is not held until the roster is saved

#### Scenario: A defeated enemy returns after a reload

- **GIVEN** the player has defeated an enemy
- **WHEN** the page is reloaded
- **THEN** the enemy is back in its place

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
