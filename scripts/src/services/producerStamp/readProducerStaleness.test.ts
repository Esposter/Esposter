import { PRODUCER_STAMP_NAME } from "#src/services/producerStamp/constants";
import { readProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";
import { writeProducerStamp } from "#src/services/producerStamp/writeProducerStamp";
import { runGit } from "#src/services/shared/runGit";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readProducerStaleness, () => {
  const producerPath = "scripts/src/services/producerStamp";
  const unknownCommit = "0".repeat(40);
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "producer-stamp-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads no stamp and no commits from an output that has none", async () => {
    expect.hasAssertions();

    expect(await readProducerStaleness(directory)).toStrictEqual({ commits: [], isApproximate: false });
  });

  test("lists no commits for an output stamped at HEAD", async () => {
    expect.hasAssertions();

    await writeProducerStamp(directory, [producerPath]);

    const { commits, stamp } = await readProducerStaleness(directory);

    expect(stamp?.commit).toBe(runGit(["rev-parse", "HEAD"]).trim());
    expect(stamp?.producerPaths).toStrictEqual([producerPath]);
    expect(commits).toStrictEqual([]);
  });

  test("reads the recent window as an approximation when the stamp's commit is one git does not know", async () => {
    expect.hasAssertions();

    writeJsonFile(join(directory, PRODUCER_STAMP_NAME), {
      commit: unknownCommit,
      isDirty: false,
      producerPaths: [producerPath],
    });

    const { isApproximate } = await readProducerStaleness(directory);

    expect(isApproximate).toBe(true);
  });
});
