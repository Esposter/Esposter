import { EditToolName } from "@/models/agentConsole/EditToolName";
import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";

// The station each Claude Code tool is used at; any other tool — an MCP server's, a skill, the checklist — is the desk's
export const ToolWorldObjectTypeMap: Record<string, WorldObjectType> = {
  Agent: WorldObjectType.Portal,
  Bash: WorldObjectType.Terminal,
  BashOutput: WorldObjectType.Terminal,
  [EditToolName.Edit]: WorldObjectType.Workbench,
  [EditToolName.MultiEdit]: WorldObjectType.Workbench,
  [EditToolName.Write]: WorldObjectType.Workbench,
  Glob: WorldObjectType.Library,
  Grep: WorldObjectType.Library,
  KillShell: WorldObjectType.Terminal,
  NotebookEdit: WorldObjectType.Workbench,
  Read: WorldObjectType.Library,
  Task: WorldObjectType.Portal,
  WebFetch: WorldObjectType.Telescope,
  WebSearch: WorldObjectType.Telescope,
};
