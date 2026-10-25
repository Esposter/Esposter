import type { AgentConsoleCommand } from "@/models/agentConsole/AgentConsoleCommand";

// A command as the shortcuts dialog lists it, with nothing bound to its key
export const toListedCommand = ({ group, id, meaning, shortcut, title }: AgentConsoleCommand): AgentConsoleCommand => ({
  group,
  id,
  meaning,
  shortcut,
  title,
});
