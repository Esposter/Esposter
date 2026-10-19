import type { createSessionReads } from "@/services/agentConsole/createSessionReads";

// The session a part of the console reads and writes: the side chat's in the drawer, and the console's current session
// Everywhere else. Its composer draft is the one the reader is typing in that part
export type AgentConsoleSession = ReturnType<typeof createSessionReads> & {
  composerText: Ref<string>;
  sessionId: Ref<string>;
};
