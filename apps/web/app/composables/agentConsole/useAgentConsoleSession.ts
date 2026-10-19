import type { AgentConsoleSession } from "@/models/agentConsole/AgentConsoleSession";

import { createSessionReads } from "@/services/agentConsole/createSessionReads";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { useAgentConsoleSideChatStore } from "@/store/agentConsole/sideChat";

// The session a component reads: the side chat's in the drawer, and the console's current session elsewhere, each
// With the composer draft of the part that reads it
export const useAgentConsoleSession = (isSideChat?: true): AgentConsoleSession => {
  const agentConsoleSessionStore = useAgentConsoleSessionStore();
  if (isSideChat) {
    const agentConsoleSideChatStore = useAgentConsoleSideChatStore();
    const { sideChatComposerText, sideChatSessionId } = storeToRefs(agentConsoleSideChatStore);
    const { sessions } = storeToRefs(agentConsoleSessionStore);
    const { getDataRef } = agentConsoleSessionStore;
    return {
      ...createSessionReads(sideChatSessionId, getDataRef, sessions),
      composerText: sideChatComposerText,
      sessionId: sideChatSessionId,
    };
  }

  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { composerText } = storeToRefs(agentConsolePanelStore);
  const { currentSessionId: sessionId, ...reads } = storeToRefs(agentConsoleSessionStore);
  return { ...reads, composerText, sessionId };
};
