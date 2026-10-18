# Save Data

## Why

A wish grants characters, which the World screen keeps in its roster and copy counts, but no save holds either, so a reload loses every character a wish granted. Companionship EXP is already saved by character id, yet with no character saved it has no character to land on. The roster is the save's next slice, and the saved EXP lands on it.

## What Changes

The save holds the characters the player holds, with their copies and Companionship EXP, and merges them between two copies of a save.

- The roster of held characters and its copy counts are kept with the save, so a reload keeps every character a wish granted.
- A character's Companionship EXP is kept once in the save, by the character's id.
- A guest's save merged into an account keeps one copy of a character both hold: the copy further on by level, then constellations, with the larger copy count.

## Capabilities

- **genshin/save-data** (modified)

## Waiting on

None.

## Impact

The world save gains a characters slice with its read, write and merge. The combat roster starts from the saved roster, the Traveler alone when it is empty, and the session's copy counts start from the saved counts. The save sync writes both back.

Size kept as the source page's own: splitting it is a later decision.
