# Trees and Scatter

## Why

The game places trees, bushes, rocks and flowers across the world, and the layout pass already stands each as a stand-in. What remains is every placed plant drawn as its own species, each fitted to its game export, and drawn affordably: a forest of individual meshes costs too much to draw in one frame. Instancing and GPU culling make the cost of a forest a single batch per species.

## What Changes

Every plant the game places stands in the world as its species, drawn in batches and culled on the graphics card.

- Each tree, bush, rock and flower the game places stands at its recorded place, turn and scale, and the oak stands only as its landmark.
- A tree shows its full mesh near the eye and its impostor far from it.
- Plants out of view or past the distance are culled on the graphics card, so a field of grass is not walked through the CPU.
- Grass bends away from the character as the character passes through it.
- Each species is fitted to its game export, the one costing most first.

## Capabilities

- **genshin/trees-and-scatter** (new)

## Waiting on

- The roadmap's `windrise-oak-shape` row, which holds the oak's species open; the oak's step comes last and waits on that row alone.
- Game data: `game-exports` (per the change's needs).

## Impact

The layout pass's placed plants, the tree and its impostor, the grass and scatter drawing, and the engine's per-instance culling as its first consumer are touched. The distance at which a tree turns impostor and the flowers' look are deferred to measured recordings.

Size kept as the source page's own: splitting it is a later decision.
