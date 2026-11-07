import { readFittedRegions } from "#src/services/genshinAssets/residents/readFittedRegions";
import { writeFileProvenance } from "#src/services/provenance/writeFileProvenance";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The world package's data folder is a temporary one for the test, so no record of the repository is read or written
const { WORLD_DATA_ROOT } = await vi.hoisted(async () => {
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { WORLD_DATA_ROOT: joinPath(tmpdir(), "read-fitted-regions-test") };
});

const { readGameVersion } = vi.hoisted(() => ({ readGameVersion: vi.fn<() => Promise<string>>() }));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/constants"), async (importOriginal) => {
  const { join: joinPath } = await import("node:path");
  return { ...(await importOriginal()), WORLD_DATA_DIRECTORY: joinPath(WORLD_DATA_ROOT, "data") };
});
// The fit's own inputs are not under test: one fitted region with no points, over an identity transform
vi.mock(import("#src/services/genshinAssets/points/readFittedMapPoints"), () => ({
  readFittedMapPoints: () =>
    Promise.resolve({
      points: [],
      regions: [{ matched: 1, oculusCount: 0, oculusWikiCount: 0, region: "liyue", residual: 0 }],
      transform: { mirrored: false, offset: { x: 0, z: 0 }, scale: 1, turn: 0 },
    }),
}));
vi.mock(import("#src/services/genshinAssets/world/readWorldOrigin"), () => ({
  readWorldOrigin: () => Promise.resolve([0, 0, 0]),
}));

describe(readFittedRegions, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const REGION_PATH = join(WORLD_DATA_ROOT, "data", "regions", "liyue.json");

  beforeEach(() => {
    mkdirSync(join(WORLD_DATA_ROOT, "data", "regions"), { recursive: true });
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    writeJsonFile(REGION_PATH, { landmarks: [] });
  });

  afterEach(() => {
    rmSync(WORLD_DATA_ROOT, { force: true, recursive: true });
  });

  test("a fit refuses a region record whose sidecar names another game version", async () => {
    expect.hasAssertions();

    readGameVersion.mockResolvedValueOnce(OTHER_VERSION);
    await writeFileProvenance(REGION_PATH, { command: "fixture", producerPaths: [] });

    await expect(readFittedRegions()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: liyue.json, is stamped with game b, not the install's a]`,
    );
  });
});
