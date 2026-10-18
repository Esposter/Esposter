import { toCraftingBenchPlaces } from "#src/services/genshinAssets/crafting/buildCraftingBenchPlaces";
import {
  MONDSTADT_CRAFTING_BENCH_GROUP_ID,
  MONDSTADT_CRAFTING_BENCH_NPC_ID,
} from "#src/services/genshinAssets/crafting/constants";
import type { SceneGroups } from "genshin-world";

import { SceneGroupMemberKind, SceneGroupSource } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toCraftingBenchPlaces, () => {
  const origin = [100, 0, 20] as const;
  // The map points are in the game's axes, as the bench's place is
  const regionMapPoints = [{ position: { x: 112, z: -48 }, region: "mondstadt" }];
  const sceneGroups: SceneGroups = {
    buildings: {},
    groups: {
      [MONDSTADT_CRAFTING_BENCH_GROUP_ID]: [
        {
          kind: SceneGroupMemberKind.Npc,
          objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
          place: { position: { x: 110, z: -50 }, rotationY: 90, source: SceneGroupSource.NpcBirths },
          source: SceneGroupSource.NpcBirths,
        },
      ],
    },
  };

  test("mondstadt's bench stands at its recorded place", () => {
    expect.hasAssertions();

    expect(toCraftingBenchPlaces(sceneGroups, origin, regionMapPoints).objects).toStrictEqual({
      "craftingBenchPlaces/mondstadt": { position: { x: 10, z: 70 }, rotation: -1.5708 },
    });
  });

  test("the bench stands in no fitted region and is left out", () => {
    expect.hasAssertions();

    expect(
      toCraftingBenchPlaces(sceneGroups, origin, [{ position: { x: 9000, z: 9000 }, region: "liyue" }]).objects,
    ).toStrictEqual({});
  });
});
