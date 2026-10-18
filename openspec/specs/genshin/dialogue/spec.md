## Purpose

Genshin's dialogue as built. A talk is a graph of spoken lines and the Traveler's replies, each line's words named by the game's own text id. A pure runner advances it as a click, F or Space does, chooses a reply, and skips to the next reply or the end. The dialogue screen writes the line out in place at the game's own rate, a space taking no time, under its speaker's name and title, centres a narration on black, offers the replies down the right beside their traced marks, and carries auto-play and skip. A talk fills the player into its words. F on a resident begins their standing talk, read from the game's talk table, and its opening line offers the quest talks open to them.

## Requirements

### Requirement: A click advances a talk one step

A click, F or Space SHALL show a line still being written out whole, and otherwise SHALL move the talk on to the line's next line, or end the talk, or wait for a reply.

#### Scenario: A click on a line still being written shows it whole

- **GIVEN** a line still being written out
- **WHEN** the player clicks
- **THEN** the line is shown whole

#### Scenario: A click on a whole line starts the next line

- **GIVEN** a whole line with a next line
- **WHEN** the player clicks
- **THEN** the next line starts, unwritten

#### Scenario: A click on a whole line with nothing after it ends the talk

- **GIVEN** a whole line with nothing following it
- **WHEN** the player clicks
- **THEN** the talk ends

#### Scenario: A click on a line offering replies waits for a reply

- **GIVEN** a whole line whose next lines are replies
- **WHEN** the player clicks
- **THEN** the talk waits for a reply to be chosen

### Requirement: A reply is chosen only from those on offer

A reply SHALL be chosen only from the replies a line offers, and a reply not on offer SHALL be refused.

#### Scenario: A reply on offer leads down its branch

- **GIVEN** a line offering replies
- **WHEN** one of them is chosen
- **THEN** the talk goes on down that reply's branch

#### Scenario: A reply followed by more replies stays on screen as the Traveler's line

- **GIVEN** a chosen reply followed straight by more replies
- **WHEN** the reply is chosen
- **THEN** the reply stays on screen as the Traveler's own line
- **AND** the next replies are offered

#### Scenario: A reply not on offer is refused

- **GIVEN** a line offering replies
- **WHEN** a reply that is not on offer is chosen
- **THEN** the choice is refused
- **AND** the talk stays where it was

### Requirement: Skip runs the talk on without choosing a reply for the player

Skip SHALL run the talk on to the next line that offers replies, written out whole, or to the end of the talk, and SHALL NOT choose a reply for the player.

#### Scenario: Skip runs to the next replies with the line shown whole

- **GIVEN** a talk of spoken lines followed by a line offering replies
- **WHEN** Skip is pressed
- **THEN** the talk runs on to that line
- **AND** the line is shown whole with its replies offered

#### Scenario: Skip on a talk with no replies left ends it

- **GIVEN** a talk of spoken lines with no replies left
- **WHEN** Skip is pressed
- **THEN** the talk ends

#### Scenario: A talk whose spoken lines loop back without a reply is refused

- **GIVEN** spoken lines that loop back to each other with no reply between them
- **WHEN** the talk is run
- **THEN** the talk is refused rather than run forever

### Requirement: The player's name fills every word of a talk

Every line, reply and speaker name SHALL have the player's nickname and gender-specific words filled in before it is shown.

#### Scenario: A line with the player's placeholders shows the player's words

- **GIVEN** a line that refers to the player
- **WHEN** the line is shown
- **THEN** the player's nickname and gender-specific words appear in it

### Requirement: Lines are written out one character at a time at the game's rate

A line SHALL be written out one character every thirty milliseconds, a space taking no time, and SHALL keep its full layout from its first frame so it never rewraps.

#### Scenario: A character appears every thirty milliseconds

- **GIVEN** a line being written out
- **WHEN** thirty milliseconds pass
- **THEN** one more character is shown

#### Scenario: A space takes no time

- **GIVEN** a line being written out with a space
- **WHEN** the space is reached
- **THEN** the next character is shown without a delay

#### Scenario: A line does not rewrap while it is written

