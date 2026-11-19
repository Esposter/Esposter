import type { readVouchedFileProvenance } from "#src/services/provenance/readVouchedFileProvenance";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { writeRegionData } from "#src/services/genshinAssets/shared/writeRegionData";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs/promises"), () => ({ readFile: vi.fn<(...args: unknown[]) => Promise<never>>() }));
vi.mock(import("#src/services/genshinAssets/shared/readObjMesh"), () => ({ readObjMesh: vi.fn<typeof readObjMesh>() }));
vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: vi.fn<() => Promise<string>>().mockResolvedValue("a"),
}));
vi.mock(import("#src/services/provenance/readVouchedFileProvenance"), () => ({
  readVouchedFileProvenance: vi.fn<typeof readVouchedFileProvenance>(),
}));
vi.mock(import("#src/services/genshinAssets/shared/writeRegionData"), () => ({
  writeRegionData: vi.fn<typeof writeRegionData>(),
}));

describe(fitWaterfallSheets, () => {
  const REGION_FILE = join("regions", "liyue.json");
  const WATERFALL = { across: { x: 1, y: 0, z: 0 }, drop: 5, lip: { x: 0.5, y: 5, z: 10 }, width: 1 };

  test("a fall stands at the game's lip", async () => {
    expect.hasAssertions();

    const placement = {
      materials: [],
      mesh: "Eff_Model_WaterFall_A",
      position: [0, 0, 10],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify({ materials: {}, placements: [placement] }))
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [], landmarks: [] }));
    vi.mocked(readObjMesh).mockResolvedValueOnce({
      vertices: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 5, 0],
        [0, 5, 0],
      ],
    } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeRegionData).mockResolvedValueOnce("regions/liyue.json");

    await fitWaterfallSheets(DerivedAssetComponent.Liyue, { isDryRun: false });

    expect(writeRegionData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      { enemyCamps: [], landmarks: [], waterfalls: [WATERFALL] },
      { isDryRun: false },
    );
  });

  test("a dry run writes no region data and says nothing was written", async () => {
    expect.hasAssertions();

    const placement = {
      materials: [],
      mesh: "Eff_Model_WaterFall_A",
      position: [0, 0, 10],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify({ materials: {}, placements: [placement] }))
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [], landmarks: [] }));
    vi.mocked(readObjMesh).mockResolvedValueOnce({
      vertices: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 5, 0],
        [0, 5, 0],
      ],
    } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeRegionData).mockResolvedValueOnce("regions/liyue.json");

    const { notes } = await fitWaterfallSheets(DerivedAssetComponent.Liyue, { isDryRun: true });

    expect(writeRegionData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      { enemyCamps: [], landmarks: [], waterfalls: [WATERFALL] },
      { isDryRun: true },
    );
    expect(notes).toStrictEqual(["regions/liyue.json: 1 waterfall sheets, nothing written"]);
  });
});
