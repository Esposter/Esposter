import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/generated/talentMultipliers/TalentMultiplierLoaderMap"), () => ({
  TalentMultiplierLoaderMap: {
    1: () => Promise.resolve({ default: { 11: [{ level: 1, paramList: [0.5] }] } }),
    2: () => Promise.resolve({ default: { 21: [{ level: 1, paramList: [0.25, 0.75] }] } }),
  },
}));

describe(readTalentMultipliers, () => {
  test("merges each character's chunk by proud skill group", async () => {
    expect.hasAssertions();
    await expect(readTalentMultipliers([1, 2])).resolves.toStrictEqual({
      11: [{ level: 1, paramList: [0.5] }],
      21: [{ level: 1, paramList: [0.25, 0.75] }],
    });
  });

  test("refuses a character the table holds no chunk for", async () => {
    expect.hasAssertions();
    await expect(readTalentMultipliers([3])).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 3, no talent multipliers]`,
    );
  });
});
