import type { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
// The one panel open over the world, which an object in it or its button in the heads-up display opens, whether the
// World has the whole page to itself, and whether it has drawn its first frame
export const useAgentConsolePanelStore = defineStore("agentConsole/panel", () => {
  const isWorldExpanded = ref(false);
  const isWorldReady = ref(false);
  const openedPanelType = ref<"" | AgentConsolePanelType>("");
  return { isWorldExpanded, isWorldReady, openedPanelType };
});
