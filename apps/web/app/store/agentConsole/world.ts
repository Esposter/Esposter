import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
// The chunks generated around the player, which the chunks' meshes are built from, the player collides with and the
// Camera's arm is cast through. A lookup is made many times a frame, so it is held raw. Whether the room's door is open
// Changes only when the player uses it, so it is reactive, for the chunks it stands in and its prompt
export const useAgentConsoleWorldStore = defineStore("agentConsole/world", () => {
  const voxelWorld: VoxelWorld = markRaw(new Map());
  const isDoorOpen = ref(false);
  return { isDoorOpen, voxelWorld };
});
