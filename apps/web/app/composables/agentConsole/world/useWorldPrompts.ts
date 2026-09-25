import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { DOOR_WORLD_PROMPT_ID } from "@/services/agentConsole/world/constants";
import { useAgentConsoleWorldStore } from "@/store/agentConsole/world";

// Everything in the world a player can use from within reach of it, and what its key does: the door, which opens or closes.
// A prompt acts on the world only; the console is reached from its own button, never from a thing in the room. Each
// Prompt's box is its thing as drawn where it stands now, so the outline and the label over it go with the door
export const useWorldPrompts = () => {
  const agentConsoleWorldStore = useAgentConsoleWorldStore();
  const { doorBox, isDoorOpen } = storeToRefs(agentConsoleWorldStore);
  return computed((): WorldPrompt[] => [
    {
      id: DOOR_WORLD_PROMPT_ID,
      ...doorBox.value,
      run: () => {
        isDoorOpen.value = !isDoorOpen.value;
      },
      title: isDoorOpen.value ? "Close" : "Open",
    },
  ]);
};
