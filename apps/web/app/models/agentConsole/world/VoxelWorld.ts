import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

// The chunks generated around the player, each under `getChunkKey` of its position, its grid holding its border of its
// Neighbours' voxels as well as its own
export type VoxelWorld = Map<number, VoxelGrid>;
