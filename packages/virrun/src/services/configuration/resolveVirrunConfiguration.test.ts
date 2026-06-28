import { BackendType } from "@/models/virrun/BackendType";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { VIRRUN_CONFIGURATION_FILENAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = (): string => {
  const dir = mkdtempSync(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  temporaryDirectories.push(dir);
  return dir;
};

describe(resolveVirrunConfiguration, () => {
  afterEach(() => {
    while (temporaryDirectories.length > 0) {
      const dir = temporaryDirectories.pop();
      if (dir !== undefined) rmSync(dir, { force: true, recursive: true });
    }
  });

  test("walks up from a nested cwd to the repo-root config", () => {
    expect.hasAssertions();

    const root = createTemporaryDirectory();
    writeFileSync(join(root, VIRRUN_CONFIGURATION_FILENAME), JSON.stringify({ backend: "os", route: ["vitest"] }));
    const nested = join(root, "packages", "app");
    mkdirSync(nested, { recursive: true });

    expect(resolveVirrunConfiguration(nested)).toStrictEqual({
      backend: BackendType.Os,
      fallback: BackendType.Native,
      route: ["vitest"],
    });
  });

  test("returns undefined when no config exists in the tree", () => {
    expect.hasAssertions();

    expect(resolveVirrunConfiguration(createTemporaryDirectory())).toBeUndefined();
  });
});
