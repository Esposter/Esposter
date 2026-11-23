import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

import { fitRegionWaypoints } from "#src/services/genshinAssets/fit/fitRegionWaypoints";
import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { readWorldGroundHeight } from "#src/services/genshinAssets/shared/readWorldGroundHeight";
import { readWorldRecord } from "#src/services/genshinAssets/shared/readWorldRecord";
import { writeRegionData } from "#src/services/genshinAssets/shared/writeRegionData";
import { readSceneTransportPoints } from "#src/services/genshinAssets/world/readSceneTransportPoints";
import { LandmarkKind } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs/promises"));
vi.mock(import("#src/services/genshinAssets/residents/readFittedRegions"));
vi.mock(import("#src/services/genshinAssets/shared/readWorldGroundHeight"));
vi.mock(import("#src/services/genshinAssets/shared/readWorldRecord"));
vi.mock(import("#src/services/genshinAssets/shared/writeRegionData"));
vi.mock(import("#src/services/genshinAssets/world/readSceneTransportPoints"));

describe(fitRegionWaypoints, () => {
  const IDENTITY_TRANSFORM: SimilarityTransform = { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 };
  const LIYUE_FILE = join("regions", "liyue.json");
  // Liyue's fit matched no point, so it has no residual and is in no region file of the fit, yet its earlier run's
  // Waypoint stands
  const staleWaypoint = {
    areaId: "1",
    id: "liyue-waypoint-1",
    kind: LandmarkKind.TeleportWaypoint,
    position: { x: 0, z: 0 },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({
        regions: [
          { areas: [], id: "liyue", name: "Liyue" },
          { areas: [], id: "mondstadt", name: "Mondstadt" },
          { areas: [], id: "nod-krai", name: "Nod-Krai" },
        ],
      }),
    );
    vi.mocked(readFittedRegions).mockResolvedValue({
      origin: [0, 0, 0],
      points: [],
      regionFiles: [],
      regionFits: [{ matched: 0, oculusCount: 0, oculusWikiCount: 0, region: "liyue" }],
      regionMapPoints: [],
      transform: IDENTITY_TRANSFORM,
    });
    vi.mocked(readWorldGroundHeight).mockResolvedValue(() => 0);
    vi.mocked(readSceneTransportPoints).mockResolvedValue([]);
    vi.mocked(readWorldRecord).mockImplementation((file) =>
      Promise.resolve(JSON.stringify({ landmarks: file === LIYUE_FILE ? [staleWaypoint] : [], residents: [] })),
    );
  });

  test("a waypoint region the fit matched no point in loses the waypoints an earlier run wrote", async () => {
    expect.hasAssertions();

    await fitRegionWaypoints({ isDryRun: false });

    expect(writeRegionData).toHaveBeenCalledExactlyOnceWith(LIYUE_FILE, { landmarks: [], residents: [] });
  });
});
