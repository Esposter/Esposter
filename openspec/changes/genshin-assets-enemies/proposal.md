# Enemy asset family

## Why

Every enemy in the world is one shared capsule. The game's monsters have bodies, rigs, animation clips, attack effects, per-attack damage and drop families, and most of that is already in the install's dumps and blocks on this Mac, but the derived-assets recipe has never been run for them. The enemy family therefore has a gap in each of those parts, and in two of them the repository cannot reach the data at all: no command reads a monster's combat config or its Animator states, and no code builds the drop families from the wiki's table. Some of the gaps are already owned by open work, the AI timings, the camp kinds, the boss moves and the attack element among them, and this change links those rather than writing them again.

## What Changes

- The recipe's missing readers are built first: a monsters subcommand that names each placed kind's prefab, controller and combat config, an enemy wiki page fetch, a drop-family record, the per-attack damage list and the Animator state reader.
- The enemy framework's draw takes the enemies nearest the character first, within the draw capacity, instead of the first ones in map order.
- The Hilichurl Fighter's body is extracted and its avatar written from the install, the monster-shape fit that turns a body into our parameters is registered, and a kind's fitted body replaces its capsule once a still of it is found.
- A windup draws a telegraph of its reach as our own shape.

No game art, mesh, texture, clip or effect is committed or shipped. Only fitted parameters and generated shapes ship.

## Capabilities

- **genshin/enemy-assets** (new)

## Waiting on

None for the foundation tasks, which read this Mac's copy of the blocks and dumps. The body's check waits on a still of a monster on screen that a search of published material finds.

## Impact

The asset tool's enemy steps and their shared readers in `scripts/src/services/genshinAssets`, the enemy framework and its draw in `packages/genshin-world/src/services/enemy` and `packages/genshin-world/src/components/World/Enemies`, and the hosted game data's enemies dataset and its lock. The enemies capability's common-enemy drop requirement is reworded when its family table ships, and the open work this change links is not changed.
