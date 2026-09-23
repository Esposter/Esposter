import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { DOOR_CLOSED_BOX, DOOR_STAND_POSITION } from "@/services/agentConsole/world/constants";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
// Everything in the world a player can use by standing at it, and what its key does: the door, which opens or closes.
// A prompt acts on the world only; the console is reached from its own button, never from a thing in the room
export const useWorldPrompts = () => {
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
  // The door is outlined in its opening whichever way it stands, so it is used from either side of the wall
  return computed((): WorldPrompt[] => [
    {
      id: "door",
      max: [DOOR_CLOSED_BOX.max[0] + 1, DOOR_CLOSED_BOX.max[1] + 1, DOOR_CLOSED_BOX.max[2] + 1],
      min: DOOR_CLOSED_BOX.min,
      run: () => {
        isDoorOpen.value = !isDoorOpen.value;
      },
      standPosition: DOOR_STAND_POSITION,
      title: isDoorOpen.value ? "Close" : "Open",
    },
  ]);
};
