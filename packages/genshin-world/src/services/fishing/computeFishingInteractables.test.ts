import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { computeFishingInteractables } from "#src/services/fishing/computeFishingInteractables";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeFishingInteractables, () => {
  const HEIGHT = 3;
  const getHeight = () => HEIGHT;
  const gameText = { [GameTextKey.Fishing]: "Fishing" };
  const fishingPoint: FishingPointPlace = { id: "1", position: { x: 1, z: 2 } };

  test("fishing opens at a point once the Serenitea Pot is owned", () => {
    expect.hasAssertions();

    expect(computeFishingInteractables([fishingPoint], true, gameText, getHeight)).toStrictEqual([
      { id: "1", kind: InteractionKind.Use, name: "Fishing", position: { x: 1, y: HEIGHT, z: 2 } },
    ]);
  });

  test("fishing stays closed before the Serenitea Pot is owned", () => {
    expect.hasAssertions();

    expect(computeFishingInteractables([fishingPoint], false, gameText, getHeight)).toStrictEqual([]);
  });
});
