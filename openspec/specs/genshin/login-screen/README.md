# Login screen

The game opens on its login screen once the health notice has faded. The console's opening shows it at the same place, in the same stages and at the game's own timings.

The screen is one scene and one interface laid over it. This page holds what the stages share and how the scene is fitted and judged; each feature has its own page:

| Page                                           | What it holds                                                                                                |
| :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| [Interface](interface/design.md)               | The stage's corner buttons and prompt, the page's clips, the mainland age rating                             |
| [Camera and glide](camera-and-glide/design.md) | The camera's pose, the glide's pace and its rest at the door, the rows that wrap as it goes                  |
| [Towers](towers/design.md)                     | The towers and their surfaces, the columns and recesses standing out of their walls, the bridges and pillars |
| [Walkway](walkway/design.md)                   | The walkway's paint, its carving as relief, and its pieces assembling ahead of the glide                     |
| [Door](door/design.md)                         | The door's place and rise, its front and its relief, its lighting, and the click that opens it               |
| [Clouds](clouds/design.md)                     | The cloud bands, their cover each hour, and the cloud layer the sky draws                                    |
| [Sky](sky/design.md)                           | Each hour's sky, the colour pipeline its colours are measured through, and the sun and the moon              |
| [Light](light/design.md)                       | The stone's lighting, its haze, the occlusion and the shadows                                                |

## How it plays

```mermaid
flowchart LR
  N[Health notice's white] --> A[Arriving: the page fades in out of the white curtain, the wait mark from 1.3 to 2 s]
  A --> T[Title: START GAME fading in, the server and the account]
  T -->|a click| P[Preparing: the status steps, then the load's share and bar, the glide quickening]
  P -->|"flight flown and loading done"| D[Door: the glide comes to rest; once the door has formed, the four corner buttons, then CLICK TO BEGIN]
  D -->|a click| E[Entering: the door lights, the camera rushes to it, the page fades into white]
  E --> S[Startup loading screen]
```

- **The stages are the game's current build's.** The user's own recording of the Japanese client times them and shows which corner buttons each stage has. A 1080 high English recording of an older build gives the words and every size. The status reads "Preparing to download resources", "Checking for updates...", "Loading game..." over the ornament's double diamond, then "Preparing to load data" over the progress bar, which folds into its diamond at 100%.
- **The flight is the screen's clock for the door, and the door comes once the game's checks are done.** The flight is the share of the way to the door flown. The bar under it is the game's own checks before it loads the world. On the page those checks have nothing left to wait on, so the opening hands the screen a finished load: the shown share sweeps toward it at no more than one full bar per tenth of a second, the flight covers about two thirds of the way as the English recording's does before its bar is full, no faster than that recording's last stretch, and once the bar is full the flight flies whatever is left in the half second the bar takes to fold into its diamond. The glide then carries the door's copy to the walkway's far end, so the door rises on average about 3 seconds after the bar fills, as the recording's does. The world loads after the door, under the startup loading screen.
- **A click is the screen's unless it lands on a button.** The screen asks `checkIsNestedInteraction` before it moves on, so a click on a corner button stays the button's.
- **A host can pin a stage.** The stage is a `v-model`, so the parity page and a test hold one still; the opening leaves it free.
- **Its music plays from the start, looping as the game's does.** `LoginMusic` plays the game's login playlist, re-derived, while the screen shows, once the browser allows sound ([music](../music/README.md)). The scene alone, as a reference shows it with no interface, is silent.
- **The screen draws from the records the opening reads.** The fits publish every part of the login (its interface's rects and clips, its music and sounds, the scene's parts) as records of the hosted game data's `login` dataset, beside its authored age rating. `GameOpening` reads all of them while its splashes play (`readLoginData`), holding the splashes' white if they have not arrived by the time the last splash has faded ([hosted game data](../hosted-game-data/design.md)). The screen takes them as one `loginData` prop and hands each part only the records it draws.
- **The opening says when the door is opened.** `GameOpening` emits `begin` as the screen hands on to the startup loading screen, so its host can mount the world then, under the startup loading screen, rather than waiting for the world to load first.
- **A stalled loading screen says what it waits on.** While the startup loading screen shows, a step still unfinished `LOADING_STALL_WARNING_SECONDS` (twenty) after the page started is logged once with `console.warn`, by name: `save`, `world chunk` or `world ready`. It is a diagnostic only; nothing is skipped or fallen back to when it fires.
- **The words are the reader's language's.** The title, the account label, the status lines, the door's prompt and the name a player who has not chosen one goes by are the game's own text in the language the host resolved, handed down as the `gameText` prop ([game text](../game-text/design.md)). The account kit's welcome card is not shown until the page has an account to welcome; its greeting is the kit's own in every language, with the name where each language puts it.

## The scene

