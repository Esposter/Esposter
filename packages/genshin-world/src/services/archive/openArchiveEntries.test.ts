import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntries } from "#src/services/archive/openArchiveEntries";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createItem = (category: ItemCategory, id: number): InventoryItem => ({
  definition: { category, id, name: "", rank: 0, rarity: 0, stackLimit: 1 },
  id,
  quantity: 1,
});

describe(openArchiveEntries, () => {
  const emptyProgress: ArchiveProgress = new Map();

  test("opens a weapon's Equipment entry and a material's Materials entry", () => {
    expect.hasAssertions();

    const progress = openArchiveEntries(emptyProgress, [
      createItem(ItemCategory.Weapon, 11101),
      createItem(ItemCategory.Material, 101_001),
    ]);

    expect(progress).toStrictEqual(
      new Map([
        [ArchiveSection.Equipment, new Set([11101])],
        [ArchiveSection.Materials, new Set([101_001])],
      ]),
    );
  });

  test("opens no entry for an artifact, whose set is not yet kept with its bag entries", () => {
    expect.hasAssertions();

    expect(openArchiveEntries(emptyProgress, [createItem(ItemCategory.Artifact, 2)])).toStrictEqual(emptyProgress);
  });

  test("keeps an opened entry and leaves the progress given as it was", () => {
    expect.hasAssertions();

    const progress: ArchiveProgress = new Map([[ArchiveSection.Materials, new Set([101_001])]]);

    const nextProgress = openArchiveEntries(progress, [createItem(ItemCategory.Material, 101_001)]);

    expect(nextProgress).toStrictEqual(new Map([[ArchiveSection.Materials, new Set([101_001])]]));
    expect(nextProgress).not.toBe(progress);
    expect(progress).toStrictEqual(new Map([[ArchiveSection.Materials, new Set([101_001])]]));
  });
});
