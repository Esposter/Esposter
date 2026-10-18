# Reputation

## Why

Mondstadt's Reputation levels, its reward page and the three-a-week claim limit are shipped as data and rules, but nothing puts them in the world. Without a keeper, requests, bounties, exploration counts or discounts, the player has no way to earn Reputation.

## What Changes

Mondstadt's keeper stands in the world and gives the player ways to earn Reputation, and each later nation follows once its region is built.

- Talking to Mondstadt's keeper opens the Reputation screen with its level, EXP toward the next, each level's reward and its four sources.
- From level 2 the keeper offers requests, run as world quests that pay Reputation EXP and Mora.
- From level 2 (level 1 in Natlan) the keeper offers bounties: the player finds the target's trail, defeats the target and claims the bounty back with the keeper.
- Exploration thresholds and Reputation quests raise Reputation, each paying once.
- Discounts apply at the named shops once the shops have a screen.
- Natlan's supply notices take donated items, three a week shared between tribes, each donation giving 160 Reputation EXP to its tribe and a Sanctifying Unction.

## Capabilities

- **genshin/reputation** (modified)

## Waiting on

- Bounties' trails are drawn by Elemental Sight, which waits on the puzzles unit: `openspec/changes/genshin-elemental-sight/` and `openspec/changes/genshin-puzzles/`.
- Discounts wait on the shops' screen: `openspec/changes/genshin-shops/`.
- Reputation quests wait on the quest reader carrying them: `openspec/changes/genshin-quests/`.
- Later nations, Natlan's tribes among them, wait on their regions being built: `openspec/changes/genshin-natlan/`.

## Impact

The keeper in Mondstadt, the Reputation screen, the world quests that requests run as, bounty targets and their trails, exploration's Reputation thresholds, shop discounts, and Natlan's supply notices.

Size kept as the source page's own: splitting it is a later decision.
