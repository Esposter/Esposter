## Purpose

The profanity check in @esposter/shared, an English word list and a whole-word matcher absorbed from @2toad/profanity, with the verdict on each of its upstream issues.

## Requirements

### Requirement: The check reports whether text contains a profane word as a whole word

The check SHALL report true when text contains a profane English word that no letter, number or combining mark touches, and SHALL match regardless of case.

#### Scenario: A profane word set off by punctuation is found

- **GIVEN** text in which a profane word is separated from its neighbours by punctuation or an emoji
- **WHEN** a caller runs the check
- **THEN** the result is true

#### Scenario: A profane word inside a longer word is not found

- **GIVEN** text in which a profane word appears only inside a longer word such as arsenic or passionate
- **WHEN** a caller runs the check
- **THEN** the result is false

#### Scenario: A letter with a diacritic is part of the word

- **GIVEN** text in which a profane word is followed by a letter with a diacritic
- **WHEN** a caller runs the check
- **THEN** the result is false

### Requirement: Substring matching is available only when a caller turns whole-word matching off

The check SHALL match a profane word anywhere in text when a caller turns whole-word matching off, and SHALL match whole words only otherwise.

#### Scenario: A substring match finds a word inside a longer word

- **GIVEN** text in which a profane word appears inside a longer word, and whole-word matching turned off
- **WHEN** a caller runs the check
- **THEN** the result is true

#### Scenario: Whole-word matching is the default

- **GIVEN** the same text and no option given
- **WHEN** a caller runs the check
- **THEN** the result is false

### Requirement: A value that is not a string is never profane

The check SHALL return false for any value that is not a string, and SHALL NOT throw.

#### Scenario: A number is checked without an error

- **GIVEN** a value that is a number
- **WHEN** a caller runs the check on it
- **THEN** the result is false
- **AND** no error is thrown

#### Scenario: A missing value is checked without an error

- **GIVEN** a value that is null
- **WHEN** a caller runs the check on it
- **THEN** the result is false
- **AND** no error is thrown

### Requirement: A profane word is matched as literal characters

The check SHALL read every word of its list as literal text, so that a character with a meaning in a pattern matches only itself.

#### Scenario: A word ending in a dollar sign matches its own characters

- **GIVEN** a list word that ends in a dollar sign
- **WHEN** a caller runs the check on text containing that word
- **THEN** the result is true

### Requirement: The check offers one function and no list changes

The check SHALL offer one function that takes text and options, and SHALL NOT offer adding or removing words, a whitelist, censoring or a language choice.

#### Scenario: A caller looks for a way to change the list

- **GIVEN** a caller that wants to add a word, whitelist a word, censor text or pick a language
- **WHEN** the caller looks at the check's surface
- **THEN** no such option or function is offered

### Requirement: The check matches English only

The check SHALL match English profane words only, and a caller needing another language SHALL supply its own list and check.

#### Scenario: A caller needs another language

- **GIVEN** a caller that needs profanity checking in another language
- **WHEN** the caller uses this check
- **THEN** the check does not match words of that language
- **AND** the caller supplies its own list and check for it

### Requirement: Every upstream issue carries exactly one verdict

The audit of the upstream package SHALL record exactly one verdict for every issue it reads, and every in-scope defect SHALL have a regression case that names it.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue on the upstream tracker
- **WHEN** a reviewer looks the issue up on the audit page
- **THEN** exactly one verdict is recorded for it
- **AND** an in-scope defect names the regression case that proves it
