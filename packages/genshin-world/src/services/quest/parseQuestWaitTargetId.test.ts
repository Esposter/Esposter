import { formatQuestWaitTargetId } from "#src/services/quest/formatQuestWaitTargetId";
import { parseQuestWaitTargetId } from "#src/services/quest/parseQuestWaitTargetId";
import { describe, expect, test } from "vitest";

describe(parseQuestWaitTargetId, () => {
  test("reads back the wait a target id was formatted from", () => {
    expect.hasAssertions();

    const questWait = { days: 2, fromHour: 18, toHour: 6 };

    expect(parseQuestWaitTargetId(formatQuestWaitTargetId(questWait))).toStrictEqual(questWait);
  });

  test.each(["", "1", "1:2", "1:2-", "a:2-3", "1:2-3-4", "-1:2-3"])("reads nothing from %s", (targetId) => {
    expect.hasAssertions();

    expect(parseQuestWaitTargetId(targetId)).toBeUndefined();
  });
});
