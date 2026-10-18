import type { Catalogue } from "#src/models/world/Catalogue";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { WorldLayer } from "#src/models/world/WorldLayer";
import { findRegionIdAt } from "#src/services/world/findRegionIdAt";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

const square = (x: number, z: number) => [
  { x, z },
  { x: x + 10, z },
  { x: x + 10, z: z + 10 },
  { x, z: z + 10 },
];
const area = (id: string, outline: ReturnType<typeof square>): CatalogueArea => ({
  id,
  layer: WorldLayer.Surface,
  name: id,
  outline,
  subareas: [],
  subregion: "",
  weathers: [WeatherKind.Clear],
});
const catalogue: Catalogue = {
  regions: [
    { areas: [area("windrise", square(0, 0))], id: "mondstadt", name: "Mondstadt" },
    { areas: [area("liyue-harbor", square(100, 0))], id: "liyue", name: "Liyue" },
  ],
};

describe(findRegionIdAt, () => {
  test("a point stands in the region whose area holds it, and in none where no area does", () => {
    expect.hasAssertions();

    expect(findRegionIdAt(catalogue, 5, 5)).toBe("mondstadt");
    expect(findRegionIdAt(catalogue, 105, 5)).toBe("liyue");
    expect(findRegionIdAt(catalogue, 50, 50)).toBeUndefined();
  });
});
