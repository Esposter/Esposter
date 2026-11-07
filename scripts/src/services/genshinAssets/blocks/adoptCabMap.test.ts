import { adoptCabMap } from "#src/services/genshinAssets/blocks/adoptCabMap";
import { checkIsVouchedBy } from "#src/services/provenance/checkIsVouchedBy";
import { getSidecarPath } from "#src/services/provenance/getSidecarPath";
import { readFileProvenance } from "#src/services/provenance/readFileProvenance";
import { writeStampedFiles } from "#src/services/provenance/writeStampedFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { readGameVersion: mockedReadGameVersion } = vi.hoisted(() => ({
  readGameVersion: vi.fn<() => Promise<string>>(),
}));

vi.mock(import("#src/services/genshinAssets/shared/readGameVersion"), () => ({
  readGameVersion: mockedReadGameVersion,
}));

const writeFileAt = (path: string, content: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

describe(adoptCabMap, () => {
  const INSTALL_VERSION = "a";
  const OTHER_VERSION = "b";
  const TOOL_NAME = "c";
  const TOOL_CONTENT = "d";
  let directory: string;
  let legacyPath: string;
  let cabMapPath: string;
  let tool: { name: string; path: string };

  // The old Maps folder's map, stamped with the install's version and the tool's binary the way a map run stamps it
  const stampLegacy = async (): Promise<void> => {
    await writeStampedFiles([legacyPath], { command: "a", producerPaths: [TEST_FILENAME], tools: [tool] }, () => {});
  };

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "adopt-cab-map-"));
    legacyPath = join(directory, "Maps", "gi_map.bin");
    cabMapPath = join(directory, "extracted", "maps", "gi_map.bin");
    tool = { name: TOOL_NAME, path: join(directory, TOOL_NAME) };
    writeFileAt(tool.path, TOOL_CONTENT);
    mockedReadGameVersion.mockResolvedValue(INSTALL_VERSION);
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("moves a stamped map the old Maps folder holds into the parity folder when the parity folder has none", async () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "map");
    await stampLegacy();

    await expect(adoptCabMap(legacyPath, cabMapPath, INSTALL_VERSION, tool)).resolves.toBe(true);
    expect(readFileSync(cabMapPath, "utf8")).toBe("map");
    expect(existsSync(legacyPath)).toBe(false);
    expect(existsSync(getSidecarPath(legacyPath))).toBe(false);
    expect(checkIsVouchedBy(await readFileProvenance(cabMapPath), INSTALL_VERSION)).toBe(true);
  });

  test("leaves an unstamped map in the old Maps folder, so it is mapped again", async () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "map");

    await expect(adoptCabMap(legacyPath, cabMapPath, INSTALL_VERSION, tool)).resolves.toBe(false);
    expect(existsSync(cabMapPath)).toBe(false);
    expect(readFileSync(legacyPath, "utf8")).toBe("map");
  });

  test("leaves a map stamped with another game version in the old Maps folder", async () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "map");
    mockedReadGameVersion.mockResolvedValueOnce(OTHER_VERSION);
    await stampLegacy();

    await expect(adoptCabMap(legacyPath, cabMapPath, INSTALL_VERSION, tool)).resolves.toBe(false);
    expect(existsSync(cabMapPath)).toBe(false);
  });

  test("leaves a map the parity folder already holds, and the old one, alone", async () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "legacy");
    await stampLegacy();
    writeFileAt(cabMapPath, "parity");

    await expect(adoptCabMap(legacyPath, cabMapPath, INSTALL_VERSION, tool)).resolves.toBe(false);
    expect(readFileSync(cabMapPath, "utf8")).toBe("parity");
    expect(readFileSync(legacyPath, "utf8")).toBe("legacy");
  });

  test("does nothing when neither folder holds a map", async () => {
    expect.hasAssertions();

    await expect(adoptCabMap(legacyPath, cabMapPath, INSTALL_VERSION, tool)).resolves.toBe(false);
    expect(existsSync(cabMapPath)).toBe(false);
  });
});
