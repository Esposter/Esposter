import type { TimelineLane } from "@/models/agentConsole/TimelineLane";

import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { FIGURE_SPACING, HOME_POSITION } from "@/services/agentConsole/world/constants";
import { toWorldFigures } from "@/services/agentConsole/world/toWorldFigures";
import { WorldObjectMap } from "@/services/agentConsole/world/WorldObjectMap";
import { AgentEventType, SubagentStatus } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

const createTimelineLane = (id: string, name: string, status?: SubagentStatus): TimelineLane => ({
  id,
  ...(status ? { status } : {}),
  title: "",
  toolCalls: [
    {
      elapsedSeconds: 0,
      toolUse: {
        createdAt: new Date(0),
        id,
        input: {},
        messageUuid: "",
        name,
        parentToolUseId: id,
        toolUseId: id,
        type: AgentEventType.ToolUse,
      },
    },
  ],
});

describe(toWorldFigures, () => {
  test("sends the recorded session's main agent to the gate while its permission request waits, its subagent gone", () => {
    expect.hasAssertions();

    const sessionView = createSessionView();
    foldAgentEvents(sessionView, readRecordedEvents());

    expect(toWorldFigures([...sessionView.timelineLaneMap.values()], true)).toStrictEqual([
      { id: "", isMain: true, position: WorldObjectMap[WorldObjectType.Gate].standPosition },
    ]);
    expect(toWorldFigures([...sessionView.timelineLaneMap.values()], false)).toStrictEqual([
      { id: "", isMain: true, position: HOME_POSITION },
    ]);
  });

  test("stands each agent at the station of the call it waits on, side by side when they share one", () => {
    expect.hasAssertions();

    const [x, y, z] = WorldObjectMap[WorldObjectType.Library].standPosition;

    expect(
      toWorldFigures(
        [
          createTimelineLane("", "Read"),
          createTimelineLane(" ", "Glob", SubagentStatus.Running),
          { id: "  ", status: SubagentStatus.Started, title: "", toolCalls: [] },
        ],
        false,
      ),
    ).toStrictEqual([
      { id: "", isMain: true, position: [x, y, z] },
      { id: " ", isMain: false, position: [x + FIGURE_SPACING, y, z] },
      { id: "  ", isMain: false, position: WorldObjectMap[WorldObjectType.Portal].standPosition },
    ]);
  });
});
