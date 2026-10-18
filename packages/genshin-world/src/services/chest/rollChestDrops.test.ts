import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { ChestKind } from "#src/models/chest/ChestKind";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";
import { describe, expect, test } from "vitest";

// Made-up pieces under the set ids the chest pools name, so the test reads no game data
const createReliquarySet = (id: number, pieces: [number, ArtifactSlot][]): ReliquarySetData => ({
  id,
  nameTextId: `TEST_SET_${id}`,
  needCounts: [2, 4],
  pieces: pieces.map(([itemId, slot]) => ({ itemId, nameTextId: `TEST_PIECE_${itemId}`, rank: 1, rarity: 5, slot })),
});

const LOW_SET_A = createReliquarySet(10_010, [
  [90_001, ArtifactSlot.CircletOfLogos],
  [90_002, ArtifactSlot.FlowerOfLife],
]);
const LOW_SET_B = createReliquarySet(10_011, [
  [90_003, ArtifactSlot.CircletOfLogos],
  [90_004, ArtifactSlot.FlowerOfLife],
  [90_005, ArtifactSlot.GobletOfEonothem],
]);
const HIGH_SET = createReliquarySet(10_005, [[90_006, ArtifactSlot.CircletOfLogos]]);
const RELIQUARY_SETS = [LOW_SET_A, LOW_SET_B, HIGH_SET];

describe(rollChestDrops, () => {
  test("pours one weapon and one artifact piece of its pool, and each material's count, a material rolling none left out", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Common, () => 0, RELIQUARY_SETS)).toStrictEqual([
      { count: 1, itemId: 11_101 },
      { count: 1, itemId: 90_001 },
      { count: 4, itemId: 104_001 },
      { count: 1, itemId: 104_002 },
    ]);
    expect(rollChestDrops(ChestKind.Common, () => 0.999, RELIQUARY_SETS)).toStrictEqual([
      { count: 1, itemId: 15_305 },
      { count: 1, itemId: 90_005 },
      { count: 4, itemId: 104_001 },
      { count: 3, itemId: 104_002 },
      { count: 2, itemId: 104_003 },
    ]);
  });

  test("pours no artifact when the reliquary sets hold none of its pool's sets", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Common, () => 0, [HIGH_SET])).toStrictEqual([
      { count: 1, itemId: 11_101 },
      { count: 4, itemId: 104_001 },
      { count: 1, itemId: 104_002 },
    ]);
  });

  test("pours no weapon from a tier whose pool names none", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Precious, () => 0.999, RELIQUARY_SETS)).toStrictEqual([
      { count: 1, itemId: 90_006 },
      { count: 1, itemId: 104_002 },
      { count: 1, itemId: 104_003 },
    ]);
  });

  test("pours nothing from a kind with no pool", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Remarkable, () => 0.999, RELIQUARY_SETS)).toStrictEqual([]);
  });
});
