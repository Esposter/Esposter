import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { AGENT_CONSOLE_ID } from "@/services/agentConsole/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { SessionStorageKey } from "@/services/shared/SessionStorageKey";
import { useCommandStore } from "@/store/ui/command";

// The console under the world and the tab it is on, the pause menu, the composer's draft, which outlives the tab that
// Shows it, and whether the world has drawn its first frame. Whether the console is open, its tab and its draft are
// Kept through a reload of the page
export const useAgentConsolePanelStore = defineStore("agentConsole/panel", () => {
  const commandStore = useCommandStore();
  const isConsoleOpen = useSessionStorage(SessionStorageKey.IsAgentConsoleOpen, false);
  const isConsoleExpanded = useLocalStorage(LocalStorageKey.AgentConsoleExpanded, false);
  const consoleHeight = useLocalStorage(LocalStorageKey.AgentConsoleHeight, 0);
  // The console holds focus: the reader is typing or reading in it rather than playing in the world beside it
  const activeElement = useActiveElement();
  const isConsoleFocused = computed(
    () => isConsoleOpen.value && Boolean(activeElement.value?.closest(`#${AGENT_CONSOLE_ID}`)),
  );
  // Asks the console to take focus, as opening it does, and as a key that opens it does again while it is open
  const { on: onConsoleFocusRequest, trigger: requestConsoleFocus } = createEventHook();
  const isPauseMenuOpen = ref(false);
  // The world's code has arrived and mounted, and then drawn its first frame: the two steps a loading screen can see
  // In building it, since neither the lazy chunk nor the scene reports any finer progress
  const isWorldLoaded = ref(false);
  const isWorldReady = ref(false);
  const consolePanelType = useSessionStorage(
    SessionStorageKey.AgentConsolePanelType,
    AgentConsolePanelType.Conversation,
  );
  const composerText = useSessionStorage(SessionStorageKey.AgentConsoleComposerText, "");
  // The world has the keys while nothing is open over it and focus is out of the console, the console open beside it
  // Or not: a key then walks, opens the console or pauses, and otherwise it is the console's or the open dialog's
  const isWorldActive = computed(
    () =>
      !isConsoleFocused.value &&
      !isPauseMenuOpen.value &&
      !commandStore.isCommandPaletteOpen &&
      !commandStore.isShortcutsDialogOpen,
  );
  // The tab is chosen a tick before the console opens, so the tab's content is in place when the console moves focus
  // Into it and the composer is found
  const openConsole = async (panelType: AgentConsolePanelType) => {
    consolePanelType.value = panelType;
    await nextTick();
    isConsoleOpen.value = true;
    await requestConsoleFocus();
  };
  return {
    composerText,
    consoleHeight,
    consolePanelType,
    isConsoleExpanded,
    isConsoleFocused,
    isConsoleOpen,
    isPauseMenuOpen,
    isWorldActive,
    isWorldLoaded,
    isWorldReady,
    onConsoleFocusRequest,
    openConsole,
  };
});
