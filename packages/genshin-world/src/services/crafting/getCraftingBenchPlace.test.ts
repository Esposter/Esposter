import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupMemberKind } from "#src/models/sceneGroup/SceneGroupMemberKind";
import { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import { MONDSTADT_CRAFTING_BENCH_GROUP_ID, MONDSTADT_CRAFTING_BENCH_NPC_ID } from "#src/services/crafting/constants";
import { getCraftingBenchPlace } from "#src/services/crafting/getCraftingBenchPlace";
import { describe, expect, test } from "vitest";

describe(getCraftingBenchPlace, () => {
  const place = { height: 5, position: { x: 10, z: 20 }, rotationY: 90, source: SceneGroupSource.NpcBirths };

  test("mondstadt's bench stands at its recorded place", () => {
    expect.hasAssertions();

    const sceneGroups: SceneGroups = {
      buildings: {},
      groups: {
        [MONDSTADT_CRAFTING_BENCH_GROUP_ID]: [
          {
            kind: SceneGroupMemberKind.Npc,
            objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
            place,
            source: SceneGroupSource.NpcBirths,
          },
        ],
      },
    };

    expect(getCraftingBenchPlace(sceneGroups)).toStrictEqual(place);
  });
});
