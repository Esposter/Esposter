import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { reactToEvents } from "@/services/agentConsole/reactToEvents";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { describe, expect, test, vi } from "vitest";

const createTheme = () =>
  ({
    reactions: {
      [AgentConsoleReaction.AttentionNeeded]: vi.fn<(title: string, body: string) => void>(),
      [AgentConsoleReaction.TurnEnded]: vi.fn<(title: string, body: string) => void>(),
    },
  }) satisfies AgentConsoleTheme;

describe(reactToEvents, () => {
  const events = readRecordedEvents();

  test("rings for every turn end and permission prompt after the page connected", () => {
    expect.hasAssertions();

    const theme = createTheme();
    reactToEvents(theme, "", events, new Date(0));

    expect(theme.reactions[AgentConsoleReaction.TurnEnded]).toHaveBeenCalledTimes(2);
    expect(theme.reactions[AgentConsoleReaction.AttentionNeeded]).toHaveBeenCalledExactlyOnceWith(
      "",
      "Write is waiting for permission",
    );
  });

  test("stays quiet for a log replayed from before the page connected", () => {
    expect.hasAssertions();

    const theme = createTheme();
    reactToEvents(theme, "", events, new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")));

    expect(theme.reactions[AgentConsoleReaction.TurnEnded]).not.toHaveBeenCalled();
    expect(theme.reactions[AgentConsoleReaction.AttentionNeeded]).not.toHaveBeenCalled();
  });
});
