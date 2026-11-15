# Leaderboard

A ranking of players by lifetime points or production, surfacing the social platform around the game.

## Why not

The save is a per-user blob, so ranking would need a queryable score in D1, a new schema and a write on every save, for a game whose state is client-authoritative. That makes the score trivially forgeable. An achievement unlock is stamped by the server on a mutation it saw, so its points are earned rather than claimed, and the global [points leaderboard](../../../specs/achievement/points-leaderboard/design.md) already ships the ranking this page waited on. Clicker does not feed it, since its achievements read the save payload and carry no points ([game loop and saves](../../../specs/clicker/game-loop-and-saves/design.md)). A board ranked on points per second or lifetime points needs a score the server can verify, and nothing has asked for one.

Reopened when a game-specific board is asked for, on a score the server can verify.
