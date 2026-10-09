import type { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";

// What a theme may change. It dresses the world and never replaces or reorders it, so the default sets the least a
// Theme can — no reactions — and the parts a scene or a voice would take are added with the first theme that has one
export interface AgentConsoleTheme {
  // Who the session is presented as, read from a session-start hook's context: "" when the context is not this
  // Theme's, so a session is presented by the theme whose plugin started it
  getAvatar: (sessionStartContext: string) => string;
  // What the theme does on top of the console's own notification when the tab is hidden
  reactions: Partial<Record<AgentConsoleReaction, (title: string, body: string) => void>>;
}
