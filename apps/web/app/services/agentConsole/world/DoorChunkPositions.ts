import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";

import { CHUNK_BORDER, CHUNK_SIZE, DOOR_CLOSED_BOX, DOOR_OPEN_BOX } from "@/services/agentConsole/world/constants";

const doorBoxes = [DOOR_CLOSED_BOX, DOOR_OPEN_BOX];
const getChunkRange = (axis: number) => {
  const minChunk = Math.floor((Math.min(...doorBoxes.map(({ min }) => min[axis] ?? 0)) - CHUNK_BORDER) / CHUNK_SIZE);
  const maxChunk = Math.floor((Math.max(...doorBoxes.map(({ max }) => max[axis] ?? 0)) + CHUNK_BORDER) / CHUNK_SIZE);
  return Array.from({ length: maxChunk - minChunk + 1 }, (_, index) => minChunk + index);
};
// Every chunk whose grid holds a voxel of the door open or closed, its border included: the chunks generated again
// Whenever the door is opened or closed
export const DoorChunkPositions: ChunkPosition[] = getChunkRange(0).flatMap((chunkX) =>
  getChunkRange(2).map((chunkZ) => ({ chunkX, chunkZ })),
);
