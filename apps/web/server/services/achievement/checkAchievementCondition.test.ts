import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { BinaryOperator } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(checkAchievementCondition, () => {
  const message = "message";
  const data = { message };
  const baseCondition = { path: "message.length", type: AchievementConditionType.Property } as const;

  // Every comparison is the same two assertions over `message.length`, so the row carries the offset that must
  // Hold and the offset that must not
  test.each([
    [BinaryOperator.Eq, 0, 1],
    [BinaryOperator.Ge, 0, 1],
    [BinaryOperator.Gt, -1, 0],
    [BinaryOperator.Le, 0, -1],
    [BinaryOperator.Lt, 1, 0],
    [BinaryOperator.Ne, 1, 0],
  ] as const)(`${AchievementConditionType.Property} %s`, (operator, matchingOffset, nonMatchingOffset) => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition({ ...baseCondition, operator, value: message.length + matchingOffset }, data),
    ).toBe(true);
    expect(
      checkAchievementCondition({ ...baseCondition, operator, value: message.length + nonMatchingOffset }, data),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} ${AchievementOperator.Contains}`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.Contains, path: "message", value: message },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.Contains, path: "message", value: " " },
        data,
      ),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} ${AchievementOperator.Matches}`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.Matches, path: "message", value: /^[a-z]+$/u },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.Matches, path: "message", value: /^[0-9]+$/u },
        data,
      ),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} ${AchievementOperator.IsPalindrome}`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.IsPalindrome, path: "message", value: true },
        { message: "" },
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.IsPalindrome, path: "message", value: true },
        { message: "A, a" },
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        { ...baseCondition, operator: AchievementOperator.IsPalindrome, path: "message", value: true },
        data,
      ),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} ${AchievementOperator.Operation}`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          ...baseCondition,
          operation: (value) => value === message,
          operator: AchievementOperator.Operation,
          path: "message",
        },
        data,
      ),
    ).toBe(true);
    expect(
      checkAchievementCondition(
        {
          ...baseCondition,
          operation: (value) => value !== message,
          operator: AchievementOperator.Operation,
          path: "message",
        },
        data,
      ),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} missing value`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition({ ...baseCondition, operator: BinaryOperator.Eq, path: "message", value: message }, {}),
    ).toBe(false);
  });

  test(AchievementConditionType.And, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          conditions: [
            { ...baseCondition, operator: BinaryOperator.Eq, path: "message", value: message },
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length },
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
            { ...baseCondition, operator: BinaryOperator.Eq, path: "message", value: message },
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length + 1 },
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
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length },
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length + 1 },
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
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length + 1 },
            { ...baseCondition, operator: BinaryOperator.Eq, value: message.length + 1 },
          ],
          type: AchievementConditionType.Or,
        },
        data,
      ),
    ).toBe(false);
  });
});
