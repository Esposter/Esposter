// @vitest-environment nuxt
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { useAgentConsoleSessionStore } from "@/store/agentConsole/session";
import { takeOne } from "@esposter/shared";
import { AgentEventType } from "agent-console-server/contracts";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useAgentConsoleSessionStore, () => {
  const sessionId = crypto.randomUUID();
  const events = readRecordedEvents();
  let agentConsoleSessionStore: ReturnType<typeof useAgentConsoleSessionStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    agentConsoleSessionStore = useAgentConsoleSessionStore();
  });

  test("keeps each event once however often the log arrives, and reads the work surface off it", () => {
    expect.hasAssertions();

    const { currentSessionId, fileEdits, pendingPermissionRequests, sessionSettings, toolCalls, turnResult } =
      storeToRefs(agentConsoleSessionStore);
    const { storeEvents } = agentConsoleSessionStore;
    currentSessionId.value = sessionId;
    const firstAddedEvents = storeEvents(sessionId, events);
    const replayedAddedEvents = storeEvents(sessionId, events);

    expect(firstAddedEvents).toHaveLength(events.length);
    expect(replayedAddedEvents).toStrictEqual([]);
    expect(toolCalls.value.map(({ result, toolUse }) => [toolUse.name, Boolean(result)])).toStrictEqual([
      ["Write", true],
      ["Bash", true],
      ["Read", true],
      ["Agent", true],
      ["Glob", true],
    ]);
    expect(fileEdits.value.map(({ filePath, newText, oldText }) => ({ filePath, newText, oldText }))).toStrictEqual([
      { filePath: "/a", newText: "a", oldText: "" },
    ]);
    expect(pendingPermissionRequests.value.map(({ toolName }) => toolName)).toStrictEqual(["Write"]);
    expect(sessionSettings.value?.model).toBe(
      takeOne(events.filter((event) => event.type === AgentEventType.SessionInit)).model,
    );
    expect(turnResult.value?.totalCostUsd).toBe(
      events.findLast((event) => event.type === AgentEventType.TurnResult)?.totalCostUsd,
    );
  });

  test("empties a session's log when the host reopens it", () => {
    expect.hasAssertions();

    const { currentSessionId, events: currentEvents } = storeToRefs(agentConsoleSessionStore);
    const { storeEvents, storeSessionReset } = agentConsoleSessionStore;
    currentSessionId.value = sessionId;
    storeEvents(sessionId, events);
    storeSessionReset(sessionId);

    expect(currentEvents.value).toStrictEqual([]);
  });
});