- **GIVEN** a line being written out
- **WHEN** its characters appear
- **THEN** the line keeps the layout it has from its first frame

### Requirement: Auto-play holds each whole line and stops at replies

Auto-play SHALL hold each whole line for a fixed time and then go on, and SHALL stop at a line offering replies or quest talks.

#### Scenario: Auto-play goes on after holding a whole line

- **GIVEN** auto-play on and a whole line with a next line
- **WHEN** the hold time passes
- **THEN** the talk goes on to the next line

#### Scenario: Auto-play stops at a line offering replies

- **GIVEN** auto-play on and a line offering replies
- **WHEN** the line is whole
- **THEN** auto-play stops there and waits for a reply

### Requirement: F on a resident begins their talk

F on a resident SHALL begin their standing talk, or else the first quest talk open to them, and a resident with neither SHALL offer no prompt.

#### Scenario: F begins a resident's standing talk

- **GIVEN** a resident whose standing talk the world holds
- **WHEN** the player presses F on them
- **THEN** their standing talk begins

#### Scenario: F begins the first open quest talk when there is no standing talk

- **GIVEN** a resident with no standing talk held and a quest talk open to them
- **WHEN** the player presses F on them
- **THEN** the first open quest talk begins

#### Scenario: A resident with neither talk offers no prompt

- **GIVEN** a resident with no standing talk held and no quest talk open to them
- **WHEN** the player is near them
- **THEN** no prompt is offered

### Requirement: A standing talk's opening line offers the open quest talks ahead of its own replies

A standing talk's opening line SHALL offer each quest talk open to the resident ahead of the talk's own replies and the duel.

#### Scenario: The opening line offers the open quest first

- **GIVEN** a standing talk with a quest talk open to the resident
- **WHEN** the opening line is shown
- **THEN** the quest's reply is offered ahead of the talk's own replies

#### Scenario: Choosing a quest reply ends in the quest's own end

- **GIVEN** a quest reply chosen from the opening line
- **WHEN** its talk ends
- **THEN** the quest advances, or the quest it offers starts

### Requirement: The dialogue screen names the speaker and centres narration on black

The dialogue screen SHALL show the speaker's name and title above the line, and SHALL draw a line with no speaker centred on a black screen.

#### Scenario: A spoken line shows its speaker's name and title above it

- **GIVEN** a spoken line whose speaker has a title
- **WHEN** the line is shown
- **THEN** the speaker's name is shown, then the title, then the line

#### Scenario: A line with no speaker is drawn as narration

- **GIVEN** a line with no speaker
- **WHEN** the line is shown
- **THEN** it is centred on a black screen

### Requirement: Replies are lit only once selected

The replies SHALL be drawn down the right beside their marks, none SHALL be lit until the pointer or an arrow selects one, and F SHALL choose the lit reply.

#### Scenario: Replies are offered unlit beside their marks

- **GIVEN** replies on offer
- **WHEN** they are shown
- **THEN** each is drawn beside its mark
- **AND** none is lit

#### Scenario: An arrow lights a reply and F chooses it

- **GIVEN** replies on offer with none lit
- **WHEN** an arrow is pressed and then F
- **THEN** the arrow lights a reply
- **AND** F chooses the lit reply

### Requirement: A screen reader hears a whole line once

The dialogue screen SHALL announce a whole line once to a screen reader rather than each character as it is written.

#### Scenario: A screen reader announces the whole line once

- **GIVEN** a line being written out character by character
- **WHEN** a screen reader reads the screen
- **THEN** the whole line is announced once

### Requirement: No voice plays for a line

Dialogue SHALL play no voice-over, even for a line that carries one.

#### Scenario: A voiced line plays no audio

- **GIVEN** a spoken line carrying a voice-over
- **WHEN** the line is shown
- **THEN** no audio plays

### Requirement: A standing talk that cannot run without words is left out of the record

A standing talk that cannot run without its words SHALL be left out of the record, and the count of such talks SHALL be reported.

#### Scenario: A talk with a reply that has no words is left out

- **GIVEN** a standing talk with a reply that has no words in the game's text
- **WHEN** the standing talk record is built
- **THEN** that talk is left out of the record
- **AND** the number of talks left out is reported
