import { toGameDataKeyScopes } from "#src/services/gameData/toGameDataKeyScopes";
import { GameDataset } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toGameDataKeyScopes, () => {
  test("keeps a key under a dataset", () => {
    expect.hasAssertions();

    const key = `${GameDataset.Login}/music`;

    expect(toGameDataKeyScopes([key])).toStrictEqual([key]);
  });

  // A dataset's own name is no key of it, and a scope of it would replace the whole dataset with the one record
  test("refuses a dataset with no key", () => {
    expect.hasAssertions();
    expect(() => toGameDataKeyScopes([GameDataset.Login])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: login, is no key under a game dataset]`,
    );
  });
});
