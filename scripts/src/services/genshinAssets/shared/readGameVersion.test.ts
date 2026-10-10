import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("readGameVersion", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "readGameVersion-test-"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(directory, { force: true, recursive: true });
  });

  // The game folder is read from the environment when the constants load, so each test loads them again on its own folder
  const importReadGameVersion = async () => {
    vi.stubEnv("GENSHIN_GAME_DIRECTORY", directory);
    vi.resetModules();
    const { readGameVersion } = await import("#src/services/genshinAssets/shared/readGameVersion");
    return readGameVersion;
  };

  test("reads the version from the config beside the executable", async () => {
    expect.hasAssertions();

    writeFileSync(join(directory, "config.ini"), "game_version=a\n");
    const readGameVersion = await importReadGameVersion();

    await expect(readGameVersion()).resolves.toBe("a");
  });

  test("names the remedy when the install root has no config.ini", async () => {
    expect.hasAssertions();

    const readGameVersion = await importReadGameVersion();

    await expect(readGameVersion()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: config.ini, is missing: the install root needs config.ini with game_version=<version>, as the launcher writes it, and a hand-copied install must carry it beside GenshinImpact_Data]`,
    );
  });
});
