import type { SideChatQuestion } from "@/models/agentConsole/SideChatQuestion";

// The side chat drawer beside the conversation: whether it is open, the fork it asks through, the question held
// Until that fork has opened, and the drawer's own composer draft. None of it is kept through a reload, since closing
// The drawer discards it
export const useAgentConsoleSideChatStore = defineStore("agentConsole/sideChat", () => {
  const isSideChatOpen = ref(false);
  const sideChatSessionId = ref("");
  const sideChatConnectionId = ref("");
  const pendingQuestion = shallowRef<SideChatQuestion>();
  const sideChatComposerText = ref("");
  return { isSideChatOpen, pendingQuestion, sideChatComposerText, sideChatConnectionId, sideChatSessionId };
});
