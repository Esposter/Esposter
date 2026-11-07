import type { writeStampedFiles as baseWriteStampedFiles } from "#src/services/provenance/writeStampedFiles";

import { GENSHIN_ASSETS_PRODUCER_PATHS, WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { takeOne } from "@esposter/shared";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/shared/writeJsonFile"), () => ({ writeJsonFile: vi.fn<typeof writeJsonFile>() }));
vi.mock(import("#src/services/provenance/writeStampedFiles"), () => ({
  writeStampedFiles: vi.fn<typeof baseWriteStampedFiles>(async (_files, _options, write) => {
    await write();
  }),
}));

describe(writeWorldData, () => {
  test("a dry run writes no world data and returns the path it would write", async () => {
    expect.hasAssertions();

    await expect(writeWorldData("regions/liyue.json", { rivers: [] }, { isDryRun: true })).resolves.toBe(
      join(WORLD_DATA_DIRECTORY, "regions/liyue.json"),
    );
    expect(vi.mocked(writeJsonFile)).not.toHaveBeenCalled();
    expect(vi.mocked(writeStampedFiles)).not.toHaveBeenCalled();
  });

  test("writes the data to its region file, which carries its sidecar beside it", async () => {
    expect.hasAssertions();

    await writeWorldData("regions/liyue.json", { rivers: [] });

    expect(vi.mocked(writeJsonFile)).toHaveBeenCalledWith(join(WORLD_DATA_DIRECTORY, "regions/liyue.json"), {
      rivers: [],
    });
    const [files, options, write] = takeOne(vi.mocked(writeStampedFiles).mock.calls, 0);
    expect(files).toStrictEqual([join(WORLD_DATA_DIRECTORY, "regions/liyue.json")]);
    expect(options).toStrictEqual({
      command: "record regions/liyue.json",
      producerPaths: GENSHIN_ASSETS_PRODUCER_PATHS,
    });
    expect(write).toBeTypeOf("function");
  });
});
