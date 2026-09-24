import { AgentConsolePanelType } from "@/models/agentConsole/AgentConsolePanelType";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
// The panel each object opens: the board the sessions, and every station the timeline of the calls made at it. The door
// Opens nothing, since it leads out
export const WorldObjectPanelTypeMap = {
  [WorldObjectType.Board]: AgentConsolePanelType.Sessions,
  [WorldObjectType.Desk]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Gate]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Library]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Portal]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Telescope]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Terminal]: AgentConsolePanelType.Timeline,
  [WorldObjectType.Workbench]: AgentConsolePanelType.Timeline,
} as const satisfies Record<Exclude<WorldObjectType, WorldObjectType.Door>, AgentConsolePanelType>;
