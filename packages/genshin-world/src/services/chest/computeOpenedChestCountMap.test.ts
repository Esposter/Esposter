import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { ChestKind } from "#src/models/chest/ChestKind";
import { Currency } from "#src/models/inventory/Currency";
import { computeOpenedChestCountMap } from "#src/services/chest/computeOpenedChestCountMap";
import { openChest } from "#src/services/chest/openChest";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(computeOpenedChestCountMap, () => {
  const NO_ARTIFACT_DROP_TABLES = { artifactMainAffixPools: [], artifactRarityDataMap: new Map(), reliquarySets: [] };
  const AREA_ID = "galesong-hill";
  const areas: Pick<CatalogueArea, "id" | "outline">[] = [
    {
      id: AREA_ID,
      outline: [
        { x: 0, z: 0 },
        { x: 10, z: 0 },
        { x: 10, z: 10 },
        { x: 0, z: 10 },
      ],
    },
  ];
  const insideChest: ChestPlace = { id: "chest-inside", kind: ChestKind.Common, position: { x: 5, z: 5 } };
  const outsideChest: ChestPlace = { id: "chest-outside", kind: ChestKind.Common, position: { x: 50, z: 50 } };

  test("an opened chest counts once toward its area's exploration", () => {
    expect.hasAssertions();

    expect(
      computeOpenedChestCountMap(areas, [insideChest, outsideChest], new Set([insideChest.id, outsideChest.id])),
    ).toStrictEqual(new Map([[AREA_ID, 1]]));
  });

  test("reopening a chest adds nothing to the count", () => {
    expect.hasAssertions();

    const opening = openChest(
      insideChest,
      new Set(),
      EMPTY_WALLET,
      () => 0,
      Currency.AnemoSigil,
      false,
      NO_ARTIFACT_DROP_TABLES,
    );
    const reopening = openChest(
      insideChest,
      opening.openedChestIds,
      opening.wallet,
      () => 0,
      Currency.AnemoSigil,
      false,
      NO_ARTIFACT_DROP_TABLES,
    );
    expect(computeOpenedChestCountMap(areas, [insideChest], reopening.openedChestIds)).toStrictEqual(
      new Map([[AREA_ID, 1]]),
    );
  });
});
