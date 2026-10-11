import { QuestId, QuestIds } from "#src/models/quest/QuestId";
import { describe, expect, test } from "vitest";

describe("questIds", () => {
  test("lists every carried quest once", () => {
    expect.hasAssertions();

    expect(QuestIds.toSorted()).toStrictEqual(Object.values(QuestId).toSorted());
  });
});
