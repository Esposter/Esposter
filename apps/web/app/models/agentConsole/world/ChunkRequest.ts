import type { ChunkPosition } from "@/models/agentConsole/world/ChunkPosition";
// What the worker is asked to generate: a chunk, and whether the room's door is open, which the chunks around the door
// Are generated again for whenever it is opened or closed
export interface ChunkRequest extends ChunkPosition {
  isDoorOpen: boolean;
}
