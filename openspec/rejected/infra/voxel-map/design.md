# Voxel map

The proposal put a minimap in the corner of the voxel world, turned with the camera, and a full map over the world on M. Both were drawn from the terrain seed in the chunk worker a column at a time, so the player could find the room again once the open world had taken them away from it.

**Why not:** The chunk worker, the seed and the room are gone with the voxel world. The console's world is the [Genshin](../../../changes/genshin-program/design.md) recreation, whose map is drawn from its region catalogue: the [world map](../../../specs/genshin/world-map/design.md) sets the coordinates and landmarks, and [exploring](../../../changes/genshin-exploring/design.md) draws the overlay on M the way the game does.
