import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { spiralAbyssSaveSchema } from "#src/models/spiralAbyss/SpiralAbyssSave";
import { toSpiralAbyssProgressMap } from "#src/services/save/toSpiralAbyssProgressMap";
import { toSpiralAbyssSave } from "#src/services/save/toSpiralAbyssSave";
import { describe, expect, test } from "vitest";

describe(toSpiralAbyssSave, () => {
  test("each cycle's progress reads back, through the save schema, as it was written", () => {
    expect.hasAssertions();
    const progressMap = new Map<string, AbyssProgress>([
      [
        "corridor",
        { chamberIdProgressMap: new Map([[1, { isCleared: true, stars: 2 }]]), claimedRewardIds: new Set([101, 102]) },
      ],
      ["124", { chamberIdProgressMap: new Map(), claimedRewardIds: new Set() }],
    ]);

    expect(toSpiralAbyssProgressMap(spiralAbyssSaveSchema.parse(toSpiralAbyssSave(progressMap)))).toStrictEqual(
      progressMap,
    );
  });
});
