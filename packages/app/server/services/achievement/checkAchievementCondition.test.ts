import { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { BinaryOperator } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkAchievementCondition, () => {
  const message = "message";
  const data = { message };

  test(AchievementConditionType.Property, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.eq,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.eq,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length + 1,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.gt,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length - 1,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.gt,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.ge,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.ge,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length + 1,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.lt,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length + 1,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.lt,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.le,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.le,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length - 1,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.ne,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length + 1,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: BinaryOperator.ne,
          path: "message.length",
          type: AchievementConditionType.Property,
          value: message.length,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.Contains,
          path: "message",
          type: AchievementConditionType.Property,
          value: message,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.Contains,
          path: "message",
          type: AchievementConditionType.Property,
          value: "0",
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.Matches,
          path: "message",
          type: AchievementConditionType.Property,
          value: /^[a-z]+$/,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.Matches,
          path: "message",
          type: AchievementConditionType.Property,
          value: /^[0-9]+$/,
        },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.IsPalindrome,
          path: "message",
          type: AchievementConditionType.Property,
          value: true,
        },
        { message: "" },
      ),
    ).toBe(true);

    expect(
      checkAchievementCondition(
        {
          operator: AchievementOperator.IsPalindrome,
          path: "message",
          type: AchievementConditionType.Property,
          value: true,
        },
        data,
      ),
    ).toBe(false);
  });

  test(AchievementConditionType.And, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          conditions: [
            {
              operator: BinaryOperator.eq,
              path: "message",
              type: AchievementConditionType.Property,
              value: message,
            },
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length,
            },
          ],
          type: AchievementConditionType.And,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          conditions: [
            {
              operator: BinaryOperator.eq,
              path: "message",
              type: AchievementConditionType.Property,
              value: message,
            },
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length + 1,
            },
          ],
          type: AchievementConditionType.And,
        },
        data,
      ),
    ).toBe(false);
  });

  test(AchievementConditionType.Or, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          conditions: [
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length,
            },
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length + 1,
            },
          ],
          type: AchievementConditionType.Or,
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          conditions: [
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length + 1,
            },
            {
              operator: BinaryOperator.eq,
              path: "message.length",
              type: AchievementConditionType.Property,
              value: message.length + 1,
            },
          ],
          type: AchievementConditionType.Or,
        },
        data,
      ),
    ).toBe(false);
  });
});
