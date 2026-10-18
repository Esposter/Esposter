import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { toSeeliePlace } from "#src/services/genshinAssets/puzzles/toSeeliePlace";
import { PuzzleKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toSeeliePlace, () => {
  const SEELIE: MapPointPlace<PuzzleKind> = { id: "puzzle-2", kind: PuzzleKind.Seelie, position: { x: 3, z: 4 } };

  test("a seelie whose region has a court on the map is not provisional", () => {
    expect.hasAssertions();

    expect(toSeeliePlace(SEELIE, true)).toStrictEqual({ ...SEELIE, seelie: { isProvisional: false } });
  });

  test("a seelie whose region has no court on the map is provisional", () => {
    expect.hasAssertions();

    expect(toSeeliePlace(SEELIE, false)).toStrictEqual({ ...SEELIE, seelie: { isProvisional: true } });
  });
});
