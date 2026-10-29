import { adoptCabMap } from "#src/services/genshinAssets/blocks/adoptCabMap";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("node:fs"), async (importOriginal) => ({
  ...(await importOriginal()),
  renameSync: vi.fn<() => never>(() => {
    throw Object.assign(new Error("EXDEV: cross-device link not permitted"), { code: "EXDEV" });
  }),
}));

const writeFileAt = (path: string, content: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

describe(adoptCabMap, () => {
  let directory: string;
  let legacyPath: string;
  let cabMapPath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "adopt-cab-map-"));
    legacyPath = join(directory, "Maps", "gi_map.bin");
    cabMapPath = join(directory, "extracted", "maps", "gi_map.bin");
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("moves a map the old Maps folder holds into the parity folder when the parity folder has none", () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "map");

    expect(adoptCabMap(legacyPath, cabMapPath)).toBe(true);
    expect(readFileSync(cabMapPath, "utf8")).toBe("map");
    expect(existsSync(legacyPath)).toBe(false);
  });

  test("moves a map across volumes, where a rename throws EXDEV", () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "map");

    expect(adoptCabMap(legacyPath, cabMapPath)).toBe(true);
    expect(readFileSync(cabMapPath, "utf8")).toBe("map");
    expect(existsSync(legacyPath)).toBe(false);
  });

  test("leaves a map the parity folder already holds, and the old one, alone", () => {
    expect.hasAssertions();

    writeFileAt(legacyPath, "legacy");
    writeFileAt(cabMapPath, "parity");

    expect(adoptCabMap(legacyPath, cabMapPath)).toBe(false);
    expect(readFileSync(cabMapPath, "utf8")).toBe("parity");
    expect(readFileSync(legacyPath, "utf8")).toBe("legacy");
  });

  test("does nothing when neither folder holds a map", () => {
    expect.hasAssertions();

    expect(adoptCabMap(legacyPath, cabMapPath)).toBe(false);
    expect(existsSync(cabMapPath)).toBe(false);
  });
});
