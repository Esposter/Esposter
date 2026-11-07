import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readGameVersion: mockedReadGameVersion } = vi.hoisted(() => ({
  readGameVersion: vi.fn<() => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: mockedReadGameVersion,
}));

describe(writeStampedFiles, () => {
  const INSTALL_VERSION = "a";
  const COMMAND = "b";
  let directory: string;
  let file: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "stamped-files-"));
    file = join(directory, "record.json");
    mockedReadGameVersion.mockResolvedValue(INSTALL_VERSION);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("removes the sidecar an earlier write left beside the file before the file is written", async () => {
    expect.hasAssertions();

    await writeStampedFiles([file], { command: "earlier", producerPaths: [TEST_FILENAME] }, () => {});
    let hadSidecarWhenWritten = true;

    await writeStampedFiles([file], { command: COMMAND, producerPaths: [TEST_FILENAME] }, () => {
      hadSidecarWhenWritten = existsSync(getSidecarPath(file));
      writeFileSync(file, "new");
    });

    expect(hadSidecarWhenWritten).toBe(false);
  });

  test("a write that fails before its stamp leaves no sidecar beside the file", async () => {
    expect.hasAssertions();

    await writeStampedFiles([file], { command: "earlier", producerPaths: [TEST_FILENAME] }, () => {});

    await expect(
      writeStampedFiles([file], { command: COMMAND, producerPaths: [TEST_FILENAME] }, () => {
        throw new Error(" ");
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    expect(existsSync(getSidecarPath(file))).toBe(false);
  });

  test("stamps every file a write names with the one stamp", async () => {
    expect.hasAssertions();

    const other = join(directory, "other.json");
    await writeStampedFiles([file, other], { command: COMMAND, producerPaths: [TEST_FILENAME] }, () => {
      writeFileSync(file, "a");
      writeFileSync(other, "b");
    });

    const stamp = await readFileProvenance(file);
    expect(stamp?.command).toBe(COMMAND);
    await expect(readFileProvenance(other)).resolves.toStrictEqual(stamp);
  });
});
