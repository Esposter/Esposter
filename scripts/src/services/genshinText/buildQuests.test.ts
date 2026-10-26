import type { readFileSync } from "node:fs";

import { buildQuestChapters } from "#src/services/genshinText/buildQuestChapters";
import { buildQuests } from "#src/services/genshinText/buildQuests";
import { MAIN_QUEST_TABLE_NAME, SUB_QUEST_TABLE_NAME } from "#src/services/genshinText/constants";
import { readCarriedQuestRewards } from "#src/services/genshinText/readCarriedQuestRewards";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameDataset, QuestKind, QuestObjectiveKind } from "genshin-world";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("genshin-world"), async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, QuestIds: [original.QuestId.CandidatureAnalysis], ReputationRequestQuestIds: [] };
});
vi.mock(import("#src/services/genshinText/buildQuestChapters"));
vi.mock(import("#src/services/genshinText/readCarriedQuestRewards"));
vi.mock(import("#src/services/genshinText/readExcelTable"));
vi.mock(import("#src/services/genshinText/readQuestSteps"));
vi.mock(import("#src/services/genshinText/readTalkTables"));
vi.mock(import("#src/services/genshinText/readTextMap"));
vi.mock(import("node:fs"), async (importOriginal) => ({
  ...(await importOriginal()),
  readFileSync: vi.fn<() => string>(() => "{}") as unknown as typeof readFileSync,
}));

describe(buildQuests, () => {
  beforeEach(() => {
    vi.mocked(buildQuestChapters).mockReturnValue([]);
    vi.mocked(readCarriedQuestRewards).mockReturnValue(new Map());
    vi.mocked(readExcelTable).mockImplementation((tableName) =>
      tableName === MAIN_QUEST_TABLE_NAME
        ? [{ chapterId: 0, descTextMapHash: 2, id: 1101, titleTextMapHash: 1, type: "WQ" }]
        : tableName === SUB_QUEST_TABLE_NAME
          ? [{ mainId: 1101, stepDescTextMapHash: 3, subId: 11019 }]
          : [],
    );
    vi.mocked(readQuestSteps).mockReturnValue({
      notes: [],
      offerTalkIds: [],
      steps: [
        { id: "11019", objectives: [{ count: 1, kind: QuestObjectiveKind.Collect, targetIds: ["1"] }], textId: "3" },
      ],
    });
    vi.mocked(readTextMap).mockReturnValue(new Map());
  });

  test("a sub quest is filed under the world quest it belongs to", async () => {
    expect.hasAssertions();

    const { objects } = await buildQuests();

    expect(objects[`${GameDataset.Quests}/11019`]).toStrictEqual({
      descriptionTextId: "2",
      id: "11019",
      kind: QuestKind.World,
      mainId: "1101",
      offerTalkIds: [],
      parentQuestIds: [],
      rewards: [],
      steps: [
        { id: "11019", objectives: [{ count: 1, kind: QuestObjectiveKind.Collect, targetIds: ["1"] }], textId: "3" },
      ],
      talks: [],
      titleTextId: "1",
    });
  });
});
