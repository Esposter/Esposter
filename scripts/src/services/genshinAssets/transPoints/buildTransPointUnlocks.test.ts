import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { buildTransPointUnlocks } from "#src/services/genshinAssets/transPoints/buildTransPointUnlocks";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"));

describe(buildTransPointUnlocks, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("keys the open world's unlock rows under the transport points dataset, sorted by point id", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValueOnce([
      { pointId: 1884, sceneId: OPEN_WORLD_SCENE_ID },
      { pointId: 1008, sceneId: OPEN_WORLD_SCENE_ID },
    ]);

    expect(buildTransPointUnlocks()).toStrictEqual({
      "transPoints/unlock": [
        { pointId: 1008, sceneId: OPEN_WORLD_SCENE_ID },
        { pointId: 1884, sceneId: OPEN_WORLD_SCENE_ID },
      ],
    });
    expect(readExcelTable).toHaveBeenCalledExactlyOnceWith("TransPointUnlockConfigData");
  });

  test("leaves out a row in another scene", () => {
    expect.hasAssertions();

    vi.mocked(readExcelTable).mockReturnValueOnce([
      { pointId: 1008, sceneId: OPEN_WORLD_SCENE_ID },
      { pointId: 7, sceneId: OPEN_WORLD_SCENE_ID + 1 },
    ]);

    expect(buildTransPointUnlocks()).toStrictEqual({
      "transPoints/unlock": [{ pointId: 1008, sceneId: OPEN_WORLD_SCENE_ID }],
    });
  });
});
