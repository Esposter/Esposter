import type { Tip } from "#src/models/tip/Tip";

import { TipTriggerType } from "#src/models/tip/TipTriggerType";
import { getTipsTriggered } from "#src/services/tip/getTipsTriggered";
import { describe, expect, test } from "vitest";

const PARAM = "7001";
const TIP: Tip = {
  id: 1,
  subtitleTextId: "",
  titleTextId: "",
  trigger: { paramList: [PARAM], triggerType: TipTriggerType.FinishQuestOr },
};
const matchesParam = (paramList: string[]) => paramList.includes(PARAM);

describe(getTipsTriggered, () => {
  test("a tip of the kind fires when its parameters match", () => {
    expect.hasAssertions();
    expect(getTipsTriggered([TIP], new Set(), TipTriggerType.FinishQuestOr, matchesParam)).toStrictEqual([TIP]);
  });

  test("a tip the save has shown does not fire", () => {
    expect.hasAssertions();
    expect(getTipsTriggered([TIP], new Set([TIP.id]), TipTriggerType.FinishQuestOr, matchesParam)).toStrictEqual([]);
  });

  test("a tip of another kind does not fire", () => {
    expect.hasAssertions();
    expect(getTipsTriggered([TIP], new Set(), TipTriggerType.WorldLevelUp, matchesParam)).toStrictEqual([]);
  });
});
