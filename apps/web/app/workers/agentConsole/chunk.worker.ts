// @TODO: https://webstatus.dev/features/temporal
// A worker has its own global, which the app's polyfill plugin never reaches, and the constants below read Temporal
// While they load — so it polyfills itself, and goes with that plugin once Temporal is Baseline
import "temporal-polyfill/global";

import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";
import type { GeneratedChunk } from "@/models/agentConsole/world/GeneratedChunk";

import { CHUNK_BORDER } from "@/services/agentConsole/world/constants";
import { generateChunk } from "@/services/agentConsole/world/generateChunk";
import { greedyMesh } from "@/services/agentConsole/world/greedyMesh";
import { PaletteRgbs } from "@/services/agentConsole/world/PaletteRgbs";
// Generates and meshes a chunk off the main thread, so neither a frame nor the composer waits on the terrain, and
// Hands its buffers back rather than copying them
self.addEventListener("message", ({ data: { chunkX, chunkZ } }: MessageEvent<ChunkPosition>) => {
  const voxelGrid = generateChunk({ chunkX, chunkZ });
  const voxelMesh = greedyMesh(voxelGrid, PaletteRgbs, CHUNK_BORDER);
  const generatedChunk: GeneratedChunk = { chunkX, chunkZ, voxelGrid, voxelMesh };
  self.postMessage(generatedChunk, {
    transfer: [voxelGrid.voxels.buffer, voxelMesh.colors.buffer, voxelMesh.indices.buffer, voxelMesh.positions.buffer],
  });
});
