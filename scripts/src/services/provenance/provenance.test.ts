import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { readProvenance } from "#src/services/provenance/readProvenance";
import { readVouchedProvenance } from "#src/services/provenance/readVouchedProvenance";
import { writeProvenance } from "#src/services/provenance/writeProvenance";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { runGit } from "#src/services/shared/runGit";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { platform, release, tmpdir, version } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readGameVersion: mockedReadGameVersion } = vi.hoisted(() => ({
  readGameVersion: vi.fn<() => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: mockedReadGameVersion,
}));

describe(writeProvenance, () => {
  const INSTALL_VERSION = "a";
  const COMMAND = "b";
  const TOOL_NAME = "c";
  const TOOL_CONTENT = "d";
  const SOURCES = [
    { commit: "f", name: "e" },
    { name: "g", sha256: "h" },
  ];
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "provenance-"));
    mockedReadGameVersion.mockResolvedValue(INSTALL_VERSION);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("a written export carries its stamp beside it", async () => {
    expect.hasAssertions();

    const toolPath = join(directory, TOOL_NAME);
    writeFileSync(toolPath, TOOL_CONTENT);

    await writeProvenance(directory, {
      command: COMMAND,
      producerPaths: [TEST_FILENAME],
      sources: SOURCES,
      tools: [{ name: TOOL_NAME, path: toolPath }],
    });

    await expect(readProvenance(directory)).resolves.toStrictEqual({
      command: COMMAND,
      gameVersion: INSTALL_VERSION,
      operatingSystem: { platform: platform(), release: release(), version: version() },
      producer: { commit: runGit(["rev-parse", "HEAD"]).trim(), isDirty: false, producerPaths: [TEST_FILENAME] },
      sources: SOURCES,
      tools: [{ name: TOOL_NAME, sha256: createHash("sha256").update(TOOL_CONTENT).digest("hex") }],
    });
  });

  test("a file output carries its stamp in a sidecar beside it", async () => {
    expect.hasAssertions();

    const file = join(directory, TEST_FILENAME);
    writeFileSync(file, COMMAND);

    await writeStampedFiles([file], { command: COMMAND, producerPaths: [TEST_FILENAME] }, () => {});

    expect(existsSync(join(directory, `${TEST_FILENAME}${PROVENANCE_SIDECAR_SUFFIX}`))).toBe(true);
    expect((await readFileProvenance(file))?.command).toBe(COMMAND);
    await expect(readProvenance(directory)).resolves.toBeUndefined();
  });
});

describe(readProvenance, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const EXPORT_NAME = "export";
  let root: string;
  let directory: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "provenance-"));
    directory = join(root, EXPORT_NAME);
  });

  afterEach(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("a fit refuses an export stamped with another game version", async () => {
    expect.hasAssertions();

    mockedReadGameVersion.mockResolvedValue(OTHER_VERSION);
    await writeProvenance(directory, { command: "a", producerPaths: [TEST_FILENAME] });

    await expect(readVouchedProvenance(directory, INSTALL_VERSION)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: export, is stamped with game b, not the install's a]`,
    );
    expect(checkIsVouchedBy(await readProvenance(directory), INSTALL_VERSION)).toBe(false);
  });

  test("a fit refuses an export with no stamp", async () => {
    expect.hasAssertions();

    await expect(readVouchedProvenance(directory, INSTALL_VERSION)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: export, has no provenance stamp, so its game version is unknown]`,
    );
  });
});
