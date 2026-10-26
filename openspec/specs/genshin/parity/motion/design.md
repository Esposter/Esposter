# Parity motion

A recording is sampled to find its events, then each event is matched at its own rate.

- **Motion is matched frame by frame.** A recording is read as frames at the `frames` command's rate, ten a second by default, over the window its start and length name. Our screen's motion is held at its start on the parity page and shot at the same moments. `entry` holds the screen's own animations as it mounts. `props` lets those finish, then applies the fixture's `motionProps` and holds the transitions they start; a still and the visual suite show the fixture's first state. `luma` prints one region's darkness across both sets of frames as two curves, so a fade's duration and a wipe's steps are read off numbers rather than raced. Window capture takes whatever frames the window delivers, up to sixty a second; where it delivers fewer, a curve from it jitters by a frame or two (see Open), and a fit is judged over the whole curve. A scene's own motion runs on its frames' clock rather than on animations, so `film` fakes the page's clock and moves it a frame at a time, shooting the screen at exact moments however slowly the page draws. Props are set at moments to play its stages as a click or a load would, into stills and a contact sheet beside a recording sampled at the same rate. With `--witness` it films the exports in place of our parts.

## Key files

| File                                                           | Role                                                                            |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| `scripts/src/services/genshinParity/commands/framesCommand.ts` | Samples a recording's frames at ten a second by default, over a window          |
| `scripts/src/services/genshinParity/commands/filmCommand.ts`   | Films the parity page's screen at exact moments, two stills a second by default |
| `scripts/src/services/genshinParity/commands/lumaCommand.ts`   | Prints one region's darkness across both sets of frames as two curves           |
| `scripts/src/services/genshinParity/game/captureGame.ts`       | Captures the game's window at up to sixty frames a second                       |
| `packages/genshin-world/parity/main.ts`                        | The parity page's entry, its props and its hold of the screen's animations      |

## Open

- [ ] **Which step finds a recording's events** — no source yet: the parity commands sample a recording at ten frames a second (`frames`) or two (`film`) by default, and the step that finds the events from those frames was not traced.
- [ ] **When the window delivers a frame** — no source yet: `captureGame.ts` caps the capture at `RECORD_FRAME_RATE` (`max_framerate`) and does not say when frames are sent; the ffmpeg `gfxcapture` section (`ffmpeg.org/ffmpeg-filters.html#gfxcapture`) was not read, since the page is too long for the fetch to reach it.
- [ ] **a recording is sampled at the frames command's rate, ten a second by default** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **the page's entry holds the screen's own animations as it mounts** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **props let the animations finish, then apply the fixture's motion props** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **luma prints one region's darkness across both sets of frames as two curves** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **window capture takes up to sixty frames a second** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **film fakes the page's clock and moves it a frame at a time** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **`--witness` films the exports in place of our parts** — no source yet: game data or a snapshot that holds this behaviour
