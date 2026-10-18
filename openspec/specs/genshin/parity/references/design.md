# Parity references

A reference is a wiki image or one frame of a recording, judged against and kept outside the repository. This page covers how references are found and captured.

- **References stay outside the repository.** They are HoYoverse's images, so they are fetched and recorded into `~/Esposter/genshin-parity` and never committed. The repository holds only what each screen is judged against (`ParityReferenceMap`): a wiki file, or one frame of a recording, named by the recording and the second it is taken at.

- **Search before recording.** Most of what a screen needs is already published: the wiki holds the game's screens and its standalone marks, the community's data dumps hold its in-game text, and public videos show the rest, including the English client when the recording is in another language. A clip from one is fetched into the captures folder with `recreation clip --directory ~/Esposter/genshin-parity/captures`, and sampled like any recording. Nothing waits on a recording of the installed game: a still look is read off a wiki screenshot first, motion off a public clip on YouTube or Bilibili (`recreation search` lists them), a timing off the extracted animation clips, and what none of them shows ships as a best estimate marked provisional, with an estimate the agent is unsure of put on the roadmap's Manual verification list for the user to check in one batch (2026-10-11).

- **The installed game is recorded, never driven.** The user starts the game and plays while the tool records. It sends the game no input, since the game's terms count injected input as botting.

- **Only the game's window is recorded.** Capture goes through Windows Graphics Capture, found by the game's executable. Nothing else reaches the file: no window above it, no desktop or webcam behind it, no cursor, and no overlay that is its own window. A recording of the screen's rectangle was tried first and took whatever was on screen whenever the user switched away. `record` waits for the window to open, so a recording can be armed before the game starts and take it from its first frame. It encodes on the GPU at 60 frames a second, near-lossless, into Matroska, which stays readable if the recording is cut short. A minimised game gives no frames, so a recording also ends by the clock, at its length in real time, rather than waiting for frames that are not coming.

- **FFmpeg is pinned, not installed.** Window capture arrived in FFmpeg 8, which no npm package bundles. The tool fetches one versioned release the first time it needs FFmpeg, refuses it unless its SHA-256 matches the pinned one, and unpacks it into the shared tool cache under `~/Esposter/cache`, so no install or CI run ever pays for it. Off Windows the FFmpeg on the PATH stands in, since the pinned build is a Windows executable.

- **Read before searching.** A component's `Index.reference.ts`, the topic files beside it, and the [game data formats](../../game-data-formats/design.md) page's shortcuts come first; a search whose answer is recorded is not run again.

## Key files

| File                                                              | Role                                                                         |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` | Each reference, the wiki file it comes from and its screen                   |
| `scripts/src/services/genshinParity/reference/hashFile.ts`        | A file's SHA-256, streamed, its first digits as the reference cache names it |

## Sources

- [Photo Mode](https://genshin-impact.fandom.com/wiki/Photo_Mode), Genshin Impact Wiki: capturing the game without its interface, for the world's references.
