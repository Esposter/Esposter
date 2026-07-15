---
title: All-building upgrades
description: Deferred — upgrade lines for the 17 buildings that have none, blocked on per-upgrade icon art.
---

# All-Building Upgrades

Give every building an upgrade line. Only Cursor and Grandma have one today, so from the Farm tier onward the store's upgrade section runs dry and the mid/late game loses its second purchase axis — buildings alone reduce it to "buy the biggest number".

The mechanics are pure content: the effect engine, unlock evaluation, and store UI already handle arbitrary upgrades. Each building needs a `<Building>UpgradeMap` merged into `UpgradeMap`, following the Cookie Clicker ladder — five `Multiplicative` value-2 upgrades unlocking at owned-count thresholds 1/5/25/50/100, priced at roughly 10× the building price at that threshold.

## Why deferred

Icon art, not mechanics. Upgrade rows key their icon off the upgrade id (`app/assets/clicker/icons/upgrades/<building>/<Upgrade Name>.png`), so the ladder needs **83 new icons** — one per upgrade across the 17 buildings. Without them every new row renders an empty icon slot.

Substituting a stand-in — the owning building's icon, or a generic mdi glyph — was considered and rejected. Clicker is a Cookie Clicker clone and uses its icon set, where every upgrade carries its own art; a repeated or generic icon is not that design, and shipping one would bank the content at the cost of the thing the game is imitating.

## Revisit when

The 83 upgrade icons exist. The content maps are mechanical to rewrite once they do, and nothing else blocks: `mergeObjectsStrict` fails the build on id collisions, and saves are normalized to ids ([game loop and saves](/docs/clicker/game-loop-and-saves)), so shipped content stays rebalanceable afterwards.

## Notes

- `ClickerCompletionist` ("buy every upgrade") reads `Object.keys(UpgradeMap)` dynamically, so it needs no change when the lines land — it simply gets harder.
- The effect engine's `BuildingAdditive`/`BuildingAdditiveNor` types already support cross-building synergy upgrades (Cursor's "Thousand fingers" line demonstrates it), so those can follow the same way.
