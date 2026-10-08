import type { Quest } from "#src/models/quest/Quest";

import { questSchema } from "#src/models/quest/Quest";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { TALK } from "#src/services/dialogue/constants.test";
import { describe, expect, test } from "vitest";

describe("questSchema", () => {
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    steps: [
      { id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: TALK.id }], textId: "textId" },
    ],
    talks: [TALK],
    titleTextId: "titleTextId",
  };

  test("takes a quest whose talk-to objectives name its own talks", () => {
    expect.hasAssertions();

    expect(questSchema.safeParse(quest).success).toBe(true);
  });

  test("refuses a talk-to objective naming a talk the quest does not run", () => {
    expect.hasAssertions();

    expect(questSchema.safeParse({ ...quest, talks: [] }).success).toBe(false);
  });
});
