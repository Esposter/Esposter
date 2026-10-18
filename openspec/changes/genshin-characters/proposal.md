# Characters

## Why

Each character's official model is drawn at rest in the game's character shader and held by the character controller, so it stands and faces where the body does. It does not yet move, its scale is a reckoned figure rather than the game's, and its terms are not shown where a character is chosen. Without locomotion, a character in the world looks like a posed statue.

## What Changes

Characters move as the game's characters do, stand at the game's scale, and show their terms where they are chosen.

- The Traveler's standing, walk, run and sprint motion is fitted to the game's own locomotion clips, and other characters follow.
- Each character's scale is measured from the game's own model, replacing the reckoned eight-centimetre unit.
- A party screen shows a chosen character's terms and credit beside the character.

## Capabilities

- **genshin/characters** (new)

## Waiting on

- `openspec/changes/genshin-recreation-passes/`: the motion pass that fits each character's locomotion.
- `openspec/changes/genshin-party/`: the party screens that show the terms once Party Setup is built.
- Game install and game exports, which the clips and models are read from.

## Impact

- The character model in the Genshin world, its locomotion under the character controller, and the party screens that choose a character.
- The asset tooling that exports the clips and the Traveler's model.
