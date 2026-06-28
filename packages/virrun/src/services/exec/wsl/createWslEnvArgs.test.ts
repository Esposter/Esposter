import {
  COREPACK_HOME_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
} from "@/services/exec/util/constants";
import {
  TEST_COREPACK_STORE_PATH_WIN,
  TEST_PNPM_STORE_PATH_WIN,
  TEST_WSL_PREFIX,
} from "@/services/exec/wsl/constants.test";
import { createWslEnvArgs } from "@/services/exec/wsl/createWslEnvArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/wsl/readWslPath"), () => ({
  readWslPath: (path: string) => `${TEST_WSL_PREFIX}${path}`,
}));

describe(createWslEnvArgs, () => {
  test("translates pnpm store paths while preserving scalar env values", () => {
    expect.hasAssertions();

    expect(
      createWslEnvArgs({
        env: {
          [COREPACK_HOME_KEY]: TEST_COREPACK_STORE_PATH_WIN,
          [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
          [PNPM_CONFIG_STORE_DIR_KEY]: TEST_PNPM_STORE_PATH_WIN,
        },
      }),
    ).toStrictEqual([
      `${COREPACK_HOME_KEY}=${TEST_WSL_PREFIX}${TEST_COREPACK_STORE_PATH_WIN}`,
      `${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY}=${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE}`,
      `${PNPM_CONFIG_STORE_DIR_KEY}=${TEST_WSL_PREFIX}${TEST_PNPM_STORE_PATH_WIN}`,
    ]);
  });
});
