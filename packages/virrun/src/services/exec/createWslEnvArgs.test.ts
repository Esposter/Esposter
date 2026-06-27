import {
  COREPACK_HOME_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
} from "@/services/exec/constants";
import { createWslEnvArgs } from "@/services/exec/createWslEnvArgs";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/exec/readWslPath"), () => ({
  readWslPath: (path: string) => `/wsl/${path}`,
}));

describe(createWslEnvArgs, () => {
  test("translates pnpm store paths while preserving scalar env values", () => {
    expect.hasAssertions();

    expect(
      createWslEnvArgs({
        env: {
          [COREPACK_HOME_KEY]: "C:\\repo\\.virrun\\store\\corepack",
          [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
          [PNPM_CONFIG_STORE_DIR_KEY]: "C:\\repo\\.virrun\\store\\pnpm",
        },
      }),
    ).toStrictEqual([
      String.raw`COREPACK_HOME=/wsl/C:\repo\.virrun\store\corepack`,
      `${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY}=${PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE}`,
      String.raw`PNPM_CONFIG_STORE_DIR=/wsl/C:\repo\.virrun\store\pnpm`,
    ]);
  });
});
