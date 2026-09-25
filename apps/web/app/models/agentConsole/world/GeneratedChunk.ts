import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";
import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { VoxelMesh } from "@/models/agentConsole/world/VoxelMesh";

// What the worker hands back for a chunk: its voxels, which collision reads, and its mesh, which is drawn
export interface GeneratedChunk extends ChunkPosition {
  voxelGrid: VoxelGrid;
  voxelMesh: VoxelMesh;
}
