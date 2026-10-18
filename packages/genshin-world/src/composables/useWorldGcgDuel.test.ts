import { useWorldGcgDuel } from "#src/composables/useWorldGcgDuel";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";

describe(useWorldGcgDuel, () => {
  const GAME_ID = 30_111;

  test("a won duel emits the win its game counts toward a quest", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const onQuestEvent = vi.fn();
    events.on("questEvent", onQuestEvent);
    const { gcgGameId, leaveGcgDuel } = useWorldGcgDuel({ events });
    gcgGameId.value = GAME_ID;
    leaveGcgDuel(true);
    expect(onQuestEvent).toHaveBeenCalledExactlyOnceWith({ kind: QuestObjectiveKind.Win, targetId: String(GAME_ID) });
    expect(gcgGameId.value).toBeUndefined();
  });

  test("a lost duel emits no win and still leaves the game", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const onQuestEvent = vi.fn();
    events.on("questEvent", onQuestEvent);
    const { gcgGameId, leaveGcgDuel } = useWorldGcgDuel({ events });
    gcgGameId.value = GAME_ID;
    leaveGcgDuel(false);
    expect(onQuestEvent).not.toHaveBeenCalled();
    expect(gcgGameId.value).toBeUndefined();
  });

  test("leaving with no game being played emits no win", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const onQuestEvent = vi.fn();
    events.on("questEvent", onQuestEvent);
    const { leaveGcgDuel } = useWorldGcgDuel({ events });
    leaveGcgDuel(true);
    expect(onQuestEvent).not.toHaveBeenCalled();
  });
});
