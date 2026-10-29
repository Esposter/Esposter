# Playtest tools

## Why

The owner checks the game by playing it, and has no direct way to reach a state worth checking: a boss fight, a night in Liyue, a chest of every tier, a quest half done. The only developer surface is three's Inspector, which is attached to every development scene, sits over the game, shows renderer internals instead of the game's state, and is the owner's stated obstacle rather than a help. Each feature change has no place to say how to see it, so checking one means reading its design and building the state by hand.

## What Changes

One developer surface that belongs to the game, in the development server only.

- A typed command registry is the single source of truth: **commands** (`teleport`, `time`, `weather`, `give`, `level`, `god`, `timescale`, `scenario`...) and **variables** (a named boolean, number, colour or choice with a range and a group, such as the look's every uniform). The registry parses and runs a line, reports its result or its error, and completes names and ids.
- Two faces over the registry: a **console** (opened by the backtick key, with history and completion) and a **panel** (opened by F2, with the variables as controls grouped in tabs and the scenarios as buttons), both drawn with the app's own interface library.
- **Scenarios**: a named, ordered list of commands that puts the game in a state worth checking in one click, each authored beside the change it shows.
- A **stats overlay** (frame time, draw calls, triangles, memory) and **pass toggles** (shadows, god rays, ambient occlusion, bloom, anti-aliasing), so a slow scene shows which pass costs.
- A **pick** that names the entity under the pointer (kind, id, place, state).
- **BREAKING** three's Inspector is no longer attached to any scene, and its Look group moves into the panel's Look tab as variables.
- A feature change registers the scenario that shows it, or says in its design why it has none.

## Capabilities

- **genshin/dev-tools** (new)

## Waiting on

- Nothing.

## Impact

- Development only: the surface and every command are absent from a production build and from a browser driven by automation.
- The renderer's creation, the look-tuning composable and the Vite dependency-optimizer exclusion for the Inspector go.
- Command handles are registered by the world session, the save and the look; none of those gain behaviour a player can reach.
