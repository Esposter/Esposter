## Purpose

The login page drawn over the scene, as built: the title and its account label, the status row and progress bar, the door's prompt and the four corner buttons, each shown in the stage the login screen is in.

## Requirements

### Requirement: Buttons shown per stage

The title SHALL show its notices and exit buttons, and the door SHALL show its settings, repair, notices and exit buttons (`packages/genshin-world/src/components/Login/Interface/Index.vue`).

#### Scenario: Title stage

- **WHEN** the title stage is shown
- **THEN** the notices and exit buttons are shown (`packages/genshin-world/src/components/Login/Interface/Index.vue`)

#### Scenario: Door stage

- **WHEN** the door has formed
- **THEN** the settings, repair, notices and exit buttons are shown (`packages/genshin-world/src/components/Login/Interface/Index.vue`)

### Requirement: Page clips play as each stage begins

The login page SHALL play its fitted animation clips as each stage begins, the white curtain and fade in on arriving, the title's fade in and fade out on the click, and the fade into white on entering (`packages/genshin-world/src/services/login/interface/createLoginInterfaceClipMap.ts`, `packages/genshin-world/src/components/Login/Interface/Index.vue`).

#### Scenario: Arriving at a stage

- **WHEN** a stage begins
- **THEN** the white curtain lifts and the page fades in (`packages/genshin-world/src/components/Login/Interface/Index.vue`)

#### Scenario: Title click

- **WHEN** the player clicks the title
- **THEN** the title fades out (`packages/genshin-world/src/components/Login/Interface/Index.vue`)

### Requirement: Scene fades use the interface's own white

The white the scene fades up out of and into SHALL be drawn by the interface's own pieces (`packages/genshin-world/src/models/login/LoginInterfaceClipTarget.ts`).

#### Scenario: Scene fades to white

- **WHEN** the scene fades to white on entering
- **THEN** the white is the interface's, not the scene's (`packages/genshin-world/src/models/login/LoginInterfaceClipTarget.ts`)

### Requirement: Mainland client age rating

A Simplified Chinese reader SHALL see the CADPA age rating of 12 and over in the top right corner at every stage, with the build string under the CNREL prefix (`packages/genshin-world/src/components/Login/Interface/Index.vue`, `packages/genshin-world/src/services/login/GameClientVersionTextMap.ts`).

#### Scenario: Mainland reader opens the login

- **WHEN** a Simplified Chinese reader opens the login screen
- **THEN** the CADPA rating of 12 and over shows in the top right corner at every stage (`packages/genshin-world/src/components/Login/Interface/Index.vue`)