Every part's shape, place and stone is fitted from the game's own assets ([derived assets](../derived-assets/design.md)), and whatever the blocks cannot hold is read off the captures and expressed over what they can. Each builder takes the record it builds from as its first argument. What a record sets (where the door stands, how long it takes to rise, the camera's height and rest, the rows the glide wraps by) is read or computed from the record where it is used (`getLoginDoorPosition`, `computeLoginDoorLiftMs`, `computeLoginCameraHeight`, `computeLoginCameraZ`, `computeLoginGlideTitleScrolled`), so no fitted value is a constant of the package's.

```mermaid
flowchart TD
  DATA["Every fitted part, a record of the hosted game data's login dataset"] --> READ["GameOpening reads them during the splashes"]
  READ --> SCENE[Login/Scene builds them with the engine's kits]
  REF[Each hour's title frame, the door captures, the flight's frames] --> CAM["Camera: solved on the witness, one pose; the glide's pace by the walkway's repeats"]
  REF --> BANDS[Each cloud band's heights and spread]
  REF --> LIGHT["Each time of day's colours, and its lights' strengths over the fitted stone"]
  CAM --> SCENE
  BANDS --> SCENE
  LIGHT --> SCENE
  SCENE --> SCORE{compare: shape and tone per time of day}
```

- **The login is one arrangement of the scene's meshes.** The blocks lay the towers out more than once; the login screen is its own `LoginScene`, whose towers, walkway and door `MonoLoginScene` spawns into the anchors under `SceneObj`, at its tenth, which is the scene's unit ([derived assets](../derived-assets/design.md)). In the static layout the door's anchor stands far from the walkway; at the flight's end the door stands on the walkway's far end, centred and on its top. The arrangement's unit test holds the cross-ratio of the dais over the walkway along the door's foot, which no camera changes.
- **The references are the judges.** The hour frames are public recordings of the PC client idling on the title with no interface, each held at the loop moment its towers stand at (the screen's `heldScrolled`), and the dusk frame is the door recording. The wiki's four stills fit no single camera centred on them (their near wings, far wings and towers each ask a different field of view or pitch), so they are a crop or another build's camera and judge nothing. The 2021 recordings stand the walkway's far end about 30 rows lower than the current build's, so they are another camera too.
- **Colour and light are measured on the screen, not in the scene.** Each hour's sky, haze and light are solved over the exports and inverted through the game's tone curve, as [sky](sky/design.md) and [light](light/design.md) set out. Each hour's solve is judged by the pixel comparison and by eye: a score comparing pixels prices every cloud standing elsewhere than the recording's, so cloud cover is judged by eye and by the cover it draws ([parity](../parity/README.md)).

## Tests

- `packages/genshin-world/src/components/Game/Opening/Index.browser.test.ts` plays the whole opening with timers and frames faked, through the login's title, flight and door, and checks every handoff and the finish, its records read through the suites' mirror. With every fetch held, it checks the opening holds the splashes' white rather than a title splash with no logo.
- Each fit that builds the data has its own test in `scripts/src/services/genshinAssets`.

## Key files

| File                                                                   | Role                                                                      |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `packages/genshin-world/src/components/Login/Screen/Index.vue`         | The stages and the flight                                                 |
| `packages/genshin-world/src/components/Login/Scene/Index.vue`          | The scene: the camera, the glide, the fitted parts, the clouds, the sky   |
| `packages/genshin-world/src/components/Login/Music/Index.vue`          | The login's music, played while the screen shows                          |
| `packages/genshin-world/src/components/Game/Opening/Index.vue`         | Reads the login records during the splashes and emits `begin`             |
| `packages/genshin-world/src/services/login/constants.ts`               | The words and the timings                                                 |
| `packages/genshin-world/src/services/login/scene/constants.ts`         | The camera's eye and rest, the glide, the haze, the light and the shadows |
| `packages/genshin-world/src/services/login/readLoginData.ts`           | Every fitted part, read from the hosted game data                         |
| `packages/genshin-world/src/components/Login/Scene/Light.reference.ts` | The reference the scene's light is judged against                         |

## Reference

- `login-dawn.mkv` to `login-night.mkv` — the title at each hour on the current build, the camera at rest. `login-dawn.mkv` partly found 2026-10-11: https://www.youtube.com/watch?v=D-iWDjSOL-s at 0–30 s (`captures/yt-D-iWDjSOL-s-login-dawn.mp4`); still sought: no title text visible in the window; the build and client are not stated on the video; the source is 720p30; `login-day.mkv` partly found 2026-10-11: https://www.youtube.com/watch?v=TVYVfIQ-XO4 at 0–30 s (`captures/yt-TVYVfIQ-XO4-login-day.mp4`); still sought: the camera is not at rest, so the title at rest is not shown; the client and build are not stated; `login-dusk.mkv` partly found 2026-10-11: https://www.youtube.com/watch?v=mMf727q-0w0 at 0–30 s (`captures/yt-mMf727q-0w0-login-dusk.mp4`); still sought: the camera is not at rest; the title at rest is not shown; `login-night.mkv` found 2026-10-11: the wiki's `File:Moon - Title screen - Night.png`.
- `login-door-rest.mkv` — the door at rest on the current build. Partly found 2026-10-11: https://www.youtube.com/watch?v=D-iWDjSOL-s at 0–30 s (`captures/yt-D-iWDjSOL-s-login-dawn.mp4`); still sought: the build is not stated and the source is 720p30.
