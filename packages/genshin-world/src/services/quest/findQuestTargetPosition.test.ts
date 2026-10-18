import type { Quest } from "#src/models/quest/Quest";
import type { RegionData } from "#src/models/world/RegionData";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { findQuestTargetPosition } from "#src/services/quest/findQuestTargetPosition";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
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
  goToPlaces: [{ id: "place", position: { x: 30, z: 40 }, radius: 10 }],
  id: "region",
  landmarks: [],
  outcropPlaces: [],
  residents: [],
  waterfalls: [],
};

describe(findQuestTargetPosition, () => {
  test("tracking a go-to step points the beam at its place", () => {
    expect.hasAssertions();

    const targetId = getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 0 });

    expect(findQuestTargetPosition(new Map([[regionData.id, regionData]]), new Map(), targetId)).toStrictEqual({
      x: 30,
      z: 40,
    });
  });
});
