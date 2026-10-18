# Resident schedules

## Why

The game's residents keep hours: a vendor sells by day, a guard keeps a post, and some people appear only at night. The world's clock and the rule for placing residents are built, but residents do not yet keep the game's day and night spots, Nod-Krai has no residents, and vendors do not follow their hours.

## What Changes

Residents keep the game's hours, moving between their day and night spots as the clock turns, and vendors sell only in theirs.

- A resident with a night spot stands there from seven in the evening to six in the morning, and at their day spot otherwise.
- A resident moves at the turn of the hour only while out of the player's view, so nobody is seen to jump.
- A resident is absent at night only where the game's record marks them absent by day alone; none is marked yet.
- Each resident's spot is read from the world's clock every frame, so a change of time moves them.
- Nod-Krai's residents and their night spots come from the wiki's NPC pages.
- A vendor sells only while standing at their spot in their hours.

## Capabilities

- **genshin/resident-schedules** (modified)

## Waiting on

- The vendors' hours wait on the shops, once they sell: `openspec/changes/genshin-shops/`.
- Nod-Krai's residents and their night spots wait on the wiki's NPC pages being read beside the game's NPC births; nothing is built until they are read.

## Impact

Where residents stand through the day and night, the effect of the Time screen on them, Nod-Krai's residents in the world, and the vendors' sales in their hours.

Size kept as the source page's own: splitting it is a later decision.
