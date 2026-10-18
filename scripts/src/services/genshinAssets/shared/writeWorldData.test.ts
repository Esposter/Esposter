import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { join } from "node:path";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/writeJsonFile"), () => ({ writeJsonFile: vi.fn<typeof writeJsonFile>() }));

describe(writeWorldData, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("a dry run writes no world data and returns the path it would write", async () => {
    expect.hasAssertions();

    await expect(writeWorldData("regions/liyue.json", { rivers: [] }, { isDryRun: true })).resolves.toBe(
      join(WORLD_DATA_DIRECTORY, "regions/liyue.json"),
    );
    expect(vi.mocked(writeJsonFile)).not.toHaveBeenCalled();
  });

  test("writes the data to its region file when it is not a dry run", async () => {
    expect.hasAssertions();

    await writeWorldData("regions/liyue.json", { rivers: [] });

    expect(vi.mocked(writeJsonFile)).toHaveBeenCalledWith(join(WORLD_DATA_DIRECTORY, "regions/liyue.json"), {
      rivers: [],
    });
  });
});
