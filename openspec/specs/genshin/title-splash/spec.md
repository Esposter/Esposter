## Purpose

The opening's second splash, the game's title logo in flat grey on white, drawn as each reader's language's client draws it — 原神 for Chinese and Japanese, 원신 for Korean, and the English logo for every other language — every logo on the one canvas the game's own sprites share.

## Requirements

### Requirement: Title logo drawn for the reader's language

The title splash SHALL show the title logo the game's client shows in the reader's language.

#### Scenario: Simplified Chinese reader

- **GIVEN** the reader's language is Simplified Chinese
- **WHEN** the title splash is shown
- **THEN** the logo is 原神 alone

#### Scenario: Traditional Chinese and Japanese readers

- **GIVEN** the reader's language is Traditional Chinese or Japanese
- **WHEN** the title splash is shown
- **THEN** the logo is 原神 with the Latin line "Genshin" or "Genshin Impact" beneath it

#### Scenario: Korean reader

- **GIVEN** the reader's language is Korean
- **WHEN** the title splash is shown
- **THEN** the logo is 원신 with the Latin line "Genshin Impact" beneath it

#### Scenario: Any other language

- **GIVEN** the reader's language is any other language
- **WHEN** the title splash is shown
- **THEN** the logo is the English "GENSHIN IMPACT"

### Requirement: Mainland China's splash carries its publishing licence

The mainland China build's title splash SHALL print four lines of its publishing licence beneath the logo, fading in behind it.

#### Scenario: Licence under the logo

- **GIVEN** the reader plays the mainland China build
- **WHEN** the title splash is shown under its logo
- **THEN** four lines of the publishing licence print over the foot of the screen
- **AND** they fade in behind the logo

#### Scenario: Health notice follows at once

- **GIVEN** the mainland China build's title splash has held and faded
- **WHEN** its licence has finished
- **THEN** the health notice follows at once

### Requirement: Opening holds the white until the logo arrives

The opening SHALL hold its white backdrop until the reader's logo has arrived, so that the first splash never shows a title with no logo.

#### Scenario: Logo still on its way

- **GIVEN** the reader's logo has not yet arrived
- **WHEN** the opening reaches its first splash
- **THEN** the white backdrop is held

#### Scenario: Logo arrived

- **GIVEN** the reader's logo has arrived
- **WHEN** the opening reaches its first splash
- **THEN** the splash draws the logo

### Requirement: Every white of the opening is the game's near-white

Every white of the opening SHALL be a shade a step under full white, as the game's PC client draws it.

#### Scenario: Splash white

- **GIVEN** the opening is on screen
- **WHEN** its white backgrounds are drawn
- **THEN** each is the game's near-white rather than full white

### Requirement: All logos share one canvas

Every title logo SHALL stand on the one canvas the game's sprites share, placed so the English logo's ink lands where the English client's does.

#### Scenario: English logo placed on the canvas

- **GIVEN** the English logo is shown
- **WHEN** it is placed on the shared canvas
- **THEN** its ink lands where the English client's ink lands

#### Scenario: Other logos placed by their own client

- **GIVEN** a Chinese, Japanese or Korean logo is shown
- **WHEN** it is placed on the shared canvas
- **THEN** it stands where its own client's logo stands

### Requirement: Splash named by the game's window title

The title splash SHALL be named to a screen reader by the game's own window title in the reader's language.

#### Scenario: Screen reader names the splash

- **GIVEN** a screen reader is reading the title splash
- **WHEN** the splash is announced
- **THEN** it is named by the game's window title in the reader's language
