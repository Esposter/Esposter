# Parity motion

A recording is sampled to find its events, then each event is matched at its own rate.

- **Motion is matched frame by frame.** A recording is read as frames at the `frames` command's rate, ten a second by default, over the window its start and length name (`scripts/src/services/genshinParity/commands/framesCommand.ts`). Our screen's motion is held at its start on the parity page and shot at the same moments. `entry` holds the screen's own animations as it mounts (`packages/genshin-world/parity/main.ts`). `props` lets those finish, then applies the fixture's `motionProps` and holds the transitions they start (`packages/genshin-world/parity/main.ts`); a still and the visual suite show the fixture's first state. `luma` prints one region's darkness across both sets of frames as two curves (`scripts/src/services/genshinParity/commands/lumaCommand.ts`), so a fade's duration and a wipe's steps are read off numbers rather than raced. Window capture takes whatever frames the window delivers, up to sixty a second (`scripts/src/services/genshinParity/game/captureGame.ts`); where it delivers fewer, a curve from it jitters by a frame or two (see Open), and a fit is judged over the whole curve. A scene's own motion runs on its frames' clock rather than on animations, so `film` fakes the page's clock and moves it a frame at a time, shooting the screen at exact moments however slowly the page draws (`scripts/src/services/genshinParity/commands/filmCommand.ts`). Props are set at moments to play its stages as a click or a load would, into stills and a contact sheet beside a recording sampled at the same rate. With `--witness` it films the exports in place of our parts (`scripts/src/services/genshinParity/commands/filmCommand.ts`).

## Key files

| File                                                           | Role                                                                            |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `scripts/src/services/genshinParity/commands/framesCommand.ts` | Samples a recording's frames at ten a second by default, over a window          |
| `scripts/src/services/genshinParity/commands/filmCommand.ts`   | Films the parity page's screen at exact moments, two stills a second by default |
| `scripts/src/services/genshinParity/commands/lumaCommand.ts`   | Prints one region's darkness across both sets of frames as two curves           |
| `scripts/src/services/genshinParity/game/captureGame.ts`       | Captures the game's window at up to sixty frames a second                       |
| `packages/genshin-world/parity/main.ts`                        | The parity page's entry, its props and its hold of the screen's animations      |

## Open

- [ ] **A recording's events are found by sampling it at ten frames a second** — no source yet: the frames command samples at ten a second by default (`scripts/src/services/genshinParity/commands/framesCommand.ts`), but the step that picks events from those frames was not found in `scripts/src/services/genshinParity`.
- [ ] **Window capture takes a frame only when the window changes** — no source yet: `scripts/src/services/genshinParity/game/captureGame.ts` was not traced for frame skipping.
- [ ] **When the window delivers a frame** — no source yet: the ffmpeg gfxcapture section (`~/Esposter/cache/ffmpeg/ffmpeg-9.0.2-essentials_build/doc/ffmpeg-filters.html`) gives the rate but not when a frame is sent, and `scripts/src/services/genshinParity/game/captureGame.ts` is repo code, not a source for the timing.
