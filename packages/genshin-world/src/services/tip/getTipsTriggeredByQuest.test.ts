import type { Tip } from "#src/models/tip/Tip";

import { TipTriggerType } from "#src/models/tip/TipTriggerType";
import { getTipsTriggeredByQuest } from "#src/services/tip/getTipsTriggeredByQuest";
import { describe, expect, test } from "vitest";

describe(getTipsTriggeredByQuest, () => {
  const QUEST_ID = "7001";
  const TIP: Tip = {
    id: 1,
    subtitleTextId: "22",
    titleTextId: "11",
    trigger: { paramList: [QUEST_ID], triggerType: TipTriggerType.FinishQuestOr },
  };

  test("a tip is triggered by a finished quest among its parameters", () => {
    expect.hasAssertions();
    expect(getTipsTriggeredByQuest([TIP], QUEST_ID, new Set())).toStrictEqual([TIP]);
  });

  test("a tip shown already is not triggered again", () => {
    expect.hasAssertions();
    expect(getTipsTriggeredByQuest([TIP], QUEST_ID, new Set([TIP.id]))).toStrictEqual([]);
  });

  test("a tip whose trigger is another kind is not triggered by a quest", () => {
    expect.hasAssertions();
    const tip: Tip = { ...TIP, trigger: { paramList: [QUEST_ID], triggerType: "TRIGGER_OBTAIN_MATERIAL_NUM" } };
    expect(getTipsTriggeredByQuest([tip], QUEST_ID, new Set())).toStrictEqual([]);
  });
});
