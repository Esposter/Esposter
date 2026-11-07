import { readProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { writeProvenance } from "#src/services/provenance/writeProvenance";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runGit } from "#src/services/shared/runGit";
import { setupFixtureRepository } from "#src/services/shared/setupFixtureRepository.test";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readGameVersion: mockedReadGameVersion } = vi.hoisted(() => ({
  readGameVersion: vi.fn<() => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: mockedReadGameVersion,
}));

describe(readProducerStaleness, () => {
  const INSTALL_VERSION = "a";
  const producerPath = "scripts/src/services/producerStamp";
  const unknownCommit = "0".repeat(40);
  const { commitFile, getCwd } = setupFixtureRepository();
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "producer-stamp-"));
    mockedReadGameVersion.mockResolvedValue(INSTALL_VERSION);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  const writeStamp = (producer: { commit: string; isDirty: boolean; producerPaths: string[] }) => {
    writeJsonFile(join(directory, PROVENANCE_NAME), {
      command: "a",
      gameVersion: INSTALL_VERSION,
      operatingSystem: { platform: "a", release: "a", version: "a" },
      producer,
      sources: [],
      tools: [],
    });
  };

  test("reads no stamp and no commits from an output that has none", async () => {
    expect.hasAssertions();

    await expect(readProducerStaleness(directory)).resolves.toStrictEqual({ commits: [], isApproximate: false });
  });

  test("lists no commits for an output stamped at HEAD", async () => {
    expect.hasAssertions();

    await writeProvenance(directory, { command: "a", producerPaths: [producerPath] });

    const { commits, producer: version } = await readProducerStaleness(directory);

    expect(version?.commit).toBe(runGit(["rev-parse", "HEAD"]).trim());
    expect(version?.producerPaths).toStrictEqual([producerPath]);
    expect(commits).toStrictEqual([]);
  });

  test("reads the recent window as an approximation when the stamp's commit is one git does not know", async () => {
    expect.hasAssertions();

    writeStamp({ commit: unknownCommit, isDirty: false, producerPaths: [producerPath] });

    const { isApproximate } = await readProducerStaleness(directory);

    expect(isApproximate).toBe(true);
  });

  test("a reader reports output made before a later change to its producer", async () => {
    expect.hasAssertions();

    const stampCommit = commitFile(TEST_FILENAME, "");
    const laterCommit = commitFile(TEST_FILENAME, " ");
    const laterShortCommit = runGit(["rev-parse", "--short", laterCommit], getCwd()).trim();
    const producer = { commit: stampCommit, isDirty: false, producerPaths: [TEST_FILENAME] };
    writeStamp(producer);

    await expect(readProducerStaleness(directory, getCwd())).resolves.toStrictEqual({
      commits: [`${laterShortCommit} ${TEST_FILENAME}`],
      isApproximate: false,
      producer,
    });
  });
});
