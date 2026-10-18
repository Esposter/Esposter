# Elemental Sight

## Why

The sight's range, its mute, its element-coloured highlights and the enemies' colours and names are built, but nothing leaves a trail. Bounty targets, Seelie courts and quest clues are the ends the sight should lead a player toward, and until their trails are drawn the sight shows nothing toward an objective.

## What Changes

While Elemental Sight is on, a white ground trail leads the character toward each objective whose end is placed. The Seelies' courts are built; the bounty and quest trails wait on their pages.

- A trail runs on the ground from the character toward its end and stops at the sight's reach.
- A trail is drawn only for an end its page has placed, so no trail points at nothing.
- A trail stays bright while the sight mutes the scene.

## Capabilities

- **genshin/elemental-sight** (modified)

## Waiting on

- `openspec/changes/genshin-reputation/`: a bounty's target, for the bounty trails.
- `openspec/changes/genshin-quests/`: the go-to places a quest names, for the clue trails.

## Impact

The world's sight service gains a trail computation, and the sight's lit scene draws each trail as a ribbon. The Windrise and session components hand the trails their ends. The trail's step, width and fade are provisional constants until the owed recording measures them.
