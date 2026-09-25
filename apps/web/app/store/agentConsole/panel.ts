import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { useCommandStore } from "@/store/ui/command";

// The console over the world and the tab it is on, the pause menu, the composer's draft, which outlives the tab that
// Shows it, and whether the world has drawn its first frame
export const useAgentConsolePanelStore = defineStore("agentConsole/panel", () => {
  const commandStore = useCommandStore();
  const isConsoleOpen = ref(false);
  const isPauseMenuOpen = ref(false);
  // The world's code has arrived and mounted, and then drawn its first frame: the two steps a loading screen can see
  // In building it, since neither the lazy chunk nor a generated room reports any finer progress
  const isWorldLoaded = ref(false);
  const isWorldReady = ref(false);
  const consolePanelType = ref(AgentConsolePanelType.Conversation);
  const composerText = ref("");
  // The world has the keys while nothing is open over it: a key then walks, opens the console or pauses, and
  // Otherwise it is the open dialog's
  const isWorldActive = computed(
    () =>
      !isConsoleOpen.value &&
      !isPauseMenuOpen.value &&
      !commandStore.isCommandPaletteOpen &&
      !commandStore.isShortcutsDialogOpen,
  );
  // The tab is chosen a tick before the dialog opens, so the tab's content is in place when the browser moves focus
  // Into the dialog and the composer's autofocus is honoured
  const openConsole = async (panelType: AgentConsolePanelType) => {
    consolePanelType.value = panelType;
    await nextTick();
    isConsoleOpen.value = true;
  };
  return {
    composerText,
    consolePanelType,
    isConsoleOpen,
    isPauseMenuOpen,
    isWorldActive,
    isWorldLoaded,
    isWorldReady,
    openConsole,
  };
});
