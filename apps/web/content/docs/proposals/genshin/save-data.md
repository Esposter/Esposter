---
title: Save Data
description: Proposal — what is left of the Genshin world's save: the characters the player holds and their copies, which the save does not yet hold, and the enemy respawn timers once they are saved. The save blob, its lease, the slices of the bag, Adventure Rank, achievements, wish counters, Reputation and Companionship, the shared If-Match path, the guest merge and the replaced signal are built.
model: claude-haiku-5-5
touches:
  [
    "packages/genshin-world/src/models/save/**",
    "packages/genshin-world/src/services/save/**",
    "packages/genshin-world/src/models/character/CharacterSave.ts",
    "packages/genshin-world/src/composables/useWorldCombat.ts",
    "packages/genshin-world/src/composables/useWorldSaveSync.ts",
    "packages/genshin-world/src/components/World/Session/**",
  ]
---

# Save Data

The save, its lease, the shared blob-state path with its If-Match, the slices of the bag, Adventure Rank, achievements, wish counters, Reputation and Companionship, the guest merge and the replaced signal are built as [save data](/docs/genshin/save-data) describes. What is left is what the world holds that the save does not yet.

## Decisions

- **The roster is the save's next slice, and Companionship EXP is applied to it.** Companionship EXP is saved by character id already, but no character is saved, so the EXP has no character to land on. The roster slice is each held character's id, level, ascension, constellations, talent levels, weapon and artifacts, with its copy count beside it, each piece owned by the model it is.
- **A set whose entries paid into the wallet or the bag merges as the account's copy.** When the opened chests or the collected items gain a slice, it merges with the wallet and the bag, never by union, since a union would keep a guest's opened chest while the account's wallet drops what it paid, and the chest could never pay again.
- **A character's Companionship EXP stays in its own slice.** The world's `Character` carries `friendshipExp`, and the save keeps it once, in `companionshipExp` by the character's id: a loaded character reads it from there, and a save writes each character's back, a character the roster lacks keeping its saved EXP.
- **A guest's character is merged whole.** A character both copies hold is the copy further on, by its level and then its constellations, kept whole so its weapon and artifacts stay one copy's, as a kind of wish keeps one copy's counters; its copy count takes the larger. A character only one copy holds is kept.

## Left to build

```text
packages/genshin-world/src/models/character/CharacterSave.ts
```

- **The characters the player holds and their copies.** A wish grants characters, which the World screen keeps in its `characters` roster and `characterCopyCountMap`, and no save holds either, so a reload loses every character a wish granted. Add `CharacterSave.ts`, one held character as the save keeps it: its `id`, `level`, `ascension`, `constellationCount`, `stellaFortunaCount` and `talentLevels`, its `weapon` and `artifacts` with the fields their models hold, and its `copyCount`, each bounded as the other slices' fields are. `GenshinSave` gains `characters: z.array(characterSaveSchema).max(MAX_CHARACTER_COUNT)`, with no default, as the save's slices carry none, `MAX_CHARACTER_COUNT` being in `services/save/constants.ts` already, and `GenshinSaveState` gains `characters` and `characterCopyCountMap`. `services/save/toCharacters.ts` reads them and `services/save/toCharacterSaves.ts` writes them, wired in `readGenshinSave` and `toGenshinSave`, and `mergeGenshinSave` merges them by the decision above. `useWorldCombat`'s `characters` starts from the saved roster, the Traveler alone where it is empty, the session's `characterCopyCountMap` from the saved counts, and `useWorldSaveSync` writes both. Tests: `services/save/readGenshinSave.test.ts` reads back a character `toGenshinSave` wrote, its Companionship EXP among it; `services/save/mergeGenshinSave.test.ts` merges a character both copies hold (the higher level's copy, the larger copy count) and keeps one only the guest holds.
- **The enemy respawn timers, once they are saved.** The Enemies component keeps each defeated enemy's instant in memory on the local clock, so a reload resets them. When the save holds them, they are read through the server's offset like the gathering points' respawns.
