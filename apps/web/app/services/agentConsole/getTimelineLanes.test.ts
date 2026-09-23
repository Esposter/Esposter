import { MAIN_LANE_TITLE } from "@/services/agentConsole/constants";
import { getTimelineLanes } from "@/services/agentConsole/getTimelineLanes";
import { getToolCalls } from "@/services/agentConsole/getToolCalls";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { SubagentStatus } from "agent-console-server/contracts";
import { describe, expect, test } from "vitest";

describe(getTimelineLanes, () => {
  test("draws the recorded subagent's calls in a lane of their own, titled by its task", () => {
    expect.hasAssertions();

    const events = readRecordedEvents();
    const lanes = getTimelineLanes(getToolCalls(events), events);

    expect(
      lanes.map(({ status, title, toolCalls }) => ({
        status,
        title,
        toolNames: toolCalls.map(({ toolUse }) => toolUse.name),
      })),
    ).toStrictEqual([
      { status: undefined, title: MAIN_LANE_TITLE, toolNames: ["Write", "Bash", "Read", "Agent"] },
      { status: SubagentStatus.Completed, title: "List files via Glob", toolNames: ["Glob"] },
    ]);
  });
});
