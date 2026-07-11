---
title: Leaderboard
description: Cross-user ranking by clicker progress.
---

# Leaderboard

A ranking of players by lifetime points or production, surfacing the social platform around the game.

**Why deferred:** The save is a per-user blob, so ranking needs a queryable score in Postgres — new schema and a write on every save for a game whose state is client-authoritative (trivially forgeable scores). Achievement points already provide a light cross-user comparison surface without new infrastructure.

**Revisit when:** achievements grow a global points leaderboard (the natural first ranking surface) and there's demand for a game-specific one on top.
