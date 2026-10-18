import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { RegionData } from "#src/models/world/RegionData";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { getEnteredGoToEvents } from "#src/services/quest/getEnteredGoToEvents";
import { describe, expect, test } from "vitest";

const quest: Quest = {
  descriptionTextId: "descriptionTextId",
  id: "0",
  kind: QuestKind.Archon,
  mainId: "0",
  offerTalkIds: [],
  rewards: [],
  steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "place" }], textId: "textId" }],
  talks: [],
  titleTextId: "titleTextId",
};
const regionData: RegionData = {
  enemyCamps: [],
  goToPlaces: [{ id: "place", position: { x: 0, z: 0 }, radius: 10 }],
  id: "region",
  landmarks: [],
  outcropPlaces: [],
  residents: [],
  waterfalls: [],
};

describe(getEnteredGoToEvents, () => {
  test("reaching a go-to place completes the step", () => {
    expect.hasAssertions();

    const questEvents = getEnteredGoToEvents([regionData], { x: 30, z: 40 }, { x: 3, z: 4 });

    expect(questEvents).toStrictEqual([{ kind: QuestObjectiveKind.GoTo, targetId: "place" }]);
    expect(
      questEvents.reduce<QuestProgress>((progress, questEvent) => advanceQuest(quest, progress, questEvent), {
        objectiveCounts: [],
        stepIndex: 0,
      }),
    ).toStrictEqual({ objectiveCounts: [], stepIndex: 1 });
  });

  test("standing outside the radius leaves the step open", () => {
    expect.hasAssertions();

    expect(getEnteredGoToEvents([regionData], { x: 30, z: 40 }, { x: 30, z: 41 })).toStrictEqual([]);
  });
});
