---
title: One instanced terrain draw
description: The whole visible ground in one instanced draw, every tile the same grid displaced by a height texture array — deferred while a tile per mesh keeps the draws within the budget.
---

# One instanced terrain draw

The terrain proposal drew the whole visible ground as one instanced draw: every tile the same small grid, displaced in the vertex stage by a height texture array the workers stream into, with an indirection table from a tile's key to its layer.

**Why deferred:** A tile per mesh is simpler to stream, since a tile's arrays become a geometry as they arrive, and the view holds a few dozen tiles, each sharing one material and one index buffer. That is within the engine's budget of tens of draws, and the shadow cascades cull most tiles for themselves.

**Revisit when:** the terrain's draws show in a frame's cost on the lowest tier, or a region's view holds so many tiles that the draws leave the tens.
