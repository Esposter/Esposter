import type { SideChatQuestion } from "@/models/agentConsole/SideChatQuestion";

// The side chat drawer beside the conversation: whether it is open, the fork it asks through, and the question held
// until that fork has opened. None of it is kept through a reload, since closing the drawer discards it
export const useAgentConsoleSideChatStore = defineStore("agentConsole/sideChat", () => {
  const isSideChatOpen = ref(false);
  const sideChatSessionId = ref("");
  const sideChatConnectionId = ref("");
  const pendingQuestion = shallowRef<SideChatQuestion>();
  return { isSideChatOpen, pendingQuestion, sideChatConnectionId, sideChatSessionId };
});
