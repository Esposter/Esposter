---
title: Save Data
description: Proposal — what is left of the Genshin world's save: the characters the player holds and their copies, which the save does not yet hold, and the enemy respawn timers once they are saved. The save blob, its lease, the slices of the bag, Adventure Rank, achievements, wish counters, Reputation and Companionship, the shared If-Match path, the guest merge and the replaced signal are built.
model: claude-haiku-5-5
---

# Save Data

The save, its lease, the shared blob-state path with its If-Match, the slices of the bag, Adventure Rank, achievements, wish counters, Reputation and Companionship, the guest merge and the replaced signal are built as [save data](/docs/genshin/save-data) describes. What is left is what the world holds that the save does not yet.

## Decisions

- **The roster is the save's next slice, and Companionship EXP is applied to it.** Companionship EXP is saved by character id already, but no character is saved, so the EXP has no character to land on. The roster slice is each held character's id, level, ascension, constellations, talent levels, weapon and artifacts, with its copy count beside it, each piece owned by the model it is.
- **A set whose entries paid into the wallet or the bag merges as the account's copy.** When the opened chests or the collected items gain a slice, it merges with the wallet and the bag, never by union, since a union would keep a guest's opened chest while the account's wallet drops what it paid, and the chest could never pay again.

## Left to build

- **The characters the player holds and their copies.** A wish grants characters, which the World screen keeps in its `characters` roster and `characterCopyCountMap`, and no save holds either. Until they are saved, a reload loses every character a wish granted, and the Companionship EXP the save carries has no character to apply to. Needs the roster's slice beside the character model, its conversions to and from the world's characters, and the merge rule (a copy count takes the larger, a character's level and talents the further).
- **The enemy respawn timers, once they are saved.** The Enemies component keeps each defeated enemy's instant in memory on the local clock, so a reload resets them. When the save holds them, they are read through the server's offset like the gathering points' respawns.
