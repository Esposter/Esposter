## Purpose

The game's own words in all fifteen of its languages (`~/Esposter.noindex/genshin-parity/text/TextMap/`), in the published genshin-text package — the language registry, a matcher from a reader's locale, and every string a consumer references, looked up by the game's own text id with one lazily loaded chunk per language. A generator reads them out of the game's text, its text maps decoded from the installed client and its tables from a dump kept outside the repository; nothing is translated by hand. The persona plugin takes a generated copy rather than a dependency (`scripts/src/services/genshinText/getPersonaModuleSource.ts`).

## Requirements

### Requirement: Game strings are referenced by the game's own text id

Every game string a consumer shows SHALL be referenced by the game's own text id, and SHALL NOT be translated by hand (`packages/genshin-text/src/models/GameTextKey.ts`).

#### Scenario: Consumer looks up a string by its id

- **GIVEN** a consumer needs a game string
- **WHEN** the consumer looks it up by its text id
- **THEN** the game's own text for that id is shown (`packages/genshin-text/src/models/GameTextKey.ts`, `packages/genshin-text/src/generated/GameTextLoaderMap.ts`)

#### Scenario: String missing from a language falls back to English

- **GIVEN** a language's text map lacks a string
- **WHEN** the generator runs
- **THEN** the English text is used for that language and the run reports it (`scripts/src/services/genshinText/writeGameText.ts`)

### Requirement: The game's text is available in its fifteen languages

The game's text SHALL be available in the game's fifteen languages, each as one chunk for that language (`packages/genshin-text/src/models/GameLanguage.ts`, `~/Esposter.noindex/genshin-parity/text/TextMap/`).

#### Scenario: Each language has its own chunk

- **GIVEN** the generator has run
- **WHEN** the text is published
- **THEN** each of the fifteen languages has its own chunk (`packages/genshin-text/src/generated/GameTextLoaderMap.ts`)

### Requirement: A reader's preferences resolve to the nearest game language

A reader's language preferences SHALL resolve to the nearest game language by language and script, and to English when none matches (`packages/genshin-text/src/services/matchGameLanguage.ts`).

#### Scenario: Traditional Chinese readers get Traditional Chinese

- **GIVEN** a reader prefers a Traditional Chinese locale
- **WHEN** the language is matched
- **THEN** the game's Traditional Chinese is chosen (`packages/genshin-text/src/services/matchGameLanguage.ts`)

#### Scenario: Simplified Chinese readers get Simplified Chinese

- **GIVEN** a reader prefers a Simplified Chinese locale
- **WHEN** the language is matched
- **THEN** the game's Simplified Chinese is chosen (`packages/genshin-text/src/services/matchGameLanguage.ts`)

#### Scenario: Unmatched preferences get English

- **GIVEN** no game language matches any of a reader's preferences
- **WHEN** the language is matched
- **THEN** English is chosen (`packages/genshin-text/src/services/matchGameLanguage.ts`)

#### Scenario: Malformed locale tag is skipped

- **GIVEN** a reader's preferences include a malformed tag
- **WHEN** the language is matched
- **THEN** the malformed tag is skipped and the next preference is used (`packages/genshin-text/src/services/matchGameLanguage.ts`)

### Requirement: English is bundled and other languages load on first use

English SHALL be bundled with the package, and each other language SHALL load only when a reader first needs it (`packages/genshin-text/src/generated/GameTextLoaderMap.ts`).

#### Scenario: English reader loads no extra chunk

- **GIVEN** a reader's language is English
- **WHEN** the page loads
- **THEN** no other language's chunk is loaded (`packages/genshin-text/src/generated/GameTextLoaderMap.ts`)

#### Scenario: Other language loads on first use

- **GIVEN** a reader's language is not English
- **WHEN** the reader first sees a game string
- **THEN** that language's chunk is loaded (`packages/genshin-text/src/generated/GameTextLoaderMap.ts`)

### Requirement: Numbered interface values are filled in place

A numbered interface string SHALL show its values in place, with a number that has no value left as it is, and a value containing a replacement pattern SHALL be shown literally (`packages/genshin-text/src/services/fillGameTextValues.ts`).

#### Scenario: Values fill the numbered places

- **GIVEN** an interface string has numbered places and values for them
- **WHEN** the string is shown
- **THEN** each numbered place shows its value (`packages/genshin-text/src/services/fillGameTextValues.ts`)

#### Scenario: Number with no value is left in place

- **GIVEN** an interface string has a numbered place with no value
- **WHEN** the string is shown
- **THEN** that place is left as written (`packages/genshin-text/src/services/fillGameTextValues.ts`)

#### Scenario: Value with a replacement pattern is shown literally

- **GIVEN** a value contains a replacement pattern
- **WHEN** the string is shown
- **THEN** the pattern is shown as written and not read as a replacement (`packages/genshin-text/src/services/fillGameTextValues.ts`)

