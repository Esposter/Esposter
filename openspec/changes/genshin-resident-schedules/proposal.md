# Resident schedules

## Why

The game's residents keep hours: a vendor sells by day, a guard keeps a post, and some people appear only at night. The world's clock and the rule for placing residents are built, but residents do not yet keep the game's day and night spots, Nod-Krai has no residents, and vendors do not follow their hours.

## What Changes

Residents keep the game's hours, moving between their day and night spots as the clock turns, and vendors sell only in theirs.

- A resident with a night spot stands there from seven in the evening to six in the morning, and at their day spot otherwise.
- A resident moves at the turn of the hour only while out of the player's view, so nobody is seen to jump.
- A resident is absent at night only where the game's record marks them absent by day alone; none is marked yet.
- Each resident's spot is read from the world's clock every frame, so a change of time moves them.
- Nod-Krai's residents wait on the NPC placements missing from the scene-group export, and the wiki's NPC pages give their hours only.
- A vendor sells only while standing at their spot in their hours.

## Capabilities

- **genshin/resident-schedules** (modified)

## Waiting on

- The vendors' hours (task 3.1) wait on this change's x-touches being widened to the shop service and the Session. The shops they waited on have landed: `openspec/changes/genshin-shops/`.
- Nod-Krai's residents wait on their placements in the scene-group record: no Nod-Krai NPC is placed there, so `packages/genshin-world/src/data/regions/nod-krai.json` keeps its `residents` empty. The wiki's NPC pages give hours but no positions, so they do not unblock it; nothing is built until the record places them.

## Impact

Where residents stand through the day and night, the effect of the Time screen on them, Nod-Krai's residents in the world, and the vendors' sales in their hours.
