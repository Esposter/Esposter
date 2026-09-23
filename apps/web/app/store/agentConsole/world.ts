import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
// The chunks generated around the player, which the chunks' meshes are built from, the player collides with and the
// Camera's arm is cast through. A lookup is made many times a frame, so it is held raw
export const useAgentConsoleWorldStore = defineStore("agentConsole/world", () => {
  const voxelWorld: VoxelWorld = markRaw(new Map());
  return { voxelWorld };
});
