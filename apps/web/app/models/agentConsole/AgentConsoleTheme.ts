import type { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
// What a theme may change. It dresses the voxel world and never replaces or reorders it, so the default sets the
// Least a theme can — the reactions — and the parts a scene, an avatar or a voice would take are added with the
// First theme that has one
export interface AgentConsoleTheme {
  reactions: Record<AgentConsoleReaction, (title: string, body: string) => void>;
}
