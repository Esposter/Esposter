import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { startQuests } from "#src/services/quest/startQuests";
import { describe, expect, test } from "vitest";

const createQuest = (id: string): Quest => ({
  descriptionTextId: "descriptionTextId",
  id,
  kind: QuestKind.Archon,
  steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }], textId: "textId" }],
  talks: [],
  titleTextId: "titleTextId",
});

describe(startQuests, () => {
  const quests = [createQuest("1"), createQuest("2")];

  test("starts the first Archon quest not yet finished, once", () => {
    expect.hasAssertions();

    const started = startQuests(quests, new Map());

    expect(started).toStrictEqual(new Map([["1", { objectiveCounts: [], stepIndex: 0 }]]));
    expect(startQuests(quests, started)).toStrictEqual(started);
  });

  test("starts the next Archon quest once the one before it is finished", () => {
    expect.hasAssertions();

    expect(startQuests(quests, new Map([["1", { objectiveCounts: [], stepIndex: 1 }]]))).toStrictEqual(
      new Map([
        ["1", { objectiveCounts: [], stepIndex: 1 }],
        ["2", { objectiveCounts: [], stepIndex: 0 }],
      ]),
    );
  });
});
