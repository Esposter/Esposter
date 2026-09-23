import type { UiCommand } from "@/models/ui/UiCommand";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { AGENT_CONSOLE_COMMAND_GROUP } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsolePlayerStore } from "@/store/agentConsole/player";

// A command as the shortcuts dialog lists it, with nothing bound to its key
const toListedCommand = ({ group, id, shortcut, title }: UiCommand): UiCommand => ({ group, id, shortcut, title });
// The keys a game's chat and pause take, over the world. Listed in the shortcuts dialog always and bound only while
// The world has the keys, so a key pressed in a dialog over the world stays that dialog's
export const useAgentConsoleCommands = () => {
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { composerText, isPauseMenuOpen, isWorldActive } = storeToRefs(agentConsolePanelStore);
  const { openConsole } = agentConsolePanelStore;
  const agentConsolePlayerStore = useAgentConsolePlayerStore();
  const { reachableWorldPrompt } = storeToRefs(agentConsolePlayerStore);
  const reachableCommand: UiCommand = {
    group: AGENT_CONSOLE_COMMAND_GROUP,
    id: "use-reachable",
    run: () => reachableWorldPrompt.value?.run(),
    shortcut: "e",
    title: "Use what is in reach",
  };
  const commands: UiCommand[] = [
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "open-console",
      run: () => openConsole(AgentConsolePanelType.Conversation),
      shortcut: "t",
      title: "Open the console",
    },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "open-console-enter",
      run: () => openConsole(AgentConsolePanelType.Conversation),
      shortcut: "enter",
      title: "Open the console",
    },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "type-slash-command",
      run: () => {
        composerText.value = "/";
        return openConsole(AgentConsolePanelType.Conversation);
      },
      shortcut: "/",
      title: "Type a slash command",
    },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "pause",
      run: () => {
        isPauseMenuOpen.value = true;
      },
      shortcut: "escape",
      title: "Pause",
    },
  ];
  // E is bound only while something is in reach, so it is never swallowed with nothing to use
  useCommands(() =>
    isWorldActive.value
      ? [...commands, reachableWorldPrompt.value ? reachableCommand : toListedCommand(reachableCommand)]
      : [...commands, reachableCommand].map((command) => toListedCommand(command)),
  );
};
