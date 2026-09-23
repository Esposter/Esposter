<script setup lang="ts">
import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";
import type { ChunkRequest } from "@/models/agentConsole/world/ChunkRequest";
import type { GeneratedChunk } from "@/models/agentConsole/world/GeneratedChunk";
import type { Group } from "three";

import { CHUNK_SIZE, MAX_REQUESTED_CHUNK_COUNT } from "@/services/agentConsole/world/constants";
import { createVoxelMeshGeometry } from "@/services/agentConsole/world/createVoxelMeshGeometry";
import { DoorChunkPositions } from "@/services/agentConsole/world/DoorChunkPositions";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
import { getViewReach } from "@/services/agentConsole/world/getViewReach";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
import ChunkWorker from "@/workers/agentConsole/chunk.worker?worker";
import { Mesh, MeshBasicMaterial } from "three";

const { onBeforeRender } = useLoop();
const agentConsolePlayerStore = useAgentConsolePlayerStore();
const { playerState } = agentConsolePlayerStore;
const agentConsoleWorldStore = useAgentConsoleWorldStore();
const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
const { voxelWorld } = agentConsoleWorldStore;
const chunks = useTresTemplateRef<Group>("chunks");
const material = new MeshBasicMaterial({ vertexColors: true });
// Each chunk's mesh stands at its chunk's corner, so its position is its chunk's position in voxels
const chunkMeshes = new Map<number, Mesh>();
// The chunks asked of the worker and not back yet, so none is asked for twice
const requestedChunkKeys = new Set<number>();
// The chunks in range still to ask for, the most wanted last. The worker is handed only a few at a time, so one the
// Player has left behind before its turn is never generated
let queuedChunkPositions: ChunkPosition[] = [];
const worker = new ChunkWorker();
// The chunk the player stood in when the chunks around it were last settled, and how many chunks out from its edge
// The camera could see then
let centerChunkX = 0;
let centerChunkZ = 0;
let loadDistance = 0;
let isSettled = false;
// How many chunks lie between a chunk and the player's own, edge to edge, so wherever in its chunk the player stands,
// Nothing in a chunk this far out is nearer than this many chunks' width
const getChunkGap = (chunkX: number, chunkZ: number) =>
  Math.hypot(Math.max(Math.abs(chunkX - centerChunkX) - 1, 0), Math.max(Math.abs(chunkZ - centerChunkZ) - 1, 0));
const requestChunk = ({ chunkX, chunkZ }: ChunkPosition) => {
  requestedChunkKeys.add(getChunkKey(chunkX, chunkZ));
  const chunkRequest: ChunkRequest = { chunkX, chunkZ, isDoorOpen: isDoorOpen.value };
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  worker.postMessage(chunkRequest);
};
const requestQueuedChunks = () => {
  while (requestedChunkKeys.size < MAX_REQUESTED_CHUNK_COUNT) {
    const chunkPosition = queuedChunkPositions.pop();
    if (!chunkPosition) return;
    const chunkKey = getChunkKey(chunkPosition.chunkX, chunkPosition.chunkZ);
    if (!voxelWorld.has(chunkKey) && !requestedChunkKeys.has(chunkKey)) requestChunk(chunkPosition);
  }
};

worker.addEventListener(
  "message",
  ({ data: { chunkX, chunkZ, voxelGrid, voxelMesh } }: MessageEvent<GeneratedChunk>) => {
    const chunkKey = getChunkKey(chunkX, chunkZ);
    requestedChunkKeys.delete(chunkKey);
    // The worker starts on the next chunk while this one's mesh is built
    requestQueuedChunks();
    // Thrown away if the player walked out of its range before it came back
    if (!chunks.value || getChunkGap(chunkX, chunkZ) >= loadDistance + 1) return;
    voxelWorld.set(chunkKey, voxelGrid);
    // A chunk generated again, around the door, takes its old mesh's place
    const oldMesh = chunkMeshes.get(chunkKey);
    if (oldMesh) {
      chunks.value.remove(oldMesh);
      oldMesh.geometry.dispose();
    }
    const geometry = createVoxelMeshGeometry(voxelMesh);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
    chunks.value.add(mesh);
    chunkMeshes.set(chunkKey, mesh);
  },
);
// Only once the player crosses into another chunk, or the camera comes to see a chunk further or nearer: the chunks
// Within what it can see are queued, those ahead of the camera and near the player first, and those a chunk past it
// Are dropped, so a frame spent inside one chunk under one view measures the view and does nothing else
onBeforeRender(({ camera }) => {
  if (!camera.value) return;
  const chunkX = Math.floor(playerState.position.x / CHUNK_SIZE);
  const chunkZ = Math.floor(playerState.position.z / CHUNK_SIZE);
  const viewReach = getViewReach(camera.value, playerState.position);
  const viewLoadDistance = Math.ceil(viewReach / CHUNK_SIZE);
  if (isSettled && chunkX === centerChunkX && chunkZ === centerChunkZ && viewLoadDistance === loadDistance) return;
  centerChunkX = chunkX;
  centerChunkZ = chunkZ;
  loadDistance = viewLoadDistance;
  isSettled = true;

  for (const [chunkKey, mesh] of chunkMeshes) {
    if (getChunkGap(mesh.position.x / CHUNK_SIZE, mesh.position.z / CHUNK_SIZE) < loadDistance + 1) continue;
    chunks.value?.remove(mesh);
    mesh.geometry.dispose();
    chunkMeshes.delete(chunkKey);
    voxelWorld.delete(chunkKey);
  }

  const missingChunkPositions: ChunkPosition[] = [];
  for (let missingChunkZ = chunkZ - loadDistance; missingChunkZ <= chunkZ + loadDistance; missingChunkZ++)
    for (let missingChunkX = chunkX - loadDistance; missingChunkX <= chunkX + loadDistance; missingChunkX++) {
      const chunkKey = getChunkKey(missingChunkX, missingChunkZ);
      if (
        getChunkGap(missingChunkX, missingChunkZ) < loadDistance &&
        !voxelWorld.has(chunkKey) &&
        !requestedChunkKeys.has(chunkKey)
      )
        missingChunkPositions.push({ chunkX: missingChunkX, chunkZ: missingChunkZ });
    }
  // The camera looks along the way it faces across the ground, and a chunk ahead of it is wanted sooner than one as
  // Near behind it
  const forwardX = -Math.sin(playerState.cameraAzimuth);
  const forwardZ = -Math.cos(playerState.cameraAzimuth);
  const getUrgency = ({ chunkX: otherChunkX, chunkZ: otherChunkZ }: ChunkPosition) => {
    const offsetX = otherChunkX - chunkX;
    const offsetZ = otherChunkZ - chunkZ;
    return (offsetX * forwardX + offsetZ * forwardZ) / 2 - Math.hypot(offsetX, offsetZ);
  };
  queuedChunkPositions = missingChunkPositions.toSorted((first, second) => getUrgency(first) - getUrgency(second));
  requestQueuedChunks();
});
// Opening or closing the door generates the chunks it stands in again, so its voxels, and so what the player collides
// With, follow it
watch(isDoorOpen, () => {
  for (const chunkPosition of DoorChunkPositions) requestChunk(chunkPosition);
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
