import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { describe, expect, test } from "vitest";

describe(getTransformativeDamage, () => {
  test.each([
    [TransformativeReactionType.Burning, 361.71],
    [TransformativeReactionType.Swirl, 868.11],
    [TransformativeReactionType.Superconduct, 2170.28],
    [TransformativeReactionType.ElectroCharged, 2893.71],
    [TransformativeReactionType.Bloom, 2893.71],
    [TransformativeReactionType.Overloaded, 3978.85],
    [TransformativeReactionType.Shattered, 4340.56],
    [TransformativeReactionType.Burgeon, 4340.56],
    [TransformativeReactionType.Hyperbloom, 4340.56],
  ])("deals %s at %f from a level 90 character with no mastery", (transformativeReactionType, damage) => {
    expect.hasAssertions();

    expect(getTransformativeDamage(transformativeReactionType, 90, 0, 0)).toBeCloseTo(damage, 2);
  });

  test("raises the damage by 16 × EM / (EM + 2000) and the reaction bonus, and cuts it by resistance", () => {
    expect.hasAssertions();

    const damage = getTransformativeDamage(TransformativeReactionType.Overloaded, 90, 100, 0.1, 0.4);

    expect(damage).toBeCloseTo(3978.85 * (1 + (16 * 100) / 2100 + 0.4) * 0.9, 1);
  });
});
