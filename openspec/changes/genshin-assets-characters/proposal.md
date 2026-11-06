# Character, NPC and motion assets

## Why

The world draws its characters from their official packs and every other playable character as the Traveler's model. Every pose it draws is generated from our own parameters, since no game clip drives any character, no resident has a body, and no face, cutscene, attack or emote motion is drawn. The game holds the clips and bodies for all of it on this Mac, but nothing in the repository decodes them into shippable parameters, fits them, publishes them or reads them, and no spec or recipe says how an asset family of this kind is converted. The foundation phase needs that recipe for every family before any of the family's gaps can be closed in order.

## What Changes

The family's gaps are listed in its design. Each gap an open change or roadmap item already owns is linked and gets no task here. Each other gap gets one task, or one per gate when it spans two:

- The Traveler's clip block and measured unit are corrected and published, so the scale test reads a game-derived record.
- A motion fit and its typed reader give each body's state a fitted loop, which the controller and the Traveler's air, water and attack states then play.
- Faces play the pack's own morphs, a cutscene plays its characters' motion, and each NPC body plays the clips its game record exports.
- Residents stand as a generated shape of their game body type.
- Each held character other than the Traveler gets a measured unit, and the owner's further official packs are published as they are supplied.
- The Character screen's model rise and Paimon's idle clip are read from the recordings already held.
- The shading page's open items are closed one at a time.

## Capabilities

- **genshin/character-assets** (new): the motion, faces, cutscenes and NPC bodies a player sees on the field and the Character screen.

## Waiting on

- The owner's further official packs, for task 6.1 only.
- A PC for the game exports that tasks 4.2, 6.2 and 8.1 need (G5, G10 and G14's blocks not held here). Those tasks wait on it when only a Mac is at hand.
- Paimon's official pack, which menu Paimon's task 2.1 waits on and this change links rather than tasks.

## Impact

- The genshin asset commands and their maps under `scripts/src/services/genshinAssets/`, which gain the Traveler's record, the motion fit and the NPC body join.
- The character services, the resident shapes and the Character screen in `packages/genshin-world`, and the pose and morphs in `packages/genshin-engine`.
- The hosted game data lock, which gains the unit, motion and body records on publish.
- The open `genshin-characters` change's design, whose block naming is corrected.
