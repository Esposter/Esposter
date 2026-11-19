import type { readVouchedFileProvenance } from "#src/services/provenance/readVouchedFileProvenance";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
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

describe(fitRiverCourses, () => {
  const river = Array.from({ length: 7 }, (_value, x) => [-1, 1].map((z) => [x, 10 - x / 2, z])).flat();
  const REGION_FILE = join("regions", "liyue.json");
  const COURSE = [
    { level: 10, width: 2, x: 0, z: 0 },
    { level: 9.5, width: 2, x: 1, z: 0 },
    { level: 9, width: 2, x: 2, z: 0 },
    { level: 8.5, width: 2, x: 3, z: 0 },
    { level: 8, width: 2, x: 4, z: 0 },
    { level: 7.5, width: 2, x: 5, z: 0 },
    { level: 7, width: 2, x: 6, z: 0 },
  ];

  test("writes the course of each water surface that is a river as the region's rivers, and no other placement", async () => {
    expect.hasAssertions();

    const placement = { materials: [], position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] };
    const pond = [0, 4].flatMap((x) => [0, 4].map((z) => [x, 0, z]));
    vi.mocked(readFile)
      .mockResolvedValueOnce(
        JSON.stringify({
          materials: {},
          placements: [
            { ...placement, mesh: "Eff_Model_WaterFall_A" },
            { ...placement, mesh: "Area_Ly_Water_LYG_Slums_02_Vo" },
            { ...placement, mesh: "Area_Ly_Water_LYG_Qunyuge_01_Vo" },
          ],
        }),
      )
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [], landmarks: [] }));
    vi.mocked(readObjMesh)
      .mockResolvedValueOnce({ vertices: river } as Awaited<ReturnType<typeof readObjMesh>>)
      .mockResolvedValueOnce({ vertices: pond } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeRegionData).mockResolvedValueOnce("regions/liyue.json");

    await fitRiverCourses(DerivedAssetComponent.Liyue, { isDryRun: false });

    expect(vi.mocked(readObjMesh)).toHaveBeenCalledTimes(2);
    expect(writeRegionData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      { enemyCamps: [], landmarks: [], rivers: [COURSE] },
      { isDryRun: false },
    );
  });

  test("a dry run writes no region data and says nothing was written", async () => {
    expect.hasAssertions();

    const placement = {
      materials: [],
      mesh: "Area_Ly_Water_LYG_Slums_02_Vo",
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify({ materials: {}, placements: [placement] }))
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [], landmarks: [] }));
    vi.mocked(readObjMesh).mockResolvedValueOnce({ vertices: river } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeRegionData).mockResolvedValueOnce("regions/liyue.json");

    const { notes } = await fitRiverCourses(DerivedAssetComponent.Liyue, { isDryRun: true });

    expect(writeRegionData).toHaveBeenCalledExactlyOnceWith(
      REGION_FILE,
      { enemyCamps: [], landmarks: [], rivers: [COURSE] },
      { isDryRun: true },
    );
    expect(notes).toStrictEqual(["regions/liyue.json: 1 river courses, 7 course points, nothing written"]);
  });
});
