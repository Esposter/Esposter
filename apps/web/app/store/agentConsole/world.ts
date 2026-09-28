import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
import type { WorldBox } from "@/models/agentConsole/world/WorldBox";

import { DOOR_OPEN_ANGLE } from "@/services/agentConsole/world/constants";
import { getDoorBox } from "@/services/agentConsole/world/getDoorBox";

// The chunks generated around the player, which the chunks' meshes are built from, the player collides with and the
// Camera's arm is cast through. A lookup is made many times a frame, so it is held raw. Whether the room's door is open
// Changes only when the player uses it, so it is reactive, for its swing, its prompt and the box it collides as. The
// World's boxes are everything drawn apart from the voxels that the player collides with: the door, and each box a
// Component drawing something else holds here under its own id while it is mounted
export const useAgentConsoleWorldStore = defineStore("agentConsole/world", () => {
  const voxelWorld: VoxelWorld = markRaw(new Map());
  const isDoorOpen = ref(false);
  const doorBox = computed(() => getDoorBox(isDoorOpen.value ? DOOR_OPEN_ANGLE : 0));
  // Shallow, so a box read many times a frame is the plain one written rather than a proxy of it
  const objectBoxMap = shallowReactive(new Map<string, WorldBox>());
  const worldBoxes = computed(() => [doorBox.value, ...objectBoxMap.values()]);
  return { doorBox, isDoorOpen, objectBoxMap, voxelWorld, worldBoxes };
});