### Requirement: A game string's line breaks are real line breaks

The game writes a line break in its text as a backslash and an n. Every chunk the writer publishes or generates SHALL hold a real line break in its place (`scripts/src/services/genshinText/getPlainGameText.ts`, `~/Esposter.noindex/genshin-parity/text/TextMap/TextMapEN.json`), and a screen SHALL show the string's line breaks without splitting on the escaped form.

#### Scenario: A line break in an interface string is a real line break

- **GIVEN** a text map string holding a backslash and an n between two words
- **WHEN** the interface string is written
- **THEN** the chunk holds the two words with a real line break between them (`scripts/src/services/genshinText/getPlainGameText.ts`)

#### Scenario: A size tag is dropped with its words kept

- **GIVEN** a text map string holding a size tag around some words
- **WHEN** the interface string is written
- **THEN** the chunk holds the words without the tag (`scripts/src/services/genshinText/getInterfaceGameText.ts`)

### Requirement: Colour tags split a game string into coloured runs

A game string's colour tags SHALL split it into runs, each shown in the colour its tag gives, and every other markup SHALL be dropped (`packages/genshin-text/src/services/splitGameTextColors.ts`, `scripts/src/services/genshinText/getInterfaceGameText.ts`).

#### Scenario: Coloured text is split into runs

- **GIVEN** a game string has a colour tag around some words
- **WHEN** the string is shown
- **THEN** those words are shown in the tag's colour as their own run (`packages/genshin-text/src/services/splitGameTextColors.ts`)

#### Scenario: Other markup is dropped

- **GIVEN** a game string has markup other than a colour tag
- **WHEN** the string is shown
- **THEN** the markup is not shown (`scripts/src/services/genshinText/getInterfaceGameText.ts`)

### Requirement: Every opening screen requires the game text

Each screen of the opening that shows a word SHALL require the game text for its language, so a screen missing it fails to build rather than falling back to English (`packages/genshin-world/src/components/Login/Status/Index.vue`).

#### Scenario: Screen missing its game text fails the build

- **GIVEN** a screen of the opening shows a word but is not given the game text
- **WHEN** the app is built
- **THEN** the build fails (`packages/genshin-world/src/components/Login/Status/Index.vue`)

### Requirement: The opening reads in the reader's language from the first render

The opening SHALL resolve the reader's language on the server, so the page renders and hydrates in the language it shows (`apps/web/app/composables/genshin/useGameText.ts`).

#### Scenario: Reader's request language is used on first render

- **GIVEN** a reader's request prefers a game language
- **WHEN** the page is first rendered
- **THEN** the page renders in that language (`apps/web/app/composables/genshin/useGameText.ts`)

### Requirement: A per-gender word is filled once, for one twin

A word offered per gender SHALL be filled with one twin's form, which the persona fills from the twin it speaks as (`packages/genshin-text/src/services/fillLinePlaceholders.ts`).

#### Scenario: Gendered word shows one twin's form

- **GIVEN** a language spells the Traveler with a word per gender
- **WHEN** the line is filled
- **THEN** one twin's form is kept (`packages/genshin-text/src/services/fillLinePlaceholders.ts`)

### Requirement: The persona plugin carries its own copy of the game text

The persona plugin SHALL carry a generated copy of the game text modules it runs, which matches the source byte for byte, rather than depend on this package (`scripts/src/services/genshinText/getPersonaModuleSource.ts`).

#### Scenario: Generated copy matches the source

- **GIVEN** the generator has written the persona's copy
- **WHEN** the copy is compared to the source it is generated from
- **THEN** the copy matches the source byte for byte (`scripts/src/services/genshinText/getPersonaModuleSource.test.ts`)

### Requirement: The app's own interface is not translated

The app's own interface SHALL stay in English, and only the game's own words SHALL be translated through this package (see the open list).

#### Scenario: App's own labels stay in English

- **GIVEN** a reader's language is not English
- **WHEN** the app's own labels are shown
- **THEN** they remain in English (see the open list)

### Requirement: Non-Latin game text draws in a system face

Non-Latin game text SHALL be drawn in a system face, since the game's own faces do not cover it (`packages/genshin-interface/src/services/constants.ts`, `GAME_FONT_FAMILY`, see the open list).

#### Scenario: Chinese text is drawn in a system face

- **GIVEN** a reader's language is Chinese
- **WHEN** the game text is shown
- **THEN** the text is drawn in a system face (`packages/genshin-interface/src/services/constants.ts`)

## Open

- [ ] **The text maps are decoded from the installed client** — no source yet: the design says the text maps stay the community dump's until a decoder covers the current patch, so the Purpose's "decoded from the installed client" is not yet built.
- [ ] **The app's own labels stay English** — no source yet: the app was not searched for a locale switch in this pass.
- [ ] **HYWenHei and Signika do not cover Chinese, Japanese, Korean or Thai** — no source yet: neither font's glyph coverage was read in this pass.
