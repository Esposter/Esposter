import type { AgentEvent } from "agent-console-server/contracts";

import { EditToolName } from "@/models/agentConsole/EditToolName";
import { createSessionView } from "@/services/agentConsole/createSessionView";
import { foldAgentEvents } from "@/services/agentConsole/foldAgentEvents";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { AgentEventType } from "agent-console-server/contracts";
import { describe, test } from "vitest";

const BENCH_EVENT_COUNTS = [100, 10000];
// An edit call and its result per pair, the heaviest shape an event takes: the call is parsed for the file it changes
const createToolCallEvents = (eventCount: number): AgentEvent[] =>
  Array.from({ length: eventCount / 2 }, (_value, index): AgentEvent[] => [
    {
      createdAt: new Date(0),
      id: `${index}`,
      input: { file_path: "file_path", new_string: "new_string", old_string: "old_string" },
      messageUuid: "",
      name: EditToolName.Edit,
      parentToolUseId: "",
      toolUseId: `${index}`,
      type: AgentEventType.ToolUse,
    },
    {
      content: "",
      createdAt: new Date(0),
      id: `-${index}`,
      isError: false,
      parentToolUseId: "",
      toolUseId: `${index}`,
      type: AgentEventType.ToolResult,
    },
  ]).flat();
const createMessageEvents = (eventCount: number): AgentEvent[] =>
  Array.from({ length: eventCount }, (_value, index) => ({
    createdAt: new Date(0),
    id: `${index}`,
    messageUuid: "",
    parentToolUseId: "",
    text: "",
    type: AgentEventType.AssistantMessage,
  }));
// A replay folds the whole log in one pass, so the same time per event at both lengths is the proof that an event
// Costs the event and not the log it joins. One group per length keeps `vs base` comparing shape at a fixed size
describe(foldAgentEvents, () => {
  test.for(BENCH_EVENT_COUNTS)("%i events", async (eventCount, { bench }) => {
    const toolCallEvents = createToolCallEvents(eventCount);
    const messageEvents = createMessageEvents(eventCount);
    await bench.compare(
      // Folding writes into the view, so each iteration folds into a fresh one; the events are only read
      bench("tool calls", () => {
        foldAgentEvents(createSessionView(), toolCallEvents);
      }),
      bench("messages", () => {
        foldAgentEvents(createSessionView(), messageEvents);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
