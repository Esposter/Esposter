---
name: genshin-engine
description: Apply when writing or reviewing code in packages/genshin-engine or packages/genshin-world, the app's Genshin components under components/Genshin, or any TSL material, post pass, generator or kit for it. Esposter's Genshin engine — a published package of plain TypeScript and TSL modules — and the world package that builds the game's regions on it in TresJS components, built to run cheaply in the reader's own browser.
---

# Genshin Engine

The design, from each module's job to the order a frame runs in, is `openspec/specs/genshin/engine-architecture/design.md`; this skill is the rules a change to the engine or its world follows.

## Settled — do not re-propose

- **A rigid-body physics engine** (Rapier, cannon) for collision (`references/settled-directions.md`).
- **An `ignorePatterns` entry for the engine's TSL** — `references/settled-directions.md`.
- **Shipping assets taken from the game** — models, textures, sounds or art, extracted or converted (`references/settled-directions.md`).
- **Hosting HoYoverse's official MMD packs** — the packs are published to the public container under the owner's statement that HoYoverse permits redistributing them (`openspec/specs/genshin/characters/published-packs/design.md`).
- **The word "teyvat" in any name** — package, folder, route, page or prose (`references/settled-directions.md`).
- **A second renderer path for WebGL** — `references/settled-directions.md`.

## Rules

- **A world system lives in its own composable; the screen only composes them** — `references/world-systems.md`.
- **The engine has no Vue, no store and no DOM beyond a canvas, and no place** — `references/package-boundary.md`.
- **A generator is pure and seeded, and returns typed arrays** — `references/generators.md`.
- **Nothing allocates per vertex or per frame** — `references/generators.md`.
- **Every generator and per-frame selection is benched at two scales or more** — `references/generators.md`.
- **Light is shared uniforms, and the sky writes them** — `references/lighting.md`.
- **Environment surfaces use `createToonMaterial` over the world's one ramp texture** — `references/lighting.md`.
- **A character is its official MMD pack, read at run time by the engine's own PMX reader** — `references/characters.md`.
- **The frame is drawn by the engine's post pipeline** — `references/post-pipeline.md`.
- **A mask the post chain reads is drawn from stand-ins, never from the world's materials** — `references/post-pipeline.md`.
- **One outline material serves every toon material, and the view compiles before it shows** — `references/post-pipeline.md`.
- **An instanced mesh is `createInstancedMesh`, never three's `InstancedMesh` constructed by hand** — `references/materials.md`.
- **A material is made once per kind, not per landmark** — `references/materials.md`.
- **Ground is not outlined** — `references/post-pipeline.md`.
- **The sun casts through cascades; the god rays read their own sun** — `references/lighting.md`.
- **A look value is tuned in development's panel, then copied into the region's constants** — `references/tuning.md`.
- **The ground streams; nothing places a heightfield by hand** — `references/terrain-streaming.md`.
- **There is one wind** — `references/wind.md`.
- **Ground is painted by its layers, placed where its terrain places them** — `references/ground-paint.md`.
- **A change of detail cross-fades by dither, never pops** — `references/materials.md`.
- **Weather is written after the sky and before the water** — `references/lighting.md`.
- **One input, read once a frame, bound in one map** — `references/input.md`.
- **What moves the camera runs ahead of the floating origin by priority, and the body moves in the world's own coordinates** — `references/camera-and-floating-origin.md`.
- **The engine depends on three alone, so it dispatches over an enum by an `if` chain or a map, never a `switch`**: lint's `default-case` wants a default, and the engine has no `exhaustiveGuard` to give one.
- **A screen over the world is a `ScreenKind`** — `references/screens.md`.
- **A game rule that moves over time is a deterministic step in the world** — `references/game-rules.md`.
- **Combat is one set of rules every feature calls into** — `references/game-rules.md`.
- **Region data and kits are the world package's, and a kit is its hosted record joined to one behaviour module**, loaded with its character from a derived map, as `references/regions-and-kits.md` gives.
- **Game data is published, never imported** — `references/game-data.md`.
- **The world package is published and builds through the Vue tsdown configuration** — `references/world-package.md`.
- **A system that holds player state adds its slice to the save schema in the same change** — `references/save-data.md`.
- **Every exported function states its return type**, since the package is published with isolated declarations (`packages/configuration/tsconfig.browser.json`); the file and import rules are the `file-organization` and `build` skills'.

## Reference pages

- `references/regions-and-kits.md` — when adding a region, its data or landmarks, a character's kit, or a building's kit.
- `references/generators.md` — when writing a seeded generator, a per-vertex or per-frame loop, or the bench that proves its cost.
- `references/lighting.md` — when a material reads light, the sky or the weather writes its colours, or a sun shadow or the god rays are drawn.
- `references/characters.md` — when a character's model, its MMD pack, or its materials and outline are in question.
- `references/post-pipeline.md` — when a post pass, the outline, a mask for the post chain, or the view's compile before it shows is in question.
- `references/materials.md` — when a mesh is instanced, a material is made for a kind of thing, or a change of detail cross-fades.
- `references/terrain-streaming.md` — when a region's ground streams from the terrain worker, or anything is placed in the world group.
- `references/wind.md` — when anything moves in the wind, such as grass, crowns or clouds.
- `references/ground-paint.md` — when a region's ground colour is painted from its layers.
- `references/input.md` — when input is read, a key or button is bound, or a touch control writes into the input.
- `references/camera-and-floating-origin.md` — when a frame callback moves the camera, or the character's body is placed against the world's ground.
- `references/screens.md` — when a screen opens over the world, or a fixed-step loop must stand still while one is open.
- `references/game-rules.md` — when a rule moves over time, an enemy's AI steps, or a hit is priced.
- `references/world-package.md` — when the world package's build, or the Tres tags its templates compile to, is in question.
- `references/world-systems.md` — when a world system is added, or one system reacts to another.
- `references/package-boundary.md` — when code is placed in the engine, the world package or the app, or a world component is handed a prop by the app.
- `references/tuning.md` — when a look value is tuned in development's panel and copied into a region's constants.
- `references/game-data.md` — when a function reads a table, a word, a fitted scene or an authored world file.
- `references/save-data.md` — when a system that holds player state adds or changes its save slice.
- `references/settled-directions.md` — when a proposal matches a Settled line and its full statement is needed.
