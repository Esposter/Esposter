import { copyFileProvenance } from "#src/services/provenance/copyFileProvenance";
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

describe(copyFileProvenance, () => {
  const INSTALL_VERSION = "a";
  const COMMAND = "b";
  let directory: string;
  let source: string;
  let target: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "copy-provenance-"));
    source = join(directory, "source.bin");
    target = join(directory, "target.bin");
    writeFileSync(source, "s");
    mockedReadGameVersion.mockResolvedValue(INSTALL_VERSION);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("carries the source's sidecar beside the target", async () => {
    expect.hasAssertions();

    await writeStampedFiles([source], { command: COMMAND, producerPaths: [TEST_FILENAME] }, () => {});

    await copyFileProvenance(source, target);

    await expect(readFileProvenance(target)).resolves.toStrictEqual(await readFileProvenance(source));
  });

  test("removes the sidecar the target held when the source has none", async () => {
    expect.hasAssertions();

    writeFileSync(target, "t");
    await writeStampedFiles([target], { command: "earlier", producerPaths: [TEST_FILENAME] }, () => {});

    await copyFileProvenance(source, target);

    expect(existsSync(getSidecarPath(target))).toBe(false);
  });
});
