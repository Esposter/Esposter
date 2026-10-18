# Localized opening

The opening already speaks the reader's language: its words come from [game text](../../specs/genshin/game-text/design.md) in all fifteen languages, and its [title splash](../../specs/genshin/title-splash/design.md) draws each language's client's logo. Its other pictures and its layouts do not: the screens are measured off recordings of the English client and one Japanese one, and the Chinese, Japanese and Korean clients may sit their words differently and show their own publisher's logo.

## How it would work

```mermaid
flowchart LR
  Videos["Recordings of each client's opening<br/>Chinese, Japanese, Korean"] --> Frames["genshin:parity frames<br/>splashes, title, door"]
  Frames --> Measure["measure what differs:<br/>the publisher's logo, the text's sizes and wraps"]
  Measure --> Screens["Each screen's layout keyed by language<br/>where it differs, one layout where it does not"]
  Screens --> Visual["A visual suite image per language that differs"]
```

- **Recordings are the references.** A public recording of each client's opening, found before any of the game is recorded by hand, gives the logo, its place and how the screens differ, the way the English and Japanese recordings already do ([parity](../../specs/genshin/parity/README.md)).
- **A layout differs only where a recording shows it.** Every language reuses the English measures unless its own recording differs, and the visual suite gains an image only for a language that does.
- **The opening already knows the language.** It takes the reader's language for the title splash, so a screen whose layout differs reads the same prop.
- **A localized reference is compared in its client's words.** A reference naming a `language` in its props has the parity page load that language's text for the screen ([parity](../../specs/genshin/parity/README.md)). The mainland's health notice, 7 to 12 seconds into its launch recording (`captures/bili-av532052219.mp4`, its logo at 3 to 6 seconds and its door at 12 to 17), is the reference `health-notice-mainland`, already compared in its own words (its row in the parity reference snapshot).

## Scope

- **Not in any public clip.** Searches for each client's PC launch found none: the Japanese clip shows the PC client's title only as its iPhone capture, and no Japanese PC splash or door. The Korean clip (`yt-HFxhJB_N4Nk-opening-korean.mp4`, 720 high) is the account login form for all 105 seconds. A 2020 Korean PC gameplay video (`yt-4zVvDgStMWQ`, 1080 high) opens on a title card and cuts to the world, with no splash, notice or door. So `title-splash-japanese`, `publisher-splash-japanese`, the Korean launch's stages and both clients' door stages wait on `japanese-launch.mkv` and `korean-launch.mkv` in the roadmap's References sought list.

- The publisher splash where a client shows a different publisher's logo.
- The health notice and login screen's layout where a recording shows a difference.
- The Japanese and Korean layouts, keyed by language only on a screen whose compare above reads a mean further off than the English reference's own row in the parity reference snapshot.

## Key files

| File                                                               | Role after the change                            |
| :----------------------------------------------------------------- | :----------------------------------------------- |
| `packages/genshin-world/src/components/Splash/Publisher/Index.vue` | The publisher's logo per client where it differs |
| `packages/genshin-world/parity/screens.visual.ts`                  | An image per language whose screen differs       |

## Reference

- `japanese-launch.mkv` — the Japanese PC client launched from its launcher with the game's language set to Japanese, from the first frame of the client's window: its publisher splash, its title splash, its health notice and the door stage with its prompt in view, 30 seconds at most (the health notice is about 7 to 12 seconds in and the door about 12 to 17 in the mainland's launch, so the clip must start at the launch). The Japanese client's publisher and title splashes, and its door, are read from it, since no published PC clip shows them ([localized opening](design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `korean-launch.mkv` — the Korean PC client launched from its launcher with the game's language set to Korean, from the first frame of the client's window: its publisher splash, its title splash, its health notice and the door stage with its prompt in view, 30 seconds at most (starting at the launch, as for `japanese-launch.mkv`). The Korean launch's splash, notice and door are read from it, since the published Korean PC gameplay clip has no splash, notice or door ([localized opening](design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `opening-korean.mkv` — launch to the title, the client's language set to Korean. On the wiki and YouTube, none found (searched 2026-10-11).

## Sources

- `opening-japanese.mkv` — launch to the title, the client's language set to Japanese. Found 2026-10-11 as `captures/yt-57d2PwbOdr0-opening-japanese.mp4` (https://www.youtube.com/watch?v=57d2PwbOdr0), read by the [Japanese health notice](../../specs/genshin/compute/login/design.md) item.
