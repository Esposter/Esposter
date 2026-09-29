---
name: genshin-parity
description: Apply when building or changing a Genshin screen (loading, menus, prompts, HUD) to match the game, tracing a glyph, measuring a reference, matching an animation, or touching packages/genshin-world's components, parity page or visual suite, or scripts/src/genshinParity. Esposter's image-driven loop — references outside the repo, a screen per component with a fixture, one command to shoot, score and diff it, and a visual suite holding every approved screen.
---

# Genshin Parity

The loop and why it is shaped this way are `apps/web/content/docs/genshin/parity.md`. This skill is the rules each step follows.

## Settled — do not re-propose

- **Committing a reference.** Screenshots, recordings and wiki images of the game live in `~/Esposter/genshin-parity` (`PARITY_DIRECTORY`) and never enter the repository. Only `ParityReferenceMap` names them.
- **Sending input to the game.** The tool launches and records the game; the user plays. Injected input is botting under its terms, with an anti-cheat driver watching.
- **Rendering a screen through Nuxt to check it.** A screen renders on the world package's parity page on plain Vite, up in about a second; a Nuxt build per check was the cost that sank the old screenshot suite.
- **A hand-kept list of screens.** A screen is on the page and in the suite by having a `<Name>.fixture.ts`.
- **Tracing below full resolution.** A trace starts from the source's full resolution, never reduced, and enlarges a small mark before tracing it.

## Rules

- **Numbers before looking.** Run `pnpm -C scripts genshin:parity compare <reference>` and read the mean and the grid; zoom only on a cell that stands out. Target a mean of hundredths of a percent, with any remainder explained (antialiasing along an edge).
- **A screen is a presentational component in its section: `packages/genshin-world/src/components/interface/<section>/<Screen>.vue`**, props in, events out, no store. There is one section per part of the game's interface: `loading`, `menu`, `prompt`, `hud`, `dialogue`, `map`, `character`, `settings`. A piece two sections share (a menu tile, a capsule button) is in `interface/shared`. Its services and models mirror the path (`services/interface/<section>/`), and whatever every section reads, such as the element marks, sits at `services/interface/`. The component barrel exports each component under its bare file name wherever it sits, so no two screens may share one (`StartupLoading`, not `Startup`). The app wires the screen to its stores; `AgentConsole/Panel/Loading.vue` is the pattern.
- **Lay a screen out in the game's units.** The root is `container-type: size`, and everything inside is `calc(var(--unit) * n)` with `--unit: calc(100cqh / 1080)`, measured from a reference scaled to 1080 high (a 1440 reference's pixels times 0.75).
- **Styles are scoped `<style>` in the SFC** with the measured hex values, not UnoCSS or the app's tokens: a screen matches the game, not the design system. `@tsdown/css` bundles them into `@esposter/genshin-world/style.css`, which the app loads in `configuration/css.ts`.
- **A glyph comes from the game's own mark by `trace`, preferring the wiki's standalone render** (`File:Element <Name>.svg`, 1600 units). A mark on a screenshot is small, and a pale one traces rough. Keep the region and trace check image, and read it before using the path. Paths live in a `…PathMap` service keyed by an enum (`ElementType`; never `Element`, which is the DOM's).
- **An order the game shows is its own array, never an enum's.** Lint sorts an enum's members alphabetically, so `Object.values(ElementType)` is not the game's order; `ElementTypes` lists it (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo).
- **Find a mark's box from the pixels**, not by eye: the ink's column runs and extents along the row give each box, and equal boxes around each centre keep the marks aligned as the game draws them.
- **Motion: find, sample, then pause.** Sample a recording at 1 fps to find its events, then `frames <file> 30|60 <start> <seconds>` over each one (sharp for GIF and animated WebP, which the wiki serves and FFmpeg cannot decode; FFmpeg for video). `shoot <screen> <w> <h> entry <ms…>` holds the screen's own animations as it mounts; `props` (the default) lets those finish, applies the fixture's `motionProps`, and holds the transitions they start. A still and the visual suite show `props` alone. The page flushes style between the entry and the props, or the browser folds both into one style change and starts no transition. After a new import, the first load of the page reloads while Vite optimises it; shoot again. Compare with `luma` over the same region of both. Measured timings live in the section's `constants.ts`, with how they were measured. A recording's colours read true only because `RECORD_ENCODING` converts to labelled limited-range YUV before AMF, which otherwise labels its own limited range as full and squeezes every value (white as 234); keep that conversion, and still take exact colours from a lossless still or the wiki's PNG.
- **Record the game's window only**, with `record <name> <seconds>` armed before the user starts the game: Windows Graphics Capture by executable, GPU-encoded, Matroska. Never capture a screen rectangle, which takes the desktop, the webcam and any overlay whenever the game is not in front.
- **FFmpeg is the pinned release the tool fetches** (`FFMPEG_ARCHIVE_URL` and its SHA-256, into `scripts/node_modules/.cache/ffmpeg`). To move it, bump the version and checksum together; never add an npm FFmpeg (none bundles 8 or later, which window capture needs).
- **Approve with the visual suite once `compare` is clean.** `pnpm -C packages/genshin-world test:visual --run -u`, then commit the image, which is kept in the section's `__screenshots__`, with the screen. A new screen fails on its first run, the one that writes the image.
- **The parity page is `pnpm -C packages/genshin-world parity`, on port 3002, and the tool `pnpm -C scripts genshin:parity`, run through `tsx` for its enums**, started in the background before `compare` or `shoot`.
