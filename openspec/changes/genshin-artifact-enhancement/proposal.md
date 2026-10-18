# Artifact enhancement

## Why

Rolling, enhancing and locking artifacts are built, along with the set bonuses that act without combat and the conditional four-piece bonuses already written. Adventurer's four-piece bonus is the one left: it answers a chest opened, and no chest is opened in the world yet, so the bonus has nothing to answer.

## What Changes

Adventurer's four-piece bonus takes effect as a chest opens in the world.

- A character wearing four Adventurer's pieces has HP restored by 6% of its maximum each second for 5 seconds when a chest opens.
- The bonus applies only to the character wearing the set, not to other party members.
- A chest opened in the world reaches the combat the same way Mora picked up does.

## Capabilities

- **genshin/artifact-enhancement** (modified)

## Waiting on

- `openspec/changes/genshin-chests/`: a chest opened in the world, which the chests unit's first step provides, since `openChest` is called nowhere yet.

## Impact

- The artifact sets' conditional bonuses in the Genshin world, and the combat's reaction to a chest opened in the world.

Size kept as the source page's own: splitting it is a later decision.
