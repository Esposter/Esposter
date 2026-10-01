---
title: Parity
description: How a screen is made to match the game's. The references are the wiki's images and recordings of the installed game, kept outside the repository. A glyph is traced from the game's own mark at full resolution. A screen renders without Nuxt on the world package's parity page, where one command shoots it at the reference's size and scores the difference cell by cell. Motion is matched frame by frame against sampled recordings. Every approved screen is held by a visual suite whose images live beside the components.
---

# Parity

The Genshin area recreates the game's own screens, so "does it look right" has an exact answer: the game. Parity is the loop that asks it. It is built for an agent, which reads images but drives no browser of its own: every step is one command that prints numbers and writes an image the agent reads. The user's eye stays the final check. The loop is fast enough that nobody has to wait on that check.

## How it works

```mermaid
flowchart TD
  WIKI[Wiki images and animations] --> FETCH[fetch / frames]
  GAME[The installed game: the user plays, the tool records] --> CAP[still / record]
  CAP --> FRAMES[frames: fixed-rate stills and a contact sheet]
  FETCH --> REF[(References, outside the repository)]
  FRAMES --> REF
  REF --> TRACE[trace: a mark as one SVG path, full resolution]
  TRACE --> SCREEN[Screen component and its fixture, in the world package]
  REF --> MEASURE[measure / zoom: colours, sizes, positions]
  MEASURE --> SCREEN
  SCREEN --> PAGE[Parity page on Vite, no Nuxt]
  PAGE --> COMPARE{compare: reference, ours, difference, and a score per cell}
  REF --> COMPARE
  COMPARE -->|off| SCREEN
  COMPARE -->|matches| VISUAL[Visual suite: our own image, committed beside the component]
```

