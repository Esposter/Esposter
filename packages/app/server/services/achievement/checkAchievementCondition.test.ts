import { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { BinaryOperator } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkAchievementCondition, () => {
  const type = "type";
  const data = { type };

  test(AchievementConditionType.Property, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.eq, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.eq, path: "type.length", type: AchievementConditionType.Property, value: 0 },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.gt, path: "type.length", type: AchievementConditionType.Property, value: 3 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.gt, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.ge, path: "type.length", type: AchievementConditionType.Property, value: 3 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.ge, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.lt, path: "type.length", type: AchievementConditionType.Property, value: 5 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.lt, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.le, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.le, path: "type.length", type: AchievementConditionType.Property, value: 3 },
        data,
      ),
    ).toBe(false);

    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.ne, path: "type.length", type: AchievementConditionType.Property, value: 0 },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { operator: BinaryOperator.ne, path: "type.length", type: AchievementConditionType.Property, value: 4 },
        data,
      ),
    ).toBe(false);
  });

  test(AchievementConditionType.And, () => {
    expect.hasAssertions();

    const condition = {
      conditions: [
        {
          operator: BinaryOperator.eq,
          path: "a",
          type: AchievementConditionType.Property,
          value: 1,
        },
        {
          operator: BinaryOperator.eq,
          path: "b",
          type: AchievementConditionType.Property,
          value: 2,
        },
      ],
      type: AchievementConditionType.And,
    } as const;

    expect(checkAchievementCondition(condition, { a: 1, b: 2 })).toBe(true);
    expect(checkAchievementCondition(condition, { a: 1, b: 1 })).toBe(false);
  });

  test(AchievementConditionType.Or, () => {
    expect.hasAssertions();

    const condition = {
      conditions: [
        {
          operator: BinaryOperator.eq,
          path: "a",
          type: AchievementConditionType.Property,
          value: 1,
        },
        {
          operator: BinaryOperator.eq,
          path: "b",
          type: AchievementConditionType.Property,
          value: 2,
        },
      ],
      type: AchievementConditionType.Or,
    } as const;

    expect(checkAchievementCondition(condition, { a: 1, b: 0 })).toBe(true);
    expect(checkAchievementCondition(condition, { a: 0, b: 2 })).toBe(true);
    expect(checkAchievementCondition(condition, { a: 0, b: 0 })).toBe(false);
  });
});
