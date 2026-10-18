import type { createSessionReads } from "@/services/agentConsole/createSessionReads";

// The session a part of the console reads and writes: the side chat's where the drawer provides one, and the console's
// Current session everywhere else. Its composer draft is the one the reader is typing in that part
export type AgentConsoleSession = ReturnType<typeof createSessionReads> & {
  composerText: Ref<string>;
  sessionId: Ref<string>;
};
