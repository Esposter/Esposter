import { AGENT_CONSOLE_PANE_DEFAULT_WIDTH } from "@/services/agentConsole/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// The app pages open in the console's side pane, one tab each, and the tab on show. The pages are kept while the page
// Is open rather than through a reload, since a reload would rebuild every frame anyway
export const useAgentConsolePaneStore = defineStore("agentConsole/pane", () => {
  const pagePaths = ref<string[]>([]);
  const currentPagePath = ref("");
  const paneWidth = useLocalStorage(LocalStorageKey.AgentConsolePaneWidth, AGENT_CONSOLE_PANE_DEFAULT_WIDTH);
  const isPaneOpen = computed(() => pagePaths.value.length > 0);
  // A page already open is shown rather than opened a second time
  const openPage = (path: string) => {
    if (!pagePaths.value.includes(path)) pagePaths.value = [...pagePaths.value, path];
    currentPagePath.value = path;
  };
  // Closing the tab on show moves to the one opened last, and closing the last tab closes the pane
  const closePage = (path: string) => {
    pagePaths.value = pagePaths.value.filter((pagePath) => pagePath !== path);
    if (currentPagePath.value === path) currentPagePath.value = pagePaths.value.at(-1) ?? "";
  };
  return { closePage, currentPagePath, isPaneOpen, openPage, pagePaths, paneWidth };
});
