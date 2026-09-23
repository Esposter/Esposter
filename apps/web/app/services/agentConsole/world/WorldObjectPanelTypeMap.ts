import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
// The console tab each object opens for a player standing at it: the board the sessions, the gate the waiting request in
// The conversation, and every station the timeline of the calls made at it. The door opens nothing, since it leads out
export const WorldObjectPanelTypeMap = {
  [WorldObjectType.Board]: AgentConsolePanelType.Sessions,
  [WorldObjectType.Desk]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Gate]: AgentConsolePanelType.Conversation,
  [WorldObjectType.Library]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Portal]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Telescope]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Terminal]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Workbench]: AgentConsolePanelType.Timeline,
} as const satisfies Record<Exclude<WorldObjectType, WorldObjectType.Door>, AgentConsolePanelType>;
