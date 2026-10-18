import { findCraftingBenchMember } from "#src/services/genshinAssets/crafting/findCraftingBenchMember";
import {
  MONDSTADT_CRAFTING_BENCH_GROUP_ID,
  MONDSTADT_CRAFTING_BENCH_NPC_ID,
} from "#src/services/genshinAssets/crafting/constants";
import { SceneGroupMemberKind, SceneGroupSource } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(findCraftingBenchMember, () => {
  const place = { position: { x: 1, z: 2 }, source: SceneGroupSource.NpcBirths };

  test("finds the bench's NPC member in the bench's group, not one of the same id in another group", () => {
    expect.hasAssertions();

    expect(
      findCraftingBenchMember({
        buildings: {},
        groups: {
          [MONDSTADT_CRAFTING_BENCH_GROUP_ID]: [
            { kind: SceneGroupMemberKind.Npc, objectId: 1003, place, source: SceneGroupSource.NpcBirths },
            {
              kind: SceneGroupMemberKind.Npc,
              objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
              place,
              source: SceneGroupSource.NpcBirths,
            },
          ],
          1: [
            {
              kind: SceneGroupMemberKind.Npc,
              objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
              place: { position: { x: 9, z: 9 }, source: SceneGroupSource.NpcBirths },
              source: SceneGroupSource.NpcBirths,
            },
          ],
        },
      }),
    ).toStrictEqual({
      kind: SceneGroupMemberKind.Npc,
      objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
      place,
      source: SceneGroupSource.NpcBirths,
    });
  });

  test("finds no bench when the record holds no bench group", () => {
    expect.hasAssertions();

    expect(
      findCraftingBenchMember({
        buildings: {},
        groups: {
          1: [
            {
              kind: SceneGroupMemberKind.Npc,
              objectId: MONDSTADT_CRAFTING_BENCH_NPC_ID,
              place,
              source: SceneGroupSource.NpcBirths,
            },
          ],
        },
      }),
    ).toBeUndefined();
  });
});
