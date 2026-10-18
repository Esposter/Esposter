## ADDED Requirements

### Requirement: Japanese and Korean spoken lines are spoken in their own language

The persona voice SHALL speak a spoken line written in Japanese or Korean in the voice of the reply's dub, in that language.

#### Scenario: A Japanese line is spoken as Japanese

- **GIVEN** a reply's spoken line is written in Japanese
- **AND** the dub is ja
- **WHEN** the line is spoken
- **THEN** the line is heard as Japanese in the ja voice

#### Scenario: A Korean line is spoken as Korean

- **GIVEN** a reply's spoken line is written in Korean
- **WHEN** the line is spoken
- **THEN** the line is heard as Korean

### Requirement: A sentence with Latin letters is spoken as English

The persona voice SHALL speak any sentence containing Latin letters as English, even when the sentence also holds a phrase in another script.

#### Scenario: English prose with one Japanese phrase reads as English

- **GIVEN** a sentence contains Latin letters and one Japanese phrase
- **WHEN** the sentence is spoken
- **THEN** the sentence is read as English

### Requirement: A sentence in a script no model reads is not spoken and is logged

The persona voice SHALL NOT speak a sentence written in a script that no model reads, SHALL log the reason, and SHALL keep speaking the next line.

#### Scenario: An unreadable sentence is dropped and logged

- **GIVEN** a reply's sentence is written in a script that no model reads
- **WHEN** the reply is spoken
- **THEN** that sentence is not spoken
- **AND** the reason is written to the log once
- **AND** the next line is spoken as usual

### Requirement: A spoken line is split into sentences at every script's sentence endings

The persona voice SHALL split a spoken line into sentences at the sentence endings of every script the roster speaks.

#### Scenario: A full-width sentence ending splits a Japanese line

- **GIVEN** a spoken line written in Japanese contains two sentences ending in full-width punctuation
- **WHEN** the line is split
- **THEN** it yields two sentences

### Requirement: A sentence starts playing after its first clause is synthesized

The persona voice SHALL start playing a sentence once its first clause is synthesized, and SHALL NOT wait for the whole sentence.

#### Scenario: Playback starts at the first clause of a long sentence

- **GIVEN** a long sentence has several clauses
- **WHEN** the sentence is spoken
- **THEN** playback starts before its last clause is synthesized

### Requirement: The dub still names the voice and the text names the language

The persona voice SHALL choose the reader's dub for whose voice speaks, and SHALL take the language from the text.

#### Scenario: English text is read in the Japanese voice when the dub is ja

- **GIVEN** the dub is ja
- **AND** the reply's spoken line is written in English
- **WHEN** the line is spoken
- **THEN** the line is read in English in the ja voice
