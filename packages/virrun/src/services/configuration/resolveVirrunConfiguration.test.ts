import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveVirrunConfiguration, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  afterEach(() => {
    cleanup();
  });

  test("walks up from a nested cwd to the repo-root config", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, VIRRUN_CONFIGURATION_FILENAME), JSON.stringify({ backend: BackendType.Os }));
    const nested = join(root, TEST_FILENAME, TEST_FILENAME);
    mkdirSync(nested, { recursive: true });

    expect(resolveVirrunConfiguration(nested)).toStrictEqual({
      backend: BackendType.Os,
      environment: Environment.None,
    });
  });

  test("returns undefined when no config exists in the tree", () => {
    expect.hasAssertions();

    expect(resolveVirrunConfiguration(create())).toBeUndefined();
  });
});
