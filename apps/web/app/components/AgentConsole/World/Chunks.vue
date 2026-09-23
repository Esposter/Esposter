<script setup lang="ts">
import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";
import type { GeneratedChunk } from "@/models/agentConsole/world/GeneratedChunk";
import type { Group } from "three";

import { CHUNK_BORDER, CHUNK_SIZE, RENDER_DISTANCE } from "@/services/agentConsole/world/constants";
import { createVoxelMeshGeometry } from "@/services/agentConsole/world/createVoxelMeshGeometry";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
import ChunkWorker from "@/workers/agentConsole/chunk.worker?worker";
import { Mesh, MeshBasicMaterial } from "three";

const { onBeforeRender } = useLoop();
const agentConsolePlayerStore = useAgentConsolePlayerStore();
const { playerState } = agentConsolePlayerStore;
const agentConsoleWorldStore = useAgentConsoleWorldStore();
const { voxelWorld } = agentConsoleWorldStore;
const chunks = useTresTemplateRef<Group>("chunks");
const material = new MeshBasicMaterial({ vertexColors: true });
// Each chunk's mesh stands at its chunk's corner, so its position is its chunk's position in voxels
const chunkMeshes = new Map<number, Mesh>();
// The chunks asked of the worker and not back yet, so none is asked for twice
const requestedChunkKeys = new Set<number>();
const worker = new ChunkWorker();
// The chunk the player stood in when the chunks around it were last settled
let centerChunkX = 0;
let centerChunkZ = 0;
let isSettled = false;
const checkIsInRange = (chunkX: number, chunkZ: number, distance: number) =>
  Math.max(Math.abs(chunkX - centerChunkX), Math.abs(chunkZ - centerChunkZ)) <= distance;

worker.addEventListener(
  "message",
  ({ data: { chunkX, chunkZ, voxelGrid, voxelMesh } }: MessageEvent<GeneratedChunk>) => {
    const chunkKey = getChunkKey(chunkX, chunkZ);
    requestedChunkKeys.delete(chunkKey);
    // Thrown away if the player walked out of its range before it came back
    if (!chunks.value || !checkIsInRange(chunkX, chunkZ, RENDER_DISTANCE + 1)) return;
    voxelWorld.set(chunkKey, voxelGrid);
    const geometry = createVoxelMeshGeometry(voxelMesh).translate(-CHUNK_BORDER, 0, -CHUNK_BORDER);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
    chunks.value.add(mesh);
    chunkMeshes.set(chunkKey, mesh);
  },
);
// Only once the player crosses into another chunk: the chunks within the render distance it lacks are asked for,
// Nearest first, and those a chunk past it are dropped, so a frame spent inside one chunk does nothing
onBeforeRender(() => {
  const chunkX = Math.floor(playerState.position.x / CHUNK_SIZE);
  const chunkZ = Math.floor(playerState.position.z / CHUNK_SIZE);
  if (isSettled && chunkX === centerChunkX && chunkZ === centerChunkZ) return;
  centerChunkX = chunkX;
  centerChunkZ = chunkZ;
  isSettled = true;

  for (const [chunkKey, mesh] of chunkMeshes) {
    if (checkIsInRange(mesh.position.x / CHUNK_SIZE, mesh.position.z / CHUNK_SIZE, RENDER_DISTANCE + 1)) continue;
    chunks.value?.remove(mesh);
    mesh.geometry.dispose();
    chunkMeshes.delete(chunkKey);
    voxelWorld.delete(chunkKey);
  }

  const missingChunkPositions: ChunkPosition[] = [];
  for (let missingChunkZ = chunkZ - RENDER_DISTANCE; missingChunkZ <= chunkZ + RENDER_DISTANCE; missingChunkZ++)
    for (let missingChunkX = chunkX - RENDER_DISTANCE; missingChunkX <= chunkX + RENDER_DISTANCE; missingChunkX++) {
      const chunkKey = getChunkKey(missingChunkX, missingChunkZ);
      if (!voxelWorld.has(chunkKey) && !requestedChunkKeys.has(chunkKey))
        missingChunkPositions.push({ chunkX: missingChunkX, chunkZ: missingChunkZ });
    }

  const sortedChunkPositions = missingChunkPositions.toSorted(
    (first, second) =>
      Math.hypot(first.chunkX - chunkX, first.chunkZ - chunkZ) -
      Math.hypot(second.chunkX - chunkX, second.chunkZ - chunkZ),
  );
  for (const chunkPosition of sortedChunkPositions) {
    requestedChunkKeys.add(getChunkKey(chunkPosition.chunkX, chunkPosition.chunkZ));
    worker.postMessage(chunkPosition);
  }
});

onUnmounted(() => {
  worker.terminate();
  for (const mesh of chunkMeshes.values()) mesh.geometry.dispose();
  material.dispose();
  voxelWorld.clear();
});
</script>

<template>
  <TresGroup ref="chunks" />
</template>
