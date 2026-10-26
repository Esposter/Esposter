## Purpose

The opening's second splash, the game's title logo in flat grey on white, drawn as each reader's language's client draws it — 原神 for Chinese and Japanese, 원신 for Korean, and the English logo for every other language — every logo on the one canvas the game's own sprites share.

## Requirements

### Requirement: Title logo drawn for the reader's language

The title splash SHALL show the title logo the game's client shows in the reader's language (`packages/genshin-world/src/services/splash/GameLanguageTitleLogoMap.ts`).

#### Scenario: Simplified Chinese reader

- **GIVEN** the reader's language is Simplified Chinese
- **WHEN** the title splash is shown
- **THEN** the logo is 原神 alone (`~/Esposter.noindex/genshin-parity/extracted/login/titleLogos/Logo_CHS_Pure.png`)

#### Scenario: Traditional Chinese and Japanese readers

- **GIVEN** the reader's language is Traditional Chinese or Japanese
- **WHEN** the title splash is shown
- **THEN** the logo is 原神 with the Latin line "Genshin" or "Genshin Impact" beneath it (`~/Esposter.noindex/genshin-parity/extracted/login/titleLogos/Logo_CHT_Pure.png`, `Logo_JPN_Pure.png`)

#### Scenario: Korean reader

- **GIVEN** the reader's language is Korean
- **WHEN** the title splash is shown
- **THEN** the logo is 원신 with the Latin line "Genshin Impact" beneath it (`~/Esposter.noindex/genshin-parity/extracted/login/titleLogos/Logo_KOR_Pure.png`)

#### Scenario: Any other language

- **GIVEN** the reader's language is any other language
- **WHEN** the title splash is shown
- **THEN** the logo is the English "GENSHIN IMPACT" (`~/Esposter.noindex/genshin-parity/extracted/login/titleLogos/Logo_ENG_Pure.png`)

### Requirement: Mainland China's splash carries its publishing licence

The mainland China build's title splash SHALL print four lines of its publishing licence beneath the logo, fading in behind it.

#### Scenario: Licence under the logo

- **GIVEN** the reader plays the mainland China build
- **WHEN** the title splash is shown under its logo
- **THEN** four lines of the publishing licence print over the foot of the screen (`~/Esposter.noindex/genshin-parity/references/title-splash-mainland.png`)
- **AND** they fade in behind the logo

#### Scenario: Health notice follows at once

- **GIVEN** the mainland China build's title splash has held and faded
- **WHEN** its licence has finished
- **THEN** the health notice follows at once (`~/Esposter.noindex/genshin-parity/captures/bili-av532052219.mp4`)

### Requirement: Opening holds the white until the logo arrives

The opening SHALL hold its white backdrop until the reader's logo has arrived, so that the first splash never shows a title with no logo (`packages/genshin-world/src/components/Game/Opening/Index.vue:53`).

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
- **THEN** each is the game's near-white rather than full white (`packages/genshin-interface/src/services/constants.ts:37`; `~/Esposter.noindex/genshin-parity/references/title-splash.png`, background 253)

### Requirement: All logos share one canvas

Every title logo SHALL stand on the one canvas the game's sprites share, placed so the English logo's ink lands where the English client's does.

#### Scenario: English logo placed on the canvas

- **GIVEN** the English logo is shown
- **WHEN** it is placed on the shared canvas
- **THEN** its ink lands where the English client's ink lands (`scripts/src/services/genshinParity/shared/ParityReferenceMap.snapshot.md`, the `title-splash` row at FLIP 0.0090)

#### Scenario: Other logos placed by their own client

- **GIVEN** a Chinese, Japanese or Korean logo is shown
- **WHEN** it is placed on the shared canvas
- **THEN** it stands where its own client's logo stands

### Requirement: Splash named by the game's window title

The title splash SHALL be named to a screen reader by the game's own window title in the reader's language.

#### Scenario: Screen reader names the splash

- **GIVEN** a screen reader is reading the title splash
- **WHEN** the splash is announced
- **THEN** it is named by the game's window title in the reader's language (`packages/genshin-world/src/components/Splash/Title/Index.vue`, `GameTextKey.GameTitle` in `packages/genshin-text/src/models/GameTextKey.ts`)

## Open

- [ ] **The licence's lines fade in behind the logo** — no source yet: the fade was not measured on `~/Esposter.noindex/genshin-parity/captures/bili-av532052219.mp4`.
- [ ] **The white backdrop is held until the reader's logo arrives** — no source yet: `packages/genshin-world/src/components/Game/Opening/Index.browser.test.ts` exists but was not opened for the hold.
- [ ] **The Traditional Chinese, Japanese and Korean logos stand where their own clients' do** — no source yet: the parity snapshot measures only the English and the Simplified Chinese mainland splashes.
- [ ] **The title splash shows the logo the game's login interface picks for the reader's language** — no source yet: the login interface's language-to-logo choice is not in the extracted login data (the mapping is the repository's own, `GameLanguageTitleLogoMap.ts`).
