## ADDED Requirements

### Requirement: The editor shows the note's word and character counts

The Note editor SHALL show the number of words and characters in the note under the document, and while text is selected, the number in the selection.

#### Scenario: The line shows the note's counts

- **GIVEN** a note whose text is two words in one paragraph and one word in the next
- **WHEN** the owner opens the note
- **THEN** the line reads three words
- **AND** it reads the characters of the three words

#### Scenario: A selection shows its own counts

- **GIVEN** a note of three words with the first word selected
- **WHEN** the selection changes
- **THEN** the line reads one word and that word's characters
- **AND** clearing the selection returns the line to the note's counts

#### Scenario: A language written without spaces counts by its words

- **GIVEN** a note whose text is one sentence of Japanese
- **WHEN** the line is drawn
- **THEN** it counts the sentence's words as the runtime segments them, not as one word

#### Scenario: A paragraph break separates two words

- **GIVEN** a note whose first paragraph ends in a word and whose second begins with one
- **WHEN** the line is drawn
- **THEN** the two words are counted as two
