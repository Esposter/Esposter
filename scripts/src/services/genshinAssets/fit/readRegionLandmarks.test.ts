import { readRegionLandmarks } from "#src/services/genshinAssets/fit/readRegionLandmarks";
import { writeFileProvenance } from "#src/services/provenance/writeFileProvenance";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The world package's data folder is a temporary one for the test, so no record of the repository is read or written
const { WORLD_DATA_ROOT } = await vi.hoisted(async () => {
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { WORLD_DATA_ROOT: joinPath(tmpdir(), "read-region-landmarks-test") };
});

const { readGameVersion } = vi.hoisted(() => ({ readGameVersion: vi.fn<() => Promise<string>>() }));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/constants"), async (importOriginal) => {
  const { join: joinPath } = await import("node:path");
  return { ...(await importOriginal()), WORLD_DATA_DIRECTORY: joinPath(WORLD_DATA_ROOT, "data") };
});

describe(readRegionLandmarks, () => {
  const INSTALL_VERSION = "a";
  const REGION_PATH = join(WORLD_DATA_ROOT, "data", "regions", "liyue.json");
  const LANDMARK = { id: "fixture-landmark" };

  beforeEach(async () => {
    mkdirSync(join(WORLD_DATA_ROOT, "data", "regions"), { recursive: true });
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    writeJsonFile(REGION_PATH, { landmarks: [LANDMARK] });
    await writeFileProvenance(REGION_PATH, { command: "fixture", producerPaths: [] });
  });

  afterEach(() => {
    rmSync(WORLD_DATA_ROOT, { force: true, recursive: true });
  });

  test("a region's sidecar is not read as a region", async () => {
    expect.hasAssertions();

    await expect(readRegionLandmarks()).resolves.toStrictEqual([LANDMARK]);
  });
});
