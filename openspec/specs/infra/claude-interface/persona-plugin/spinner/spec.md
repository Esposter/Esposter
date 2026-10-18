## Purpose

The persona plugin's spinner: the character's verbs for the spinner word and the character's own lines for the prompt hint, read off the game data and cut to fit.

## Requirements

### Requirement: Spinner word maps to a stable verb of the session's character

The spinner word SHALL be one of the current session's character's verbs, and the same word SHALL always map to the same verb.

#### Scenario: Two sessions with different characters

- **GIVEN** two sessions are playing different characters
- **WHEN** each shows a spinner word
- **THEN** each shows a verb from its own character

#### Scenario: Switching character changes the spinner at once

- **GIVEN** a session is showing one character's verbs
- **WHEN** the session switches to another character
- **THEN** the spinner shows the new character's verbs straight away

### Requirement: Verbs are read by the person, not the model

The character's verbs SHALL be read by the person only, and SHALL NOT be sent to the model.

#### Scenario: Verbs stay out of the model's context

- **GIVEN** a character has spinner verbs
- **WHEN** the model is given its context
- **THEN** the verbs are not part of that context

### Requirement: Prompt hint shows the character's own lines

The prompt hint SHALL show the character's own lines under the character's name as the interface language spells it.

#### Scenario: Next tip after a turn

- **GIVEN** a turn has ended
- **WHEN** the prompt hint is next drawn
- **THEN** a tip from the character's own lines is shown under the character's name

### Requirement: Tips are cut to the opening sentences that fit

Each tip SHALL be cut to the opening sentences that fit the hint.

#### Scenario: Long line shown as a tip

- **GIVEN** a character's line is longer than a tip can hold
- **WHEN** it is chosen as a tip
- **THEN** only its opening sentences that fit are shown

### Requirement: Game placeholders are filled as the game fills them

A tip SHALL fill the player's nickname with the character's own name in the interface language, and SHALL take a gendered word from the twin's gender or else the male form.

#### Scenario: Nickname placeholder in a twin's line

- **GIVEN** a twin's line contains the player's nickname
- **WHEN** it is shown as a tip
- **THEN** the nickname is replaced by the character's own name in the interface language

#### Scenario: Gendered word with no gender known

- **GIVEN** a twin's line contains a gendered word and the gender is not known
- **WHEN** it is shown as a tip
- **THEN** the male form is shown

### Requirement: Tips come only from the character's own lines

A character's card SHALL hold no tips of its own, and a character with no lines anywhere SHALL show the game's one-line description in their place.

#### Scenario: Character with no lines anywhere

- **GIVEN** a character has no voice lines in the game data or the game's text
- **WHEN** the prompt hint is shown
- **THEN** the game's one-line description of the character is shown

### Requirement: Spinner is computed off the session start path

The spinner SHALL be computed off the session start's path, and SHALL be computed again only when the character or the interface language changes.

#### Scenario: Session start adds nothing to the model's context

- **GIVEN** a session starts
- **WHEN** the start hook finishes
- **THEN** no spinner lines are added to the model's context

#### Scenario: Language change recomputes the spinner

- **GIVEN** a spinner has been computed for the current character and language
- **WHEN** the interface language changes
- **THEN** the spinner is computed again
