import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs/promises"), () => ({ readFile: vi.fn<(...args: unknown[]) => Promise<never>>() }));
vi.mock(import("#src/services/genshinAssets/shared/readObjMesh"), () => ({ readObjMesh: vi.fn<typeof readObjMesh>() }));
vi.mock(import("#src/services/genshinAssets/shared/writeWorldData"), () => ({
  writeWorldData: vi.fn<typeof writeWorldData>(),
}));

describe(fitWaterfallSheets, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("turns a placed fall's vertices into three's axes first, so its lip lands where the layout's placement stands it", async () => {
    expect.hasAssertions();

    const placement = { mesh: "Eff_Model_WaterFall_A", position: [0, 0, 10], rotation: [0, 0, 0, 1], scale: [1, 1, 1] };
    vi.mocked(readFile)
      .mockResolvedValueOnce(JSON.stringify({ placements: [placement] }))
      .mockResolvedValueOnce(JSON.stringify({ enemyCamps: [] }));
    vi.mocked(readObjMesh).mockResolvedValueOnce({
      vertices: [
        [0, 0, 0],
        [1, 0, 0],
        [1, 5, 0],
        [0, 5, 0],
      ],
    } as Awaited<ReturnType<typeof readObjMesh>>);
    vi.mocked(writeWorldData).mockResolvedValueOnce("regions/liyue.json");

    await fitWaterfallSheets(DerivedAssetComponent.Liyue);

    expect(vi.mocked(writeWorldData).mock.calls[0]?.[1]).toStrictEqual({
      enemyCamps: [],
      waterfalls: [{ across: { x: 1, y: 0, z: 0 }, drop: 5, lip: { x: 0.5, y: 5, z: 10 }, width: 1 }],
    });
  });
});
