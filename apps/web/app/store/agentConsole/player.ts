import { createPlayerState } from "@/services/agentConsole/world/createPlayerState";
// Where the player is, which the figure moves, the camera follows and the prompts measure reach from. It changes every
// Frame, so it is held raw: a frame writes it without re-rendering anything
export const useAgentConsolePlayerStore = defineStore("agentConsole/player", () => {
  const playerState = markRaw(createPlayerState());
  return { playerState };
});
