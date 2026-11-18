import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";

import { OfferingKind } from "#src/models/offering/OfferingKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { computeOfferingInteractables } from "#src/services/offering/computeOfferingInteractables";
import { InteractionKind } from "genshin-interface";
import { ENGLISH_GAME_TEXT, GameTextKey } from "genshin-text";
import { describe, expect, test } from "vitest";

describe(computeOfferingInteractables, () => {
  test("an offering appears at its map point", () => {
    expect.hasAssertions();

    const GROUND_HEIGHT = 3;
    const offering: OfferingLandmark = {
      id: "offering-46466",
      kind: LandmarkKind.Offering,
      offeringKind: OfferingKind.AmritaPool,
      position: { x: 1, z: 2 },
    };

    expect(computeOfferingInteractables([offering], ENGLISH_GAME_TEXT, () => GROUND_HEIGHT)).toStrictEqual([
      {
        id: "offering-46466",
        kind: InteractionKind.Activate,
        name: ENGLISH_GAME_TEXT[GameTextKey.AmritaPool],
        position: { x: 1, y: GROUND_HEIGHT, z: 2 },
      },
    ]);
  });
});
