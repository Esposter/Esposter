import type { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
// What a theme may change. It dresses the voxel world and never replaces or reorders it, so the default sets the
// Least a theme can — the reactions — and the parts a scene or a voice would take are added with the first theme that
// Has one
export interface AgentConsoleTheme {
  // Who the session is presented as, read from a session-start hook's context: "" when the context is not this
  // Theme's, so a session is presented by the theme whose plugin started it
  getAvatar: (sessionStartContext: string) => string;
  reactions: Record<AgentConsoleReaction, (title: string, body: string) => void>;
}
