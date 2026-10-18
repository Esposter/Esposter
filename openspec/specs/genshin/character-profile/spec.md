## Purpose

The character screen's Profile tab as built — each playable character's stories and voice-overs read from the game's fetter tables by their text ids in every language, each opened at the Friendship Level its fetter gives and locked with the game's own unlock line until then, beside the chosen entry's title and text. The model's space, the voice line with its voice actor and the namecard's art are not drawn yet.

## Requirements

### Requirement: Profile lists stories then voice-overs in the game's order

The character's Profile tab SHALL list its stories in the game's order, followed by its voice-overs, with the voice-overs the game hides left out.

#### Scenario: Stories come before voice-overs

- **GIVEN** the Profile tab is opened for a character
- **WHEN** its list is read
- **THEN** the stories come first in the game's order
- **AND** the voice-overs follow in the game's order

#### Scenario: Hidden voice-over is not listed

- **GIVEN** the game hides a voice-over
- **WHEN** the list is shown
- **THEN** that voice-over is not listed

### Requirement: A story opens at its Friendship Level

A story or voice-over SHALL open at the Friendship Level its game entry names, and SHALL stay locked for any other condition.

#### Scenario: Reaching the named level opens the story

- **GIVEN** a story names a Friendship Level
- **WHEN** the character's Friendship reaches that level
- **THEN** the story is open

#### Scenario: Locked story shows the game's unlock line

- **GIVEN** a story is locked and names a Friendship Level to open at
- **WHEN** it is listed
- **THEN** it shows the game's own unlock line for that level, with the story's title

#### Scenario: Condition other than a level keeps the story locked

- **GIVEN** a story names a condition such as a quest
- **WHEN** the character's Friendship is at any level
- **THEN** the story stays locked

#### Scenario: Locked story with no level shows its title alone

- **GIVEN** a locked story has no Friendship Level among its conditions
- **WHEN** it is listed
- **THEN** only its title is shown

### Requirement: The panel shows the chosen entry's title and text

Choosing an entry SHALL show its title and text beside the list, and a locked entry SHALL show no text.

#### Scenario: Open story shows its text

- **GIVEN** an open story is chosen
- **WHEN** the panel is shown
- **THEN** its title and text are shown beside the list

#### Scenario: Locked story shows no text

- **GIVEN** a locked story is chosen
- **WHEN** the panel is shown
- **THEN** no text is shown

#### Scenario: Missing text in the language falls back to English

- **GIVEN** the screen's language has no text for an entry
- **WHEN** the entry is chosen
- **THEN** its English text is shown

### Requirement: Friendship Level follows the character's Companionship EXP

The Friendship Level SHALL be the level that the character's total Companionship EXP has reached.

#### Scenario: Gaining Companionship EXP opens more stories

- **GIVEN** the character's Companionship EXP is below a level's threshold
- **WHEN** Companionship EXP is gained past that threshold
- **THEN** the Friendship Level rises
- **AND** stories that name that level open

### Requirement: The panel names the namecard once Friendship holds it

The panel SHALL name the character's namecard once Friendship holds it, except for the three characters who have none.

#### Scenario: Namecard named after Friendship holds it

- **GIVEN** the character's Friendship holds its namecard
- **WHEN** the panel is shown
- **THEN** the namecard's name is shown

#### Scenario: Characters with no namecard show none

- **GIVEN** the character is Xinyan, Yae Miko or Momoka
- **WHEN** the panel is shown
- **THEN** no namecard is shown
