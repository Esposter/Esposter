# Leaderboard

A ranking of players by lifetime points or production, surfacing the social platform around the game.

**Why deferred:** The save is a per-user blob, so ranking needs a queryable score in Postgres — new schema and a write on every save for a game whose state is client-authoritative, which makes the score trivially forgeable. That last part is what a game-specific board cannot get around and the existing one does not have to: an achievement unlock is stamped by the server on a mutation it saw, so its points are earned rather than claimed.

**Revisit when:** there is demand for a game-specific board on top of the one that already exists. The other half of this trigger has fired — [points leaderboard](../../../specs/achievement/points-leaderboard/design.md) ships the global ranking this page was waiting on. Clicker does not feed it: its achievements read the save payload, so they carry no points ([game loop and saves](../../../specs/clicker/game-loop-and-saves/design.md)). So what is left to want is a board ranked on points-per-second or lifetime points, which needs a score the server can verify, and nothing has asked for one.
