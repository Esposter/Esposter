import type { AgentConsoleSession } from "@/models/agentConsole/AgentConsoleSession";

import { AGENT_CONSOLE_SESSION_KEY } from "@/services/agentConsole/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";

// The session the calling part of the console reads: the side chat's where its drawer provides one, and the console's
// Current session otherwise, with the console's own composer draft
export const useAgentConsoleSession = (): AgentConsoleSession =>
  inject(
    AGENT_CONSOLE_SESSION_KEY,
    () => {
      const agentConsolePanelStore = useAgentConsolePanelStore();
      const { composerText } = storeToRefs(agentConsolePanelStore);
      const agentConsoleSessionStore = useAgentConsoleSessionStore();
      const { currentSessionId: sessionId, ...reads } = storeToRefs(agentConsoleSessionStore);
      return { ...reads, composerText, sessionId };
    },
    true,
  );
