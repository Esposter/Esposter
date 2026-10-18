import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs/promises"), () => ({ readFile: vi.fn<(...args: unknown[]) => Promise<never>>() }));
vi.mock(import("#src/services/genshinAssets/shared/readObjMesh"), () => ({ readObjMesh: vi.fn<typeof readObjMesh>() }));
vi.mock(import("#src/services/genshinAssets/shared/writeWorldData"), () => ({
  writeWorldData: vi.fn<typeof writeWorldData>(),
}));

describe(fitRiverCourses, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("writes the course of each water surface that is a river as the region's rivers, and no other placement", async () => {
    expect.hasAssertions();

    const placement = { position: [0, 0, 0], rotation: [0, 0, 0, 1], scale: [1, 1, 1] };
    const river = Array.from({ length: 7 }, (_, x) => [-1, 1].map((z) => [x, 10 - x / 2, z])).flat();
    const pond = [0, 4].flatMap((x) => [0, 4].map((z) => [x, 0, z]));
    vi.mocked(readFile)
      .mockResolvedValueOnce(
        JSON.stringify({
          placements: [
            { ...placement, mesh: "Eff_Model_WaterFall_A" },
            { ...placement, mesh: "Area_Ly_Water_LYG_Slums_02_Vo" },
            { ...placement, mesh: "Area_Ly_Water_LYG_Qunyuge_01_Vo" },
          ],
        }),
      )
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [] }));
    vi.mocked(readObjMesh)
      .mockResolvedValueOnce({ vertices: river } as Awaited<ReturnType<typeof readObjMesh>>)
      .mockResolvedValueOnce({ vertices: pond } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeWorldData).mockResolvedValueOnce("regions/liyue.json");

    await fitRiverCourses(DerivedAssetComponent.Liyue, { isDryRun: false });

    expect(vi.mocked(readObjMesh)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(writeWorldData).mock.calls[0]?.[1]).toStrictEqual({
      enemyCamps: [],
      rivers: [Array.from({ length: 7 }, (_, x) => ({ level: 10 - x / 2, width: 2, x, z: 0 }))],
    });
  });

  test("a dry run writes no region data and says nothing was written", async () => {
    expect.hasAssertions();

    const placement = {
      mesh: "Area_Ly_Water_LYG_Slums_02_Vo",
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      scale: [1, 1, 1],
    };
    const river = Array.from({ length: 7 }, (_, x) => [-1, 1].map((z) => [x, 10 - x / 2, z])).flat();
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify({ placements: [placement] }))
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [] }));
    vi.mocked(readObjMesh).mockResolvedValueOnce({ vertices: river } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeWorldData).mockResolvedValueOnce("regions/liyue.json");

    const { notes } = await fitRiverCourses(DerivedAssetComponent.Liyue, { isDryRun: true });

    expect(vi.mocked(writeWorldData).mock.calls[0]?.[2]).toStrictEqual({ isDryRun: true });
    expect(notes).toStrictEqual(["regions/liyue.json: 1 river courses, 7 course points, nothing written"]);
  });
});
