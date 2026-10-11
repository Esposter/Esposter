import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
} from "#src/services/exec/util/constants";
import { TEST_PNPM_STORE_PATH_WIN, TEST_WSL_PREFIX } from "#src/services/exec/wsl/constants.test";
import { createWslEnvArgs } from "#src/services/exec/wsl/createWslEnvArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(createWslEnvArgs, () => {
  test("translates pnpm store paths while preserving scalar env values", () => {
    expect.hasAssertions();

    expect(
      createWslEnvArgs({
        env: {
          [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
          [PNPM_CONFIG_STORE_DIR_KEY]: TEST_PNPM_STORE_PATH_WIN,
        },
      }),
    ).toStrictEqual([
      `${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY}=${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE}`,
      `${PNPM_CONFIG_STORE_DIR_KEY}=${TEST_WSL_PREFIX}${TEST_PNPM_STORE_PATH_WIN}`,
    ]);
  });
});
