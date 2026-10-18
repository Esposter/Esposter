# Prestige

An ascension mechanic: voluntarily reset buildings/upgrades/points in exchange for a permanent production multiplier that compounds across runs.

**Why deferred:** Prestige only matters once players exhaust a run — but with upgrades existing for only a couple of buildings, no one reaches a wall worth resetting at. The save-schema question it forces (a prestige currency field) is cheap on the normalized id-based save ([game loop and saves](../../../specs/clicker/game-loop-and-saves/design.md)), but the content ceiling still isn't.

**Revisit when:** [all-building upgrades](../all-building-upgrades/design.md) has shipped and the content ceiling is actually reachable.
