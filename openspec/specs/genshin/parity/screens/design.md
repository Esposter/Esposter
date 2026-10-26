# Parity screens

A screen to be matched is a presentational component in the world package, with the fixture that puts it on the parity page.

- **A screen is a component folder with a fixture, in its section.** Every screen is a presentational component in the world package, laid out as Nuxt lays out the app's: `components/<Section>/<Name>/Index.vue`, named by its path (`Login/Screen` is `LoginScreen`), with its `Index.fixture.ts`, its browser tests and its approved images beside it (`packages/genshin-world/src/components/Login/Screen/Index.fixture.ts`). The sections follow the game (`Game`, `Splash`, `Loading`, `Login`, `World`) (`packages/genshin-world/src/components/`), and `Game/Opening` shows the game's first screens in turn and owns every handoff between them. Having a fixture is what puts a screen on the parity page and in the visual suite, named as the package's own barrel exports it, so there is no list to keep (`packages/genshin-world/parity/screens.ts`). A fixture's `variants` are further states it is approved in, such as each stage of the login's interface (`packages/genshin-world/parity/models/ScreenFixture.ts`). A fixture marked `isMotionOnly`, such as a 3D scene whose anti-aliasing jitters every frame, is shot on the page but kept out of the suite (`packages/genshin-world/parity/models/ScreenFixture.ts`, `packages/genshin-world/parity/screens.visual.ts`). A screen draws inside `genshin-interface`'s `GameScreen`, whose `--unit` scales the game's 1920 by 1080 screen by the window's smaller axis, as the game scales its interface; scaling by height alone was tried first, and a window narrower than 16:9 set text sized for the height in a box sized for the width (see Open). A screen also draws no heading element, since a host page's heading styles (the console's gold, its inherited font) reach into it; a heading is a paragraph with `role="heading"` (`packages/genshin-interface/src/components/WishScreen/Index.vue`). The pieces screens share are [`genshin-interface`](../../interface-library/design.md)'s, held by a suite of their own.

## Key files

| File                                                              | Role                                                                                                                       |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/parity/models/ScreenFixture.ts`           | What a screen's fixture holds: its props and states, and a scene's claims on the exports, each component's own by its name |
| `packages/genshin-world/parity/screens.ts`                        | Every screen with a fixture, for the page and the suite                                                                    |
| `packages/genshin-world/src/components/Loading/Startup/Index.vue` | The game's startup screen: the seven marks, wiped in as loading goes                                                       |
| `packages/genshin-world/src/components/Splash/Sequence/Index.vue` | The game's splashes: its logos and health notice, timed from a recording                                                   |
| `packages/genshin-world/src/components/Game/Opening/Index.vue`    | The game's opening: the splashes, the login screen, then the startup screen, handed on by their own timings                |

## Open

- [ ] **Scaling by height alone was tried first** — no source yet: no commit, snapshot or note records that trial.
- [ ] **A window narrower than 16:9 keeps its text inside its boxes** — no source yet: no test or screenshot of a narrow window is cited for the `--unit` scaling.
- [ ] **The opening shows the game's first screens in turn and hands each on by its own timing** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **The screen scales the game's 1920 by 1080 by the window's smaller axis, as the game scales its interface** — no source yet: game data or a snapshot that holds this behaviour
