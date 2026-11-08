import { NO_GAME_VERSION } from "#src/services/gameVersion/constants";
import { createStamp } from "#src/services/gameVersion/createStamp.test";
import { readStaleRows } from "#src/services/gameVersion/readStaleRows";
import { PROVENANCE_NAME } from "#src/services/provenance/constants";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readStaleRows, () => {
  const INSTALL_VERSION = "7.1.0";
  const OLD_VERSION = "7.0.0";
  const COMMAND = "extract windrise";
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "readStaleRows-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("an output stamped with another game version is listed under its command", async () => {
    expect.hasAssertions();

    const folder = join(directory, "windrise");
    mkdirSync(folder);
    writeFileSync(join(folder, PROVENANCE_NAME), JSON.stringify(createStamp(COMMAND, OLD_VERSION)));

    await expect(readStaleRows(INSTALL_VERSION, [directory], [])).resolves.toStrictEqual([
      { command: COMMAND, gameVersions: [OLD_VERSION], outputCount: 1 },
    ]);
  });

  test("a current install lists nothing", async () => {
    expect.hasAssertions();

    const folder = join(directory, "windrise");
    mkdirSync(folder);
    writeFileSync(join(folder, PROVENANCE_NAME), JSON.stringify(createStamp(COMMAND, INSTALL_VERSION)));

    await expect(readStaleRows(INSTALL_VERSION, [directory], [])).resolves.toStrictEqual([]);
  });

  test("a stamp that cannot be read is listed with no game version", async () => {
    expect.hasAssertions();

    const folder = join(directory, "windrise");
    const stampPath = join(folder, PROVENANCE_NAME);
    mkdirSync(folder);
    writeFileSync(stampPath, "{");

    await expect(readStaleRows(INSTALL_VERSION, [directory], [])).resolves.toStrictEqual([
      { command: `unreadable stamp at ${stampPath}`, gameVersions: [NO_GAME_VERSION], outputCount: 1 },
    ]);
  });
});
