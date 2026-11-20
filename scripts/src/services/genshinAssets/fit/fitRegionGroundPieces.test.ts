import type { GroundSource } from "#src/models/genshinAssets/fit/GroundSource";
import type { GroundPieceArea } from "#src/models/genshinAssets/shared/GroundPieceArea";
import type { GroundPoint } from "genshin-engine";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ORIGIN } from "#src/services/genshinAssets/fit/constants";
import { fitRegionGroundPieces } from "#src/services/genshinAssets/fit/fitRegionGroundPieces";
import { WorldLayer } from "genshin-world";
import { describe, expect, test } from "vitest";

// A square outline of the given side in metres, centred on the origin
const createSquareOutline = (side: number): GroundPoint[] => {
  const half = side / 2;
  return [
    { x: -half, z: -half },
    { x: half, z: -half },
    { x: half, z: half },
    { x: -half, z: half },
  ];
};

describe(fitRegionGroundPieces, () => {
  test("does not refuse a region for an area with no outline on another layer", async () => {
    expect.hasAssertions();

    // A side of 240 metres reads 1681 samples on the fit's six metre grid, past the gate's minimum, over flat ground
    const source: GroundSource = {
      getGameHeight: () => 0,
      landmarks: [],
      origin: ORIGIN,
      readCityAreas: () => Promise.resolve([]),
    };
    const areas: GroundPieceArea[] = [
      { id: "0", layer: WorldLayer.Surface, outline: createSquareOutline(240) },
      { id: "1", layer: WorldLayer.UndergroundMines, outline: [] },
    ];
    const fit = await fitRegionGroundPieces(DerivedAssetComponent.Liyue, areas, Promise.resolve(source), () =>
      Promise.resolve([{ base: 0, features: [], hills: [] }]),
    );

    expect(fit.isQualified).toBe(true);
    expect(fit.reason).toBe("");
  });

  test("still refuses a region for a surface area with no outline", async () => {
    expect.hasAssertions();

    const source: GroundSource = {
      getGameHeight: () => 0,
      landmarks: [],
      origin: ORIGIN,
      readCityAreas: () => Promise.resolve([]),
    };
    const areas: GroundPieceArea[] = [
      { id: "0", layer: WorldLayer.Surface, outline: createSquareOutline(240) },
      { id: "1", layer: WorldLayer.Surface, outline: [] },
    ];
    const fit = await fitRegionGroundPieces(DerivedAssetComponent.Liyue, areas, Promise.resolve(source), () =>
      Promise.resolve([{ base: 0, features: [], hills: [] }]),
    );

    expect(fit.isQualified).toBe(false);
    expect(fit.reason).toBe("1 has no outline");
  });
});
