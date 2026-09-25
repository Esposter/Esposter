import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";

import { DOOR_OPEN_ANGLE } from "@/services/agentConsole/world/constants";
import { getDoorBox } from "@/services/agentConsole/world/getDoorBox";

// The chunks generated around the player, which the chunks' meshes are built from, the player collides with and the
// Camera's arm is cast through. A lookup is made many times a frame, so it is held raw. Whether the room's door is open
// Changes only when the player uses it, so it is reactive, for its swing, its prompt and the box it collides as. The
// World's boxes are everything drawn apart from the voxels that the player collides with
export const useAgentConsoleWorldStore = defineStore("agentConsole/world", () => {
  const voxelWorld: VoxelWorld = markRaw(new Map());
  const isDoorOpen = ref(false);
  const doorBox = computed(() => getDoorBox(isDoorOpen.value ? DOOR_OPEN_ANGLE : 0));
  const worldBoxes = computed(() => [doorBox.value]);
  return { doorBox, isDoorOpen, voxelWorld, worldBoxes };
});
