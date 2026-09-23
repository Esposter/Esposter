import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { DOOR_OPEN_ANGLE, DOOR_STAND_POSITION } from "@/services/agentConsole/world/constants";
import { getDoorBox } from "@/services/agentConsole/world/getDoorBox";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";
// Everything in the world a player can use by standing at it, and what its key does: the door, which opens or closes.
// A prompt acts on the world only; the console is reached from its own button, never from a thing in the room. Each
// Prompt's box is its thing as drawn where it stands now, so the outline and the label over it go with the door
export const useWorldPrompts = () => {
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { isDoorOpen } = storeToRefs(agentConsoleWorldStore);
  return computed((): WorldPrompt[] => [
    {
      id: "door",
      ...getDoorBox(isDoorOpen.value ? DOOR_OPEN_ANGLE : 0),
      run: () => {
        isDoorOpen.value = !isDoorOpen.value;
      },
      standPosition: DOOR_STAND_POSITION,
      title: isDoorOpen.value ? "Close" : "Open",
    },
  ]);
};
