# Fishing and wildlife assets

## Why

The fishing scene and the wildlife reach the screen as a reel overlay, one capsule per animal and the fishing logic, and nothing else. No fish, rod, float, splash, critter body, pet, fishing-area prop or animal icon is drawn. The game's art for all of it is on the machine that holds the install, so the gap is in the conversion: no part of the family is named as a component the recipe can export, the animals' flight numbers are provisional, and the icons are discs. This change specifies each gap and the path that turns it into our shapes, so every step runs from the install with a command, or with a task that builds the command.

## What Changes

- Two derived-asset components, `animals` and `fishing`, named over the asset index, so the recipe's extract, clips and fit reach the family through the one path.
- Five commands the conversion lacks: a mesh's bounds, a clip's root motion, a frame cut from a local recording, a named-icon export and a props dataset, plus a name lookup over the index.
- Stand-ins drawn by our code for the cast (fish, rod, float, splash and the point ripple), the four fleeing kinds, the critter groups and the fishing-area props.
- Fitted shapes of the game's own meshes published as our parameters, for each of those families and for the pets.
- The fleeing kinds' flight time and speed read from their run clips, since the flight recordings the roadmap asks for were searched and not found.
- Icons traced from exported references into paths of ours, and the reel challenge panel's words through the game text.
- The art that cannot ship recorded as roadmap `Asset:` lines.

## Capabilities

- **genshin/fishing-wildlife-assets** (new): the family's shapes, their conversion from the install, and the motion numbers the animals take.

## Waiting on

None. Drawing the pets waits on the wildlife change's pet kind, but no task here waits on it.

## Impact

The genshin-assets and genshin-parity tooling in `scripts`, the world's fishing and wildlife services and components, the engine's kits, the game text package, the published game data (the lock moves on each publish) and the roadmap. The game's art stays in the local references folder and never enters the repository or the build. Each unowned gap has its own task, and a gap whose stand-in and likeness fall in different phases has two, so the change carries more than the twelve tasks the proposal guide in `openspec/config.yaml` names; the owner decides whether to split it by phase.
