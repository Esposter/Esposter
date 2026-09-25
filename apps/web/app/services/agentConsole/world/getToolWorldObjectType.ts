import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { ToolWorldObjectTypeMap } from "@/services/agentConsole/world/ToolWorldObjectTypeMap";

// The station a tool is used at, the desk for any tool no station names
export const getToolWorldObjectType = (toolName: string) => ToolWorldObjectTypeMap[toolName] ?? WorldObjectType.Desk;
