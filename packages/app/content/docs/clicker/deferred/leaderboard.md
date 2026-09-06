---
title: Leaderboard
description: Cross-user ranking by clicker progress.
---

# Leaderboard

A ranking of players by lifetime points or production, surfacing the social platform around the game.

**Why deferred:** The save is a per-user blob, so ranking needs a queryable score in Postgres — new schema and a write on every save for a game whose state is client-authoritative, which makes the score trivially forgeable. That last part is what a game-specific board cannot get around and the existing one does not have to: an achievement unlock is stamped by the server on a mutation it saw, so its points are earned rather than claimed.

**Revisit when:** there is demand for a game-specific board on top of the one that already exists. The other half of this trigger has fired — [points leaderboard](/docs/achievements/points-leaderboard) ships the global ranking this page was waiting on, and clicker feeds it through the ten achievements on `clicker.saveClicker` ([game loop and saves](/docs/clicker/game-loop-and-saves)). So what is left to want is a board ranked on points-per-second or lifetime points rather than on unlocks, and nothing has asked for one.
