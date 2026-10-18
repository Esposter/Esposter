## ADDED Requirements

### Requirement: An event banner is offered only within its window

An event banner SHALL be offered to the player only while the server's time is inside its window, and SHALL NOT be offered between windows.

#### Scenario: A banner is offered inside its window

- **GIVEN** an event banner whose window holds the server's time
- **WHEN** the player opens the wish screen
- **THEN** the banner is offered beside the beginners' and standard banners

#### Scenario: A banner is not offered between windows

- **GIVEN** an event banner whose window has ended
- **WHEN** the player opens the wish screen
- **THEN** the banner is not offered

#### Scenario: An event banner page is read into its window and featured items

- **GIVEN** a wiki banner page for a weapon event from the twenty-third of September to the thirteenth of October
- **WHEN** the page is read
- **THEN** its window runs from the twenty-third of September at eleven in the morning to the thirteenth of October at six in the evening, at the Asia server's offset
- **AND** its featured items are the two five-stars and the five four-stars named on the page

### Requirement: Two character event banners run side by side and share counters

Two character event banners SHALL run side by side in their windows, and SHALL share the character banners' counters.

#### Scenario: Two character banners are offered together and share the character banners' counters

- **GIVEN** two character event banners whose windows both hold the server's time
- **WHEN** the player opens the wish screen
- **THEN** both banners are offered
- **AND** a draw on either banner advances the same counters

### Requirement: The wish history lists every draw

The wish history SHALL list each draw's kind, item and time, and SHALL keep draws beyond a year.

#### Scenario: A draw appears in the history with its kind, item and time

- **GIVEN** a draw the player has made
- **WHEN** the player opens the history
- **THEN** the draw is listed with its kind, its item and its time

#### Scenario: History keeps draws beyond a year

- **GIVEN** a draw made more than a year ago
- **WHEN** the player opens the history
- **THEN** the draw is still listed

### Requirement: A new character joins the roster and a repeat draw returns Starglitter

A character drawn for the first time SHALL join the player's roster, and a repeat draw SHALL count a copy and return its Starglitter.

#### Scenario: A new character joins the roster

- **GIVEN** a character the player has never drawn
- **WHEN** the player draws it
- **THEN** the character joins the player's roster

#### Scenario: A repeat draw returns Starglitter

- **GIVEN** a character the player already holds
- **WHEN** the player draws it again
- **THEN** the character's copy count rises by one
- **AND** the draw returns its Starglitter

### Requirement: The beginners' wish draws Noelle only on its eighth wish

The beginners' wish SHALL draw Noelle as its featured four-star on the eighth wish only.

#### Scenario: Noelle is drawn only on the eighth beginners' wish

- **GIVEN** a player on the beginners' wish
- **WHEN** the player makes the eighth wish
- **THEN** Noelle is among the four-stars the wish can draw
- **AND** on every other wish Noelle is not drawn

### Requirement: A Fate costs earned Primogems only

A Fate SHALL cost only earned Primogems, and a purchase with money SHALL NOT be offered.

#### Scenario: Fates are paid only in earned Primogems

- **GIVEN** a player holding earned Primogems
- **WHEN** the player buys a Fate
- **THEN** the price is taken in earned Primogems

### Requirement: A schedule naming an item the names do not hold fails the build

A schedule build SHALL fail when a banner names an item that joins none of the names, rather than dropping the item.

#### Scenario: A schedule naming an unknown item fails the build

- **GIVEN** a banner page that names an item the names do not hold
- **WHEN** the schedule is built
- **THEN** the build fails and names the item
