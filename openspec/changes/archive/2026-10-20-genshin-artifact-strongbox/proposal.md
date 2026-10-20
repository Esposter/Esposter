## Why

The Crafting Bench's Mystic Offering (unlocked at Adventure Rank 45) turns three 5-star artifacts into an Artifact Strongbox, which holds a random piece of a set the player chooses. The bag now holds each artifact as its own individual, so the offering can give up three of them and roll one back. Without it, five-star artifacts the player has no use for stay in the bag with no sink.

## What Changes

- The hosted game data gains `crafting/strongboxes`: one record per strongbox, carrying its set, its display name's text id, the artifact rarity and count it takes, and the set's pieces it can hold. It is built from the dump's reward preview, display item and offer tables by the existing `genshin:assets crafting` command.
- A pure roll picks one of the chosen set's pieces and rolls it through `rollArtifact` at five stars, sharing the piece-to-artifact step with the chest drop.
- A pure offering takes three unlocked five-star bag artifacts, removes them, and takes the rolled strongbox artifact into the bag through the drop pickup.
- A Mystic Offering panel, opened from the Crafting Bench at Adventure Rank 45, lists the 40 set choices and the candidate artifacts, and requires exactly three.
- The panel's words come through `GameTextKey` members in `genshin-text`.

## Capabilities

- `artifact-strongbox` (new, under `genshin`)
