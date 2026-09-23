import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { DOOR_CLOSED_BOX, DOOR_OPEN_BOX, DOOR_STAND_POSITION } from "@/services/agentConsole/world/constants";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
// Everything in the world a player can use by standing at it, and what its key does: the door, which opens or closes.
// A prompt acts on the world only; the console is reached from its own button, never from a thing in the room. Each
// Prompt's box is where its thing stands now, so the outline and the label over it go with the door as it swings
export const useWorldPrompts = () => {
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
  return computed((): WorldPrompt[] => {
    const { max, min } = isDoorOpen.value ? DOOR_OPEN_BOX : DOOR_CLOSED_BOX;
    return [
      {
        id: "door",
        max: [max[0] + 1, max[1] + 1, max[2] + 1],
        min,
        run: () => {
          isDoorOpen.value = !isDoorOpen.value;
        },
        standPosition: DOOR_STAND_POSITION,
        title: isDoorOpen.value ? "Close" : "Open",
      },
    ];
  });
};
