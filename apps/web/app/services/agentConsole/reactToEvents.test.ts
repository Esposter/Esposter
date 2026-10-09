import type { AgentConsoleTheme } from "@/models/agentConsole/AgentConsoleTheme";

import { AgentConsoleReaction } from "@/models/agentConsole/AgentConsoleReaction";
import { reactToEvents } from "@/services/agentConsole/reactToEvents";
import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { describe, expect, onTestFinished, test, vi } from "vitest";

const createTheme = () =>
  ({
    getAvatar: () => "",
    reactions: {
      [AgentConsoleReaction.AttentionNeeded]: vi.fn<(title: string, body: string) => void>(),
      [AgentConsoleReaction.TurnEnded]: vi.fn<(title: string, body: string) => void>(),
    },
  }) satisfies AgentConsoleTheme;
const stubWindow = (hidden: boolean) => {
  vi.stubGlobal("window", { document: { hidden } });
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
};

describe(reactToEvents, () => {
  const events = readRecordedEvents();

  test("rings for every turn end and permission prompt after the page connected", () => {
    expect.hasAssertions();

    stubWindow(false);

    const theme = createTheme();
    reactToEvents(theme, "", events, new Date(0));

    expect(theme.reactions[AgentConsoleReaction.TurnEnded]).toHaveBeenCalledTimes(1);
    expect(theme.reactions[AgentConsoleReaction.AttentionNeeded]).toHaveBeenCalledExactlyOnceWith(
      "",
      "Write is waiting for permission",
    );
  });

  test("stays quiet for a log replayed from before the page connected", () => {
    expect.hasAssertions();

    stubWindow(false);

    const theme = createTheme();
    reactToEvents(theme, "", events, new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")));

    expect(theme.reactions[AgentConsoleReaction.TurnEnded]).not.toHaveBeenCalled();
    expect(theme.reactions[AgentConsoleReaction.AttentionNeeded]).not.toHaveBeenCalled();
  });

  test("notifies a hidden tab with a theme that sets no reactions", () => {
    expect.hasAssertions();

    const notifications: [string, string][] = [];
    class Notification {
      static permission = "granted";

      constructor(title: string, options: { body: string }) {
        notifications.push([title, options.body]);
      }
    }
    vi.stubGlobal("Notification", Notification);
    vi.stubGlobal("window", { document: { hidden: true }, Notification });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    reactToEvents({ getAvatar: () => "", reactions: {} }, "", events, new Date(0));

    expect(notifications).toHaveLength(2);
    expect(notifications).toContainEqual(["", "Write is waiting for permission"]);
  });
});
