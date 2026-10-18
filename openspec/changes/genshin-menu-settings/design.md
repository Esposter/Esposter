# Menu Settings screen

The [Paimon menu](../genshin-menu-paimon/design.md) opens a Settings screen from its side bar. Its tabs and the Graphics and Audio tabs' rows are drawn, laid out from a public recording and scored over the whole frame ([Paimon menu](../../specs/genshin/paimon-menu/design.md)), and the world does not yet open the screen. This proposal makes its rows work. It builds on the [screens](../../specs/genshin/screens/design.md) shell, on the [renderer's quality tiers](../../specs/genshin/rendering-style/design.md), on [game text](../../specs/genshin/game-text/design.md) for the language row, and on the [follow camera](../../specs/genshin/follow-camera/design.md), whose sensitivities and default distance this screen's Controls tab would show.

## Decisions

- **Settings shows only the rows the world has.** Each row the world backs is laid out with the game's name, range and default. Graphics Quality is the renderer's quality tier. Volume, Music Volume and SFX Volume run from 1 to 10 over the music's player and the sound effects. Game Language offers the fifteen languages of [game text](../../specs/genshin/game-text/design.md). The camera sensitivities and default distance belong to the follow camera. Settings are kept in the browser, as the game keeps its settings per device. A row the world does not back is drawn disabled with the value the recording shows, as the Paimon menu draws an entry whose screen is not built, so the screen says what the game has.
- **Volumes are linear shares of the overall Volume, provisional.** The wiki gives each volume's range, 1 to 10, but not the curve between its levels. A channel plays at its level's share of the highest, times the overall Volume's share, in a straight line. Provisional until a recording measures the curve. `getChannelGain` owns it.
- **A tier chosen now renders from the world's next start, provisional.** The renderer, Windrise and the grass read the tier at setup, so the world keeps the tier it started with while the Graphics Quality row shows the one chosen. The wiki does not say when the game applies a change; the recreation takes it at the start of a world.
- **The settings are one JSON object under one browser key.** `genshin-settings` holds the language, the quality tier and the three volumes. A read keeps each stored field its schema accepts and takes the rest from the defaults, so a damaged or outdated value reads as the default for its field alone.
- **A chosen game language changes the Settings screen's labels only, provisional.** Its words load when the language is chosen, and the world keeps the reader's language. The wiki gives the fifteen languages and not which text each one changes; the recreation reads the choice as the screen's own.
- **Music and sound effects take their gains as they start.** The login's music and door sound, and the Oculus chime, read the stored gains when they start. The Settings screen is open only inside the world, so a change reaches the next sound that starts.

## How it works

```mermaid
flowchart TD
  MENU["The Paimon menu's side bar: Settings"] --> SCREEN["The Settings screen: Graphics, Audio, the rows the world backs"]
  SCREEN -->|"a row's value"| STORE["The browser's storage, per device"]
  STORE --> KNOBS["Quality tier, volumes, language, camera"]
```

## Scope and order

1. **Settings' rows**: the Graphics Quality row's choices and the store its value is kept in, the Audio tab's volumes over the music's player and the sound effects, and the Language tab's game language.
2. **The Controls tab's defaults**, once the interface export holds the Settings screen itself: [follow camera](../genshin-follow-camera/design.md) owns the values.

## Key files

| File                                                                   | Role after the change                                                                            |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Menu/Settings/Index.vue`        | The tabs and the Graphics, Audio and Language tabs' rows, opened from the Paimon menu's side bar |
| `packages/genshin-world/src/services/menu/readGenshinSettings.ts`      | Reads the stored settings over the defaults, one field at a time                                 |
| `packages/genshin-world/src/services/menu/getChannelGain.ts`           | The gain a channel plays at, from the stored volumes                                             |
| `packages/genshin-world/src/components/World/Session/Index.vue`        | Keeps the settings on this device and gives the Settings screen its slot                         |
| `packages/genshin-world/src/components/Login/Music/Index.vue`          | The login's music and door sound, through the stored gains                                       |
| `packages/genshin-world/src/services/statue/playOculusSound.ts`        | The Oculus chime, through the stored sound-effect gain                                           |
| `packages/genshin-engine/src/renderer/QualityTierSettingsMap.ts`       | The tiers the Graphics Quality row chooses between                                               |
| `packages/genshin-text/src/models/GameTextKey.ts`                      | Gains every label of Settings                                                                    |
| `packages/genshin-world/src/components/Menu/Settings/Index.fixture.ts` | The fixture the screen is shot with, already in the tree                                         |

## Sources

- [Settings](https://genshin-impact.fandom.com/wiki/Settings), Genshin Impact Wiki: the graphics quality, the volumes from 1 to 10, the fifteen game languages and the camera's rows, and settings kept per device.
