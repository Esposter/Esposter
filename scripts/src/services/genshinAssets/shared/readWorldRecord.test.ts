import { readWorldRecord } from "#src/services/genshinAssets/shared/readWorldRecord";
import { writeFileProvenance } from "#src/services/provenance/writeFileProvenance";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { jsonDateParse } from "@esposter/shared";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The world package's data folder is a temporary one for the test, so no record of the repository is read or written
const { WORLD_DATA_ROOT } = await vi.hoisted(async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join: joinPath } = await import("node:path");
  return { WORLD_DATA_ROOT: mkdtempSync(joinPath(tmpdir(), "read-world-record-")) };
});

const { readGameVersion } = vi.hoisted(() => ({ readGameVersion: vi.fn<() => Promise<string>>() }));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({ readGameVersion }));
vi.mock(import("#src/services/genshinAssets/shared/constants"), async (importOriginal) => {
  const { join: joinPath } = await import("node:path");
  return { ...(await importOriginal()), WORLD_DATA_DIRECTORY: joinPath(WORLD_DATA_ROOT, "data") };
});

describe(readWorldRecord, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const RECORD = "regions/liyue.json";
  const RECORD_PATH = join(WORLD_DATA_ROOT, "data", RECORD);

  beforeEach(() => {
    mkdirSync(join(WORLD_DATA_ROOT, "data", "regions"), { recursive: true });
    readGameVersion.mockResolvedValue(INSTALL_VERSION);
    writeJsonFile(RECORD_PATH, { rivers: [] });
  });

  afterEach(() => {
    rmSync(WORLD_DATA_ROOT, { force: true, recursive: true });
  });

  test("a fit refuses a record whose sidecar names another game version", async () => {
    expect.hasAssertions();

    readGameVersion.mockResolvedValueOnce(OTHER_VERSION);
    await writeFileProvenance(RECORD_PATH, { command: "a", producerPaths: [] });

    await expect(readWorldRecord(RECORD)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: liyue.json, is stamped with game b, not the install's a]`,
    );
  });

  test("a fit reads a record whose sidecar names the install's game version", async () => {
    expect.hasAssertions();

    await writeFileProvenance(RECORD_PATH, { command: "a", producerPaths: [] });

    expect(jsonDateParse(await readWorldRecord(RECORD))).toStrictEqual({ rivers: [] });
  });
});