- **References stay outside the repository.** They are HoYoverse's images, so they are fetched and recorded into `~/Esposter/genshin-parity` and never committed. The repository holds only what each screen is judged against (`ParityReferenceMap`): a wiki file, or one frame of a recording, named by the recording and the second it is taken at.
- **Search before recording.** Most of what a screen needs is already published: the wiki holds the game's screens and its standalone marks, the community's data dumps hold its in-game text, and public videos show the rest, including the English client when the recording is in another language. A clip from one is fetched into the captures folder with yt-dlp from a throwaway virtual environment, and sampled like any recording. A recording of the installed game is for what nothing published shows, such as exact timings at 60 frames a second and colours read true.
- **The installed game is recorded, never driven.** The user starts the game and plays while the tool records. It sends the game no input, since the game's terms count injected input as botting.
- **Only the game's window is recorded.** Capture goes through Windows Graphics Capture, found by the game's executable. Nothing else reaches the file: no window above it, no desktop or webcam behind it, no cursor, and no overlay that is its own window. A recording of the screen's rectangle was tried first and took whatever was on screen whenever the user switched away. `record` waits for the window to open, so a recording can be armed before the game starts and take it from its first frame. It encodes on the GPU at 60 frames a second, near-lossless, into Matroska, which stays readable if the recording is cut short. A minimised game gives no frames, so a recording also ends by the clock, at its length in real time, rather than waiting for frames that are not coming.
- **FFmpeg is pinned, not installed.** Window capture arrived in FFmpeg 8, which no npm package bundles. The tool fetches one versioned release the first time it needs FFmpeg, refuses it unless its SHA-256 matches the pinned one, and unpacks it into the scripts package's `node_modules/.cache`, so no install or CI run ever pays for it.
- **A vector is used as it is, and only a mark with none is traced.** Wikimedia Commons holds some of the game's logos as SVG, the publisher's among them, and its paths are drawn directly, so no edge can chip.
- **A glyph is traced from the game's own mark.** The tracer starts from the wiki's standalone render of a mark where one exists, since a mark on a screenshot is small and, when pale, too faint to split cleanly. It traces at the source's full resolution, never reduced, and prints the region beside the trace to check. Ink is told from paper by how far each pixel strays from the colour at the region's corners, so a mark dark on white, lit on black or coloured on either traces alike, and a run of ink or a hole in it smaller than a sliver of the region, a sparkle printed on a logo, a speck of compression or a pale sparkle punching through a letter, is cleared from the split before it is traced; every path the trace finds is then kept, so no small part of the mark is lost. The path it writes is the one the component draws. Nothing from the game ships except shapes derived this way, a choice made so the screens match exactly.
- **A screen is a component folder with a fixture, in its section.** Every screen is a presentational component in the world package, laid out as Nuxt lays out the app's: `components/<Section>/<Name>/Index.vue`, named by its path (`Login/Screen` is `LoginScreen`), with its `Index.fixture.ts`, its browser tests and its approved images beside it. The sections follow the game (`Game`, `Splash`, `Loading`, `Login`, `World`), and `Game/Opening` shows the game's first screens in turn and owns every handoff between them. Having a fixture is what puts a screen on the parity page and in the visual suite, named as the package's own barrel exports it, so there is no list to keep. A fixture's `variants` are further states it is approved in, such as each stage of the login's interface. A fixture marked `isMotionOnly`, such as a 3D scene whose anti-aliasing jitters every frame, is shot on the page but kept out of the suite. A screen draws inside `genshin-interface`'s `GameScreen`, whose `--unit` scales the game's 1920 by 1080 screen by the window's smaller axis, as the game scales its interface; scaling by height alone was tried first, and a window narrower than 16:9 set text sized for the height in a box sized for the width. A screen also draws no heading element, since a host page's heading styles (the console's gold, its inherited font) reach into it; a heading is a paragraph with `role="heading"`. The pieces screens share are [`genshin-interface`](/docs/genshin/interface-library)'s, held by a suite of their own.
- **The comparison is numbers first.** `compare` shoots the screen in the machine's own Edge at 1080 CSS pixels high, scaled to the reference's pixel size. It prints the mean difference and a six-by-six grid of per-cell differences, then writes reference, ours and their difference side by side. A cell that stands out says where to zoom. It prints two scores beside them for a scene, which is rebuilt from shapes rather than copied and so never matches pixel for pixel: the shape, as the share of edges each image has where the other has one too, and the tone, as the difference of their colours blurred past any texture. A reference can hand its screen props of its own, so one screen is judged in each state a reference shows, such as a scene at each time of day.
- **The frame is calibrated by regression, never searched.** `calibrate` fits the frame-wide terms over the pixels the witness draws its parts on, in the order light meets the eye, each held for the next: the sun's and the ambient light's colours by least squares from the albedo and the normal (linear in them for one sun, whose heading and elevation are the one outer solve, a grid then the simplex, kept between 5° and 85° of elevation since grazing light lets a vast sun explain a sliver of pixels), the fog's colour and density from the depth (held clear where the drawn depths barely spread, since one depth cannot tell density from colour), then each channel's grade as a monotone curve from the predicted colour to the reference's, made monotone by pooling adjacent violators, beside plain sRGB's residual. One pass, never iterated: a grade fitted over a poor light regresses toward a flat curve, and reading the next pass's reference through it blacks it out. Given the game's grading tables, each is scored against the predicted colour. It reads a solved pose, so a pose that lands one part alone calibrates that part's light alone.
- **FLIP is the approval number.** NVIDIA's standard dynamic range FLIP is ported as it stands (`scoreFlip`): contrast-sensitivity filtering in YCxCz at the viewing distance's pixels per degree, the HyAB distance in Hunt-adjusted CIELab, and the luminance's edges and points, each pixel's error the colour difference raised to one less the feature difference. Its test holds it to NVIDIA's own evaluator, and on FLIP's example pair it reads 0.1597, as its readme does. `compare` reports it beside the mean, read at the structure's width as on a full screen. With `--witness`, `compare` and `attribute` also score each layer apart (`scoreLayers`): a family's pixels in the witness's part target, and the sky where no part is, each with its own shape, tone, detail and mean FLIP, so a change is judged where it lands. `attribute`'s committed loss table is each stand-in's FLIP loss on each layer against the witness's.
- **The scores are committed, as a bench's are.** Every `compare` rewrites its reference's row of `ParityReferenceMap.snapshot.md`, beside the map, and `compare --all` rewrites them all, so a change's diff shows what it moved on every screen, and the map's test holds every reference to a screen the page shoots.
- **Motion is matched frame by frame.** A recording is first sampled at one frame a second to find its events, then each event is read at its full rate over its own window of time. Our screen's motion is held at its start on the parity page and shot at the same moments. `entry` holds the screen's own animations as it mounts. `props` lets those finish, then applies the fixture's `motionProps` and holds the transitions they start; a still and the visual suite show the fixture's first state. `luma` prints one region's darkness across both sets of frames as two curves, so a fade's duration and a wipe's steps are read off numbers rather than raced. Window capture takes a frame only when the window changes, so a curve from it jitters by a frame or two where frames were skipped, and a fit is judged over the whole curve.
- **Nothing is approved uncompared.** The visual suite only holds a screen to its own last image, so it says nothing about the game. What does is `compare` against a reference in the same language and build, and a test fails for any screen with a fixture that no reference names. A title logo sized from another language's client was approved once without a reference and came out nearly twice the size of the English client's, which is why the test exists. A public video that letterboxes the game is cropped to its screen by the reference's `crop`.
- **An approved screen is held by the visual suite.** `pnpm test:visual` renders every screen and every variant from its fixture in Vitest's browser mode and matches it against its own last image, `Index.<platform>.png` and `Index-<variant>.<platform>.png` beside the component, as a test sits beside its code. It is a separate config, so an ordinary test run never starts a browser, and it reads the engine and the interface library from their source, so a change there shows without a build. The same config runs the tests of what only a browser can play: `Game/Opening`'s plays the whole opening, the login's flight included, and checks every handoff, so a screen skipped along the way fails a run rather than a reader's eye. `-u` approves what the screens draw now. A new image's first run writes it and fails once, which is Vitest's way of asking for that approval.
- **An interface over a scene is compared over the reference's own frame.** A reference with `isBackdrop` has its frame drawn behind the screen, served to the page by the shooting browser and drawn pixel for pixel, so every cell the interface leaves bare scores exactly 0.00% and only the interface can differ. A capture's frame is rewritten without the gamma and primaries FFmpeg tags it with, since a browser colour-manages a tagged image and drew the frame darker than its own file. Glass the interface draws translucent (the prompt band) lands on the recording's own glass and darkens twice, so its colour is solved from the scene around it, and the score holds its opaque pieces and every placement. The login's interface reached a few tenths of a percent on each stage this way, the rest being the older build's build string and repair button.
- **A witness render draws the exports through our own scene.** With `--witness`, the shooting browser serves a component's exports to the page and the scene draws them in place of its own parts (`SceneWitnessKey`), under its own camera, light and frame, so a stand-in of ours is priced against the game's own data ([scene derivation](/docs/proposals/genshin/scene-derivation)). Nothing of it is bundled: the page only fetches what the shoot serves it. `pose` solves the camera from landmarks, points of the exports whose places the witness knows (a share of a part's bounding box), against the pixels a reference names for them, each snapped to its nearest corner: from six or more the projection is read in closed form by a direct linear transform, from fewer from a start with the field of view held at one read off two widths, and Levenberg–Marquardt then minimises the reprojection error, printed per landmark. A few steps of the simplex then refine it, the held axes still held, on the distance from the chosen families' silhouettes, taken from the part target rather than the shading, to the reference's edges, so the clouds, which draw no part, cannot pull it. The seams between one family's parts are left out, since the reference draws them as cracks or not at all: the walkway's blocks meet along its painted cracks. Two parts in one frame share one camera, so a part whose own landmarks barely fix an axis takes it from one that does: the door's three points trade its pitch against its height, and the walkway's wings fix it. `track` does the same at each sampled frame of a reference's recording, each from the frame before, for a path no clip holds. The grid search over a line distance this replaced absorbed a wrong arrangement into plausible poses.
- **The witness settles in one frame and writes a G-buffer.** On the parity page the witness's post chain resolves edges with SMAA, which keeps no temporal history, and setting a view holds the scene's clock, so one drawn frame is the view and the same view draws the same frame. `gbuffer` then renders the witness's parts alone into floating-point targets read back from the renderer (`renderWitnessTargets`): the depth along the view, the world normal, the unlit albedo and each part's identifier with its family, named in the header. The part target is the reference's segmentation at that pose, which the later tools mask by, and `overlay` draws its families' boundaries over the reference beside a map of the reference's edges by how far each is from them, printing each family's distance, so a part that does not land shows where.
- **The world's shapes are measured off the game's own assets, never copied.** The interface is rebuilt from screenshots, which its overlay compare holds exactly; a scene's towers, doors and profiles come from the installed game's files. AnimeStudio exports them with the game closed into the references folder, outside the repository like every other reference, and a transform fits our own kits' parameters to them, so only numbers of ours ship ([derived assets](/docs/genshin/derived-assets)).

## Deriving a screen

A new screen, or a new piece of one, is derived in one order, so every source is found once, recorded where it is used, and never searched for again:

```mermaid
flowchart TD
  P["Search what is published: the wiki, data dumps, public videos"] --> REF["References: ParityReferenceMap, and the component's Index.reference.ts sources"]
  P --> B["Find the screen's blocks through an indexed asset: a mesh, a clip, a material"]
  B --> MAP["Its DerivedAssetComponentMap entry: names, roots, interface root and anchor, clips"]
  MAP --> RUN["genshin:assets extract, shaders, inventory, interface, clips, witness"]
  RUN --> REF
  RUN --> K{What is the piece?}
  K -->|"interface"| UI["Placed from the interface tree's rects, moved by its decoded clips"]
  K -->|"3D"| AR{"Width ratios of neighbouring parts match the reference?"}
  AR -->|no| PAR["Fix the arrangement: a lost parent's place and scale"]
  PAR --> AR
  AR -->|yes| POSE["Read the pose by perspective from parts of known size"]
  POSE --> W{"Witness render at that pose lines up?"}
  W -->|no| AR
  W -->|yes| SD["The scene derivation: calibration, loss table"]
  UI --> C["compare against its references"]
  SD --> C
  C -->|off| K
  C -->|matches| V["Approve in the visual suite"]
  V --> R["Record: findings in the reference, conventions in the skill"]
```

- **Read before searching.** A component's `Index.reference.ts` and the [game data formats](/docs/genshin/game-data-formats) page's shortcuts come first; a search whose answer is recorded is not run again.
- **Every derived value cites its source.** A rect, a curve, a fitted shape or a constant names the key of the reference source it is taken from.
- **Exact data outranks measurement.** A RectTransform's anchor, a clip's curve or a shader's program is used before a position, a timing or a model measured off a recording; a recording measures only what is fieldless, such as a layout group's spacing or a script's settings.

## Commands

From `scripts/`, as `pnpm genshin:parity <command>`, each with its own `--help`; the parity page from `packages/genshin-world`, as `pnpm parity`.

| Command                                                    | What it does                                                                                                                       |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `fetch`                                                    | Every reference not yet held, as PNG                                                                                               |
| `compare <reference>`, `compare --all`                     | Shoots its screen, prints the scores, writes reference, ours, difference, and its report row                                       |
| `compare <reference> --witness <component>`                | The same over the witness render, its image kept apart and its scores out of the report                                            |
| `gbuffer <reference> --witness <component> [--pose]`       | The witness's depth, world normal, unlit albedo and part per pixel in one settled frame, as raw floats with a header and a preview |
| `overlay <reference> --witness <component> [--pose]`       | The witness's family boundaries over the reference, the reference's edges by their distance from them, and each family's distance  |
| `pose <reference> --witness <component>`                   | The camera pose from the reference's landmarks, its reprojection error per landmark, then optionally refined on families' edges    |
| `track <reference> <time> <seconds> --witness <component>` | The pose at each sampled frame of the reference's recording, refined on families' edges from the frame before's                    |
| `shoot <screen> <w> <h> [--motion entry] [ms…]`            | The parity page's screen at a size, paused at each time when given                                                                 |
| `frames <file or File:…> [fps] [start] [seconds]`          | A video or animated image as stills and a contact sheet, over a window                                                             |
| `luma <x> <y> <w> <h> <image or folder>…`                  | One region's darkness across images, or a folder's frames, as a curve                                                              |
| `measure <image> <x,y>…`                                   | The image's size and the colour under each point                                                                                   |
| `zoom <image> <x> <y> <w> <h>`                             | A region enlarged with hard edges                                                                                                  |
| `polar <image> <bands> <angles>`                           | A ring mark's colours about the image's centre, by radius and angle                                                                |
| `trace <image or File:…> <x> <y> <w> <h> [scale]`          | A glyph as one SVG path, and the region beside it to check                                                                         |
| `launch`, `still`, `record <name> [seconds]`               | Start the game, capture its window once, or record it once it opens (two minutes unless told)                                      |

## What it costs

Each step takes seconds, so the loop runs as often as a test would:

- The parity page is up in about a second.
- A comparison, shot included, takes a few seconds.
- The visual suite's first screen takes a few seconds, and each further screen a fraction of one.
- A trace at a mark's full 1600-unit resolution takes a second or two.

The startup loading screen reached a mean difference of a few hundredths of a percent in two edits. The remainder is antialiasing along the edge of the lit marks.

## Key files

| File                                                                  | Role                                                                                                        |
| :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinParity/commands/genshinParityCommand.ts` | The commands, one file each beside it                                                                       |
| `scripts/src/services/genshinParity/ParityReferenceMap.ts`            | Each reference, the wiki file it comes from and its screen                                                  |
| `scripts/src/services/genshinParity/compareScreen.ts`                 | Shoot, score and lay reference, ours and difference side by side                                            |
| `scripts/src/services/genshinParity/shootScreen.ts`                   | The parity page's screen in Edge, over a reference's own frame when it is a backdrop                        |
| `scripts/src/services/genshinParity/traceImage.ts`                    | A mark traced into one path at full resolution                                                              |
| `scripts/src/services/genshinParity/solveCameraPose.ts`               | The camera pose from correspondences: the direct linear transform, then Levenberg–Marquardt                 |
| `packages/genshin-world/parity/witness/loadWitness.ts`                | The exports laid out as the scene's parts, on the parity page                                               |
| `packages/genshin-world/parity/screens.ts`                            | Every screen with a fixture, for the page and the suite                                                     |
| `packages/genshin-world/parity/screens.visual.ts`                     | The visual suite                                                                                            |
| `packages/genshin-world/src/components/Loading/Startup/Index.vue`     | The game's startup screen: the seven marks, wiped in as loading goes                                        |
| `packages/genshin-world/src/components/Splash/Sequence/Index.vue`     | The game's splashes: its logos and health notice, timed from a recording                                    |
| `packages/genshin-world/src/components/Game/Opening/Index.vue`        | The game's opening: the splashes, the login screen, then the startup screen, handed on by their own timings |

## Sources

- [Visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing), Vitest: `toMatchScreenshot` and where its reference images are kept.
- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs): the public-domain tracer behind `trace`.
- [Photo Mode](https://genshin-impact.fandom.com/wiki/Photo_Mode), Genshin Impact Wiki: capturing the game without its interface, for the world's references.
