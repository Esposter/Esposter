import type { CityAreaFile } from "#src/models/genshinAssets/world/CityAreaFile";
import type { extractCityAreas as baseExtractCityAreas } from "#src/services/genshinAssets/world/extractCityAreas";
import type { readCityAreaCandidates as baseReadCityAreaCandidates } from "#src/services/genshinAssets/world/readCityAreaCandidates";

import { buildCityAreas } from "#src/services/genshinAssets/world/buildCityAreas";
import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { rmSync } from "node:fs";
import { dirname } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The city areas file is a temporary one, so no file of the repository's parity folder is read or written
const { CITY_AREA_FILE_PATH } = await vi.hoisted(async () => {
  const { mkdtempSync: makeDirectory } = await import("node:fs");
  const { tmpdir: temporaryDirectory } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return {
    CITY_AREA_FILE_PATH: joinPath(makeDirectory(joinPath(temporaryDirectory(), "city-areas-")), "city-areas.json"),
  };
});

const { extractCityAreas, readCityAreaCandidates, readGameVersion } = vi.hoisted(() => ({
  extractCityAreas: vi.fn<typeof baseExtractCityAreas>(),
  readCityAreaCandidates: vi.fn<typeof baseReadCityAreaCandidates>(),
  readGameVersion: vi.fn<() => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/world/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  CITY_AREA_FILE_PATH,
}));
// The extraction runs AnimeStudio over the install, which these tests do not run
vi.mock(import("#src/services/genshinAssets/world/extractCityAreas"), () => ({ extractCityAreas }));
vi.mock(import("#src/services/genshinAssets/world/readCityAreaCandidates"), () => ({ readCityAreaCandidates }));

describe(buildCityAreas, () => {
  const INSTALL_VERSION = "a";
  const CACHED: CityAreaFile = { areas: [], candidateCount: 0, gameVersion: INSTALL_VERSION };

  beforeEach(() => {
    vi.clearAllMocks();
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    readCityAreaCandidates.mockResolvedValue([]);
    extractCityAreas.mockResolvedValue([]);
  });

  afterEach(() => {
    rmSync(dirname(CITY_AREA_FILE_PATH), { force: true, recursive: true });
  });

  test("a cached file no stamp vouches for is extracted again and stamped", async () => {
    expect.hasAssertions();

    writeJsonFile(CITY_AREA_FILE_PATH, CACHED);

    await expect(buildCityAreas()).resolves.toStrictEqual(CACHED);
    expect(extractCityAreas).toHaveBeenCalledExactlyOnceWith([]);
    expect(checkIsVouchedBy(await readFileProvenance(CITY_AREA_FILE_PATH), INSTALL_VERSION)).toBe(true);
  });

  test("a cached file of this game version that its stamp vouches for is returned without extraction", async () => {
    expect.hasAssertions();

    writeJsonFile(CITY_AREA_FILE_PATH, CACHED);
    await writeStampedFiles([CITY_AREA_FILE_PATH], { command: "city-areas", producerPaths: [TEST_FILENAME] }, () => {});

    await expect(buildCityAreas()).resolves.toStrictEqual(CACHED);
    expect(extractCityAreas).not.toHaveBeenCalled();
  });
});
