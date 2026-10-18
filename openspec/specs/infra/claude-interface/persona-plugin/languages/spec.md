## Purpose

The three language settings of the persona plugin, reply, interface and dub, and which of them owns each word a person reads: the game's, the runtime's or the plugin's own.

## Requirements

### Requirement: Reply and interface languages are separate settings

The reply language and the interface language SHALL be set separately, and setting the interface language SHALL set the reply language only while the reply language has not been overridden.

#### Scenario: Interface language sets an unset reply language

- **GIVEN** the reply language has not been overridden
- **WHEN** the interface language is set
- **THEN** the reply language is set to the same language

#### Scenario: Overridden reply language is kept

- **GIVEN** the reply language has been overridden
- **WHEN** the interface language is set
- **THEN** the reply language keeps its override

### Requirement: Interface languages are the game's fifteen

The language verb given no argument SHALL list the game's fifteen interface languages, each in its own words beside the word typed for it.

#### Scenario: Listing the interface languages

- **GIVEN** the language verb is run with no argument
- **WHEN** its output is read
- **THEN** all fifteen game languages are listed
- **AND** each is shown in its own words beside the word typed for it

#### Scenario: Either form of a name is accepted

- **GIVEN** a person has the list in front of them
- **WHEN** they set the interface language to either the listed name or the typed word
- **THEN** the interface language is set

### Requirement: Reply language accepts any language

The reply language SHALL accept any language name, and a name that is not a game language SHALL be shown as typed.

#### Scenario: Reply language outside the game's list

- **GIVEN** a person sets the reply language to a name the game does not carry
- **WHEN** the setting is shown
- **THEN** the name is shown as the person typed it

### Requirement: Session start tells the model the reply language

The session start SHALL give the model the reply language as context unless the reply language and the interface language are both English.

#### Scenario: Both languages English

- **GIVEN** the reply language and the interface language are both English
- **WHEN** a session starts
- **THEN** no reply-language line is given to the model

#### Scenario: Non-English reply language

- **GIVEN** the reply language is not English
- **WHEN** a session starts
- **THEN** the model is given a reply-language line that names the spoken lines

### Requirement: Dub language is set only by the voice verb

The dub language SHALL be set only by the voice verb and SHALL NOT change with the interface language, and the language verb SHALL report the dub state without installing anything.

#### Scenario: Interface set to a language that has a dub

- **GIVEN** the interface language is set to a language a dub exists for
- **WHEN** the language verb finishes
- **THEN** it names the command that installs that dub
- **AND** nothing is installed

#### Scenario: Interface set to a language with no dub

- **GIVEN** the interface language is set to a language no dub exists for
- **WHEN** the language verb finishes
- **THEN** it states that replies keep reading in the voice already set up

### Requirement: Non-Latin replies are not spoken

A reply in a non-Latin script SHALL NOT be spoken, and the language verb SHALL warn when a cascade would cause this while a voice is set up.

#### Scenario: Cascade to a non-Latin language with a voice set up

- **GIVEN** a voice is set up
- **WHEN** the reply language would cascade to a non-Latin language
- **THEN** the language verb warns that replies will not be spoken

### Requirement: Welcome greeting follows the interface language

The welcome's greeting SHALL be in the interface language when the character has a translated greeting, and SHALL be the card's own words when it does not.

#### Scenario: Character with a translated greeting

- **GIVEN** the interface language has a greeting for the character
- **WHEN** the welcome is printed
- **THEN** the greeting is shown in the interface language

#### Scenario: Character without a translated greeting

- **GIVEN** the interface language has no greeting for the character
- **WHEN** the welcome is printed
- **THEN** the greeting is shown in the card's own words

### Requirement: Runtime supplies dates, list punctuation and language names

Relative dates, list punctuation and language names SHALL come from the runtime's own localization rather than from strings the plugin writes.

#### Scenario: Relative date in a language with plural rules

- **GIVEN** the interface language is Russian
- **WHEN** a birthday two days away is labelled
- **THEN** the label uses the runtime's own plural form

### Requirement: Missing strings fall back to English one string at a time

A string an interface language does not carry SHALL fall back to English for that string alone, and the rest of that language SHALL stay in that language.

#### Scenario: New character without translated verbs

- **GIVEN** the interface language has no verbs for a newly released character
- **WHEN** the character's spinner is shown
- **THEN** the verbs are English under the localized name and title
- **AND** the other strings stay in the interface language

### Requirement: English name is the identity in every language

A character's English name SHALL be its identity in every interface language, so that changing the interface language SHALL NOT change the pin, the recorded pick or the colour.

#### Scenario: Changing the interface language rewrites the record

- **GIVEN** a session has a recorded character
- **WHEN** the interface language is changed
- **THEN** the session's record, the pin and the spinner show the character in the new language
- **AND** the character keeps its colour

#### Scenario: Localized name resolves when typed

- **GIVEN** a person types a character's localized name
- **WHEN** the name is resolved
- **THEN** the character is found

### Requirement: Only the plugin's own words are localized

The plugin SHALL localize only the words it owns, and Claude Code's own menus, help and dialogs SHALL stay in English.

#### Scenario: Interface set to Japanese

- **GIVEN** the interface language is Japanese
- **WHEN** Claude Code's own menus are shown
- **THEN** they remain in English

### Requirement: Voices exist for four languages only

A voice dub SHALL exist for exactly four of the game's languages, and an interface language with no dub SHALL keep whichever voice is already set up.

#### Scenario: Interface in a language with no dub

- **GIVEN** the interface language is French and a Japanese voice is set up
- **WHEN** a reply is spoken
- **THEN** it is read in the Japanese voice
