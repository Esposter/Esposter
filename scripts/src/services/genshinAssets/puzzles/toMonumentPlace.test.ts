import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import {
  PROVISIONAL_MONUMENT_ELEMENT,
  PROVISIONAL_MONUMENT_IS_TIMED,
} from "#src/services/genshinAssets/puzzles/constants";
import { toMonumentPlace } from "#src/services/genshinAssets/puzzles/toMonumentPlace";
import { Element, PuzzleKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toMonumentPlace, () => {
  const MARK: MapPointPlace<PuzzleKind> = {
    id: "puzzle-1",
    kind: PuzzleKind.ElementalMonument,
    position: { x: 1, z: 2 },
  };

  test("a mark takes its kind's element and timing", () => {
    expect.hasAssertions();

    expect(toMonumentPlace(MARK, { element: Element.Hydro, isTimed: false })).toStrictEqual({
      ...MARK,
      monument: { element: Element.Hydro, isProvisional: false, isTimed: false },
    });
  });

  test("a kind the wiki gives neither for is left provisional", () => {
    expect.hasAssertions();

    expect(toMonumentPlace(MARK, {})).toStrictEqual({
      ...MARK,
      monument: { element: PROVISIONAL_MONUMENT_ELEMENT, isProvisional: true, isTimed: PROVISIONAL_MONUMENT_IS_TIMED },
    });
  });
});
