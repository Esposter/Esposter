import type { TimelineLane } from "@/models/agentConsole/TimelineLane";
import type { ToolCall } from "@/models/agentConsole/ToolCall";
import type { WorldFigure } from "@/models/agentConsole/world/WorldFigure";
import type { Vector3Tuple } from "three";

import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { FIGURE_SPACING, HOME_POSITION } from "@/services/agentConsole/world/constants";
import { ToolWorldObjectTypeMap } from "@/services/agentConsole/world/ToolWorldObjectTypeMap";
import { WorldObjectMap } from "@/services/agentConsole/world/WorldObjectMap";
import { SubagentStatus } from "agent-console-server/contracts";

const FINISHED_SUBAGENT_STATUSES = new Set([SubagentStatus.Completed, SubagentStatus.Failed, SubagentStatus.Stopped]);

const getStandingWorldObjectType = (
  isMain: boolean,
  runningToolCall: ToolCall | undefined,
  isPermissionPending: boolean,
) => {
  if (isMain && isPermissionPending) return WorldObjectType.Gate;
  else if (runningToolCall) return ToolWorldObjectTypeMap[runningToolCall.toolUse.name] ?? WorldObjectType.Desk;
  else if (isMain) return undefined;
  else return WorldObjectType.Portal;
};
// Where each agent stands, read off its lane: at the station of the tool call it is waiting on, the main agent at the
// Gate while a permission request waits, and otherwise the main agent at home and a subagent at the portal it came
// Through. A finished subagent has left, and figures sharing a station stand side by side
export const toWorldFigures = (timelineLanes: TimelineLane[], isPermissionPending: boolean): WorldFigure[] => {
  const standingCountMap = new Map<string, number>();
  return timelineLanes
    .filter(({ status }) => !status || !FINISHED_SUBAGENT_STATUSES.has(status))
    .map(({ id, toolCalls }) => {
      const isMain = !id;
      const worldObjectType = getStandingWorldObjectType(
        isMain,
        toolCalls.findLast(({ result }) => !result),
        isPermissionPending,
      );
      const standingKey = worldObjectType ?? "";
      const standingCount = standingCountMap.get(standingKey) ?? 0;
      standingCountMap.set(standingKey, standingCount + 1);
      const [x, y, z]: Vector3Tuple = worldObjectType ? WorldObjectMap[worldObjectType].standPosition : HOME_POSITION;
      return { id, isMain, position: [x + standingCount * FIGURE_SPACING, y, z] };
    });
};
