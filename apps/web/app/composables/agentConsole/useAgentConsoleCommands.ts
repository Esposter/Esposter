import type { AgentConsoleCommand } from "@/models/agentConsole/AgentConsoleCommand";

import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { AGENT_CONSOLE_COMMAND_GROUP } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";

// A command as the shortcuts dialog lists it, with nothing bound to its key
const toListedCommand = ({ group, id, meaning, shortcut, title }: AgentConsoleCommand): AgentConsoleCommand => ({
  group,
  id,
  meaning,
  shortcut,
  title,
});
// The keys a game's chat and pause take, over the world. Listed in the shortcuts dialog always and bound only while
// The world has the keys, so a key pressed in a dialog over the world stays that dialog's
export const useAgentConsoleCommands = () => {
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { composerText, isPauseMenuOpen, isWorldActive } = storeToRefs(agentConsolePanelStore);
  const { openConsole } = agentConsolePanelStore;
  const openConsoleCommand: AgentConsoleCommand = {
    group: AGENT_CONSOLE_COMMAND_GROUP,
    id: "open-console",
    meaning: UiIconMeaning.Terminal,
    run: () => openConsole(AgentConsolePanelType.Conversation),
    shortcut: "t",
    title: "Open the console",
  };
  const commands: AgentConsoleCommand[] = [
    openConsoleCommand,
    { ...openConsoleCommand, id: "open-console-enter", shortcut: "enter" },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "type-slash-command",
      meaning: UiIconMeaning.SlashCommand,
      run: () => {
        composerText.value = "/";
        return openConsole(AgentConsolePanelType.Conversation);
      },
      shortcut: "slash",
      title: "Type a slash command",
    },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "open-shell",
      meaning: UiIconMeaning.Terminal,
      run: () => openConsole(AgentConsolePanelType.Shell),
      shortcut: "ctrl+`",
      title: "Open a shell",
    },
    {
      group: AGENT_CONSOLE_COMMAND_GROUP,
      id: "pause",
      meaning: UiIconMeaning.Pause,
      run: () => {
        isPauseMenuOpen.value = true;
      },
      shortcut: "escape",
      title: "Pause",
    },
  ];
  useCommands(() => (isWorldActive.value ? commands : commands.map((command) => toListedCommand(command))));
};
