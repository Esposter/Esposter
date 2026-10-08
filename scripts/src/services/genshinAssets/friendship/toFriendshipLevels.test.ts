import type { ExcelAvatarFettersLevelRow } from "#src/models/genshinAssets/friendship/ExcelAvatarFettersLevelRow";

import { toFriendshipLevels } from "#src/services/genshinAssets/friendship/toFriendshipLevels";
import { describe, expect, test } from "vitest";

describe(toFriendshipLevels, () => {
  test("should sum the EXP of each level below into its total, in level order, and never sum the top row", () => {
    expect.hasAssertions();

    const rows: ExcelAvatarFettersLevelRow[] = [
      { fetterLevel: 3, needExp: 30 },
      { fetterLevel: 1, needExp: 10 },
      { fetterLevel: 2, needExp: 20 },
    ];

    expect(toFriendshipLevels(rows)).toStrictEqual([
      { exp: 0, level: 1 },
      { exp: 10, level: 2 },
      { exp: 30, level: 3 },
    ]);
  });
});
