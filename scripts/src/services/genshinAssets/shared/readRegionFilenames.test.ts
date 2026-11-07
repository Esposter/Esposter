import { readRegionFilenames } from "#src/services/genshinAssets/shared/readRegionFilenames";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readRegionFilenames, () => {
  let regionsDirectory: string;

  beforeEach(async () => {
    regionsDirectory = await mkdtemp(join(tmpdir(), "region-filenames-"));
  });

  afterEach(async () => {
    await rm(regionsDirectory, { force: true, recursive: true });
  });

  test("a region file's provenance sidecar is no region, so it is left out beside the region", async () => {
    expect.hasAssertions();
    await writeFile(join(regionsDirectory, "mondstadt.json"), "{}");
    await writeFile(join(regionsDirectory, "mondstadt.json.provenance.json"), "{}");
    await writeFile(join(regionsDirectory, "liyue.json"), "{}");

    expect((await readRegionFilenames(regionsDirectory)).toSorted()).toStrictEqual(["liyue.json", "mondstadt.json"]);
  });
});
