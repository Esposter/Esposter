import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { createPlayerState } from "@/services/agentConsole/world/createPlayerState";

// Where the player is, which the figure moves, the camera follows and reach is measured from. It changes every frame,
// So it is held raw: a frame writes it without re-rendering anything. What is in reach changes only as the player
// Walks up to a thing or away, so it is reactive, for the prompt and its key
export const useAgentConsolePlayerStore = defineStore("agentConsole/player", () => {
  const playerState = markRaw(createPlayerState());
  const reachableWorldPrompt = shallowRef<WorldPrompt>();
  return { playerState, reachableWorldPrompt };
});
