/* oxlint-disable typescript/no-unnecessary-type-assertion */
// @TODO: remove when we switch to vue-tsgo — slight difference between ts6 and tsgo (ts7) behaviour
import type { PropertyCondition } from "#shared/models/achievement/type/PropertyCondition";

import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { BinaryOperator } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkAchievementCondition, () => {
  const message = "message";
  const data = { message };
  const baseCondition = { path: "message.length", type: AchievementConditionType.Property } as const;

  // Every comparison is the same two assertions over `message.length`, so the row carries the offset that must
  // Hold and the offset that must not
  test.each([
    [BinaryOperator.eq, 0, 1],
    [BinaryOperator.ge, 0, 1],
    [BinaryOperator.gt, -1, 0],
    [BinaryOperator.le, 0, -1],
    [BinaryOperator.lt, 1, 0],
    [BinaryOperator.ne, 1, 0],
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
        { ...baseCondition, operator: AchievementOperator.Contains, path: "message", value: "0" },
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
        { message: "A man, a plan, a canal: Panama" },
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
        } as PropertyCondition<"message.createMessage">,
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
        } as PropertyCondition<"message.createMessage">,
        data,
      ),
    ).toBe(false);
  });

  test(`${AchievementConditionType.Property} missing value`, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition({ ...baseCondition, operator: BinaryOperator.eq, path: "message", value: message }, {}),
    ).toBe(false);
  });

  test(AchievementConditionType.And, () => {
    expect.hasAssertions();

    expect(
      checkAchievementCondition(
        {
          conditions: [
            { ...baseCondition, operator: BinaryOperator.eq, path: "message", value: message },
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length },
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
            { ...baseCondition, operator: BinaryOperator.eq, path: "message", value: message },
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length + 1 },
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
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length },
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length + 1 },
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
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length + 1 },
            { ...baseCondition, operator: BinaryOperator.eq, value: message.length + 1 },
          ],
          type: AchievementConditionType.Or,
        },
        data,
      ),
    ).toBe(false);
  });
});
